using Microsoft.EntityFrameworkCore;
using VirTrade.Core.Entities;
using VirTrade.Core.Enums;
using VirTrade.Core.Interfaces;

namespace VirTrade.Infrastructure.Persistence;

public class MatchingRepository(AppDbContext db) : IMatchingRepository
{
    public async Task PersisterTradeAsync(
        Trade trade, Ordre bid, Ordre ask, int qteMatch, decimal prixExecution)
    {
        await using var transaction = await db.Database.BeginTransactionAsync();

        try
        {
            // 1. INSERT trade
            db.Trades.Add(trade);

            // 2. UPDATE bid + ask (déjà trackés par EF via OrderBookService)
            db.Ordres.Update(bid);
            db.Ordres.Update(ask);

            // 3. UPDATE position acheteur
            var positionAcheteur = await db.Positions
                .FirstOrDefaultAsync(p => p.PortefeuilleId == bid.UtilisateurId
                                       && p.StockId == bid.StockId);

            if (positionAcheteur == null)
            {
                positionAcheteur = new Position
                {
                    PortefeuilleId  = await ObtenirPortefeuilleIdAsync(bid.UtilisateurId),
                    StockId         = bid.StockId,
                    QuantiteDetenue = 0,
                    PrixMoyenAchat  = 0
                };
                db.Positions.Add(positionAcheteur);
            }

            positionAcheteur.MettreAJour(qteMatch, prixExecution);

            // 4. UPDATE position vendeur
            var positionVendeur = await db.Positions
                .FirstOrDefaultAsync(p => p.PortefeuilleId == ask.UtilisateurId
                                       && p.StockId == ask.StockId);

            if (positionVendeur != null)
                positionVendeur.MettreAJour(-qteMatch, prixExecution);

            // 5. UPDATE portefeuille acheteur → SoldeCash -= qte × prix
            var portefeuilleAcheteur = await db.Portefeuilles
                .FirstOrDefaultAsync(p => p.UtilisateurId == bid.UtilisateurId);

            if (portefeuilleAcheteur != null)
                portefeuilleAcheteur.SoldeCash -= qteMatch * prixExecution;

            // 6. UPDATE portefeuille vendeur → SoldeCash += qte × prix
            var portefeuilleVendeur = await db.Portefeuilles
                .FirstOrDefaultAsync(p => p.UtilisateurId == ask.UtilisateurId);

            if (portefeuilleVendeur != null)
                portefeuilleVendeur.SoldeCash += qteMatch * prixExecution;

            // 7. UPDATE stock.PrixActuel
            var stock = await db.Stocks.FindAsync(bid.StockId);
            if (stock != null)
                stock.PrixActuel = prixExecution;

            // 8. INSERT/UPDATE HistoriquePrix OHLC (période = minute courante)
            await PersisterOhlcAsync(bid.StockId, prixExecution, qteMatch);

            await db.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private async Task<int> ObtenirPortefeuilleIdAsync(int utilisateurId)
    {
        var portefeuille = await db.Portefeuilles
            .FirstOrDefaultAsync(p => p.UtilisateurId == utilisateurId);

        return portefeuille?.Id
            ?? throw new InvalidOperationException(
                $"Portefeuille introuvable pour l'utilisateur {utilisateurId}");
    }

    private async Task PersisterOhlcAsync(int stockId, decimal prix, int volume)
    {
        // Période = minute courante (truncate à la minute)
        var periode = new DateTime(
            DateTime.UtcNow.Year, DateTime.UtcNow.Month, DateTime.UtcNow.Day,
            DateTime.UtcNow.Hour, DateTime.UtcNow.Minute, 0, DateTimeKind.Utc);

        var ohlc = await db.HistoriquesPrix
            .FirstOrDefaultAsync(h => h.StockId == stockId && h.Timestamp == periode);

        if (ohlc == null)
        {
            db.HistoriquesPrix.Add(new HistoriquePrix
            {
                StockId   = stockId,
                Timestamp = periode,
                Open      = prix,
                High      = prix,
                Low       = prix,
                Close     = prix,
                Volume    = volume
            });
        }
        else
        {
            if (prix > ohlc.High) ohlc.High = prix;
            if (prix < ohlc.Low)  ohlc.Low  = prix;
            ohlc.Close  = prix;
            ohlc.Volume += volume;
        }
    }
}