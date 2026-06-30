using VirTrade.Core.Entities;
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

            // Condition de match : bid existe, ask existe, bid >= ask
            if (bid == null || ask == null)
                break;

            var prixBid = bid.PrixLimite ?? decimal.MaxValue;
            var prixAsk = ask.PrixLimite ?? decimal.MinValue;

            if (prixBid < prixAsk)
                break;

            // Prix d'exécution = resting order (ask = celui qui était déjà dans le book)
            var prixExecution = ask.PrixLimite ?? nouvelOrdre.Stock.PrixActuel;

            // Quantité : le minimum des deux quantités restantes
            var qteBid = bid.Quantite - bid.QuantiteExecutee;
            var qteAsk = ask.Quantite - ask.QuantiteExecutee;
            var qteMatch = Math.Min(qteBid, qteAsk);

            // 1. Créer le trade
            var trade = new Trade
            {
                Quantite        = qteMatch,
                PrixExecution   = prixExecution,
                BuyOrderId      = bid.Id,
                BuyOrder        = bid,
                SellOrderId     = ask.Id,
                SellOrder       = ask,
                StockId         = nouvelOrdre.StockId,
                Stock           = nouvelOrdre.Stock,
                ExecutedAt      = DateTime.UtcNow
            };

            // 2. Mettre à jour les quantités exécutées
            bid.QuantiteExecutee += qteMatch;
            ask.QuantiteExecutee += qteMatch;

            // 3. Mettre à jour les statuts
            bid.Statut = bid.QuantiteExecutee >= bid.Quantite ? "FILLED" : "PARTIAL";
            ask.Statut = ask.QuantiteExecutee >= ask.Quantite ? "FILLED" : "PARTIAL";

            // 4. Retirer les ordres remplis du book
            if (bid.Statut == "FILLED") orderBookService.Retirer(bid);
            if (ask.Statut == "FILLED") orderBookService.Retirer(ask);

            // 5. Persister tout en DB (trade + ordres + positions + portefeuilles + stock + OHLC)
            await repository.PersisterTradeAsync(trade, bid, ask, qteMatch, prixExecution);

            tradesExecutes.Add(trade);

            // 6. Notifier les clients SignalR
            await notifier.NotifierNouveauTradeAsync(trade);
            await notifier.NotifierPrixUpdateAsync(nouvelOrdre.Stock.Symbole, prixExecution);
            await notifier.NotifierOrderBookAsync(
                nouvelOrdre.Stock.Symbole,
                new { Bids = book.GetBids(), Asks = book.GetAsks() }
            );
        }

        return tradesExecutes;
    }
}