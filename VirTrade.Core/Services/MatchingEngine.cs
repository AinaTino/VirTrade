using VirTrade.Core.Entities;
using VirTrade.Core.Enums;
using VirTrade.Core.Interfaces;

namespace VirTrade.Core.Services;

public class MatchingEngine(
    IOrderBookService orderBookService,
    IMatchingRepository repository,
    ISignalRNotifier notifier) : IMatchingEngine
{
    public async Task<List<Trade>> ExecuterAsync(Ordre nouvelOrdre)
    {
        var tradesExecutes = new List<Trade>();
        var book = orderBookService.GetBook(nouvelOrdre.Stock.Symbole);

        while (true)
        {
            var bid = book.MeilleurBid();
            var ask = book.MeilleurAsk();

            if (bid == null || ask == null)
                break;

            var prixBid = bid.PrixLimite ?? decimal.MaxValue;
            var prixAsk = ask.PrixLimite ?? decimal.MinValue;

            if (prixBid < prixAsk)
                break;

            var prixExecution = ask.PrixLimite ?? nouvelOrdre.Stock.PrixActuel;
            var qteBid        = bid.QuantiteRestante();
            var qteAsk        = ask.QuantiteRestante();
            var qteMatch      = Math.Min(qteBid, qteAsk);

            var trade = new Trade
            {
                Quantite      = qteMatch,
                PrixExecution = prixExecution,
                BuyOrderId    = bid.Id,
                BuyOrder      = bid,
                SellOrderId   = ask.Id,
                SellOrder     = ask,
                StockId       = nouvelOrdre.StockId,
                Stock         = nouvelOrdre.Stock,
                ExecutedAt    = DateTime.UtcNow
            };

            bid.QuantiteExecutee += qteMatch;
            ask.QuantiteExecutee += qteMatch;

            bid.Statut = bid.QuantiteExecutee >= bid.Quantite ? StatutOrdre.Filled : StatutOrdre.Partial;
            ask.Statut = ask.QuantiteExecutee >= ask.Quantite ? StatutOrdre.Filled : StatutOrdre.Partial;

            if (bid.Statut == StatutOrdre.Filled) orderBookService.Retirer(bid);
            if (ask.Statut == StatutOrdre.Filled) orderBookService.Retirer(ask);

            await repository.PersisterTradeAsync(trade, bid, ask, qteMatch, prixExecution);

            // Appliquer le market impact sur le prix du stock
            var nouveauPrix = AppliquerMarketImpact(prixExecution, qteMatch, nouvelOrdre.SensOrdre);
            nouvelOrdre.Stock.PrixActuel = nouveauPrix;

            tradesExecutes.Add(trade);

            await notifier.NotifierNouveauTradeAsync(trade);
            await notifier.NotifierPrixUpdateAsync(nouvelOrdre.Stock.Symbole, nouveauPrix);
            await notifier.NotifierOrderBookAsync(
                nouvelOrdre.Stock.Symbole,
                new
                {
                    symbole = nouvelOrdre.Stock.Symbole,
                    bids = book.GetBids(),
                    asks = book.GetAsks(),
                    spread = book.Spread(),
                    timestamp = DateTime.UtcNow
                }
            );
        }

        return tradesExecutes;
    }
    
    public async Task<List<Trade>> VerifierLimitOrdersAsync(string symbole, decimal nouveauPrix)
    {
        var tradesExecutes = new List<Trade>();
        var book = orderBookService.GetBook(symbole);

        // Vérifier les bids devenus exécutables (Limit BUY dont prix >= nouveauPrix)
        foreach (var bid in book.GetBids().Where(o => o.EstExecutable(nouveauPrix)))
        {
            var trades = await ExecuterAsync(bid);
            tradesExecutes.AddRange(trades);
        }

        // Vérifier les asks devenus exécutables (Limit SELL dont prix <= nouveauPrix)
        foreach (var ask in book.GetAsks().Where(o => o.EstExecutable(nouveauPrix)))
        {
            var trades = await ExecuterAsync(ask);
            tradesExecutes.AddRange(trades);
        }

        return tradesExecutes;
    }

    // Calibrable via ConfigMarche(cle='market_impact_coeff')
    private static decimal AppliquerMarketImpact(decimal prixActuel, int volumeTrade, SensOrdre sens)
    {
        decimal coefficientImpact = 0.001m;
        decimal impact = (volumeTrade / 1000m) * coefficientImpact;

        return sens == SensOrdre.Buy
            ? prixActuel * (1 + impact)
            : prixActuel * (1 - impact);
    }
}