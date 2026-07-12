using Microsoft.EntityFrameworkCore;
using VirTrade.Core.Entities;
using VirTrade.Core.Enums;
using VirTrade.Core.Interfaces;

namespace VirTrade.Infrastructure.Persistence;

public class MatchingRepository(AppDbContext db, ISignalRNotifier notifier) : IMatchingRepository
{
    private readonly ISignalRNotifier _notifier = notifier;

    public async Task PersisterTradeAsync(
        Trade trade, Ordre bid, Ordre ask, int qteMatch, decimal prixExecution)
    {
        await using var transaction = await db.Database.BeginTransactionAsync();

        try
        {
            var bidTracke = await db.Ordres
                .FirstAsync(o => o.Id == bid.Id);
            var askTracke = await db.Ordres
                .FirstAsync(o => o.Id == ask.Id);
            var stockTracke = await db.Stocks
                .FirstAsync(s => s.Id == bid.StockId);

            bidTracke.QuantiteExecutee = bid.QuantiteExecutee;
            bidTracke.Statut = bid.Statut;
            askTracke.QuantiteExecutee = ask.QuantiteExecutee;
            askTracke.Statut = ask.Statut;

            trade.BuyOrder = bidTracke;
            trade.SellOrder = askTracke;
            trade.Stock = stockTracke;

            // 1. INSERT trade
            db.Trades.Add(trade);

            var isSingleSideExecution = bid.Id == ask.Id && bid.UtilisateurId == ask.UtilisateurId;

            if (!isSingleSideExecution)
            {
                var portefeuilleAcheteurId = await ObtenirPortefeuilleIdAsync(bid.UtilisateurId);
                var portefeuilleVendeurId = await ObtenirPortefeuilleIdAsync(ask.UtilisateurId);

                // 3. UPDATE position acheteur
                var positionAcheteur = await db.Positions
                    .FirstOrDefaultAsync(p => p.PortefeuilleId == portefeuilleAcheteurId
                                           && p.StockId == bid.StockId);

                if (positionAcheteur == null)
                {
                    positionAcheteur = new Position
                    {
                        PortefeuilleId  = portefeuilleAcheteurId,
                        StockId         = bid.StockId,
                        QuantiteDetenue = 0,
                        PrixMoyenAchat  = 0
                    };
                    db.Positions.Add(positionAcheteur);
                }

                positionAcheteur.MettreAJour(qteMatch, prixExecution);

                // 4. UPDATE position vendeur
                var positionVendeur = await db.Positions
                    .FirstOrDefaultAsync(p => p.PortefeuilleId == portefeuilleVendeurId
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
            }
            else
            {
                var portefeuilleUtilisateur = await db.Portefeuilles
                    .FirstOrDefaultAsync(p => p.UtilisateurId == bid.UtilisateurId);

                if (portefeuilleUtilisateur == null)
                    throw new InvalidOperationException($"Portefeuille introuvable pour l'utilisateur {bid.UtilisateurId}");

                if (bid.SensOrdre == SensOrdre.Buy)
                {
                    var positionAcheteur = await db.Positions
                        .FirstOrDefaultAsync(p => p.PortefeuilleId == portefeuilleUtilisateur.Id
                                               && p.StockId == bid.StockId);

                    if (positionAcheteur == null)
                    {
                        positionAcheteur = new Position
                        {
                            PortefeuilleId  = portefeuilleUtilisateur.Id,
                            StockId         = bid.StockId,
                            QuantiteDetenue = 0,
                            PrixMoyenAchat  = 0
                        };
                        db.Positions.Add(positionAcheteur);
                    }

                    positionAcheteur.MettreAJour(qteMatch, prixExecution);
                    portefeuilleUtilisateur.SoldeCash -= qteMatch * prixExecution;
                }
                else
                {
                    var positionVendeur = await db.Positions
                        .FirstOrDefaultAsync(p => p.PortefeuilleId == portefeuilleUtilisateur.Id
                                               && p.StockId == bid.StockId);

                    if (positionVendeur != null)
                        positionVendeur.MettreAJour(-qteMatch, prixExecution);

                    portefeuilleUtilisateur.SoldeCash += qteMatch * prixExecution;
                }
            }

            // 7. UPDATE stock.PrixActuel
            stockTracke.PrixActuel = prixExecution;

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

        await NotifierPortefeuilleAsync(bid.UtilisateurId);
        if (ask.UtilisateurId != bid.UtilisateurId)
            await NotifierPortefeuilleAsync(ask.UtilisateurId);
    }

    private async Task NotifierPortefeuilleAsync(int utilisateurId)
    {
        var portefeuille = await db.Portefeuilles
            .AsNoTracking()
            .Include(p => p.Positions)
                .ThenInclude(pos => pos.Stock)
            .FirstOrDefaultAsync(p => p.UtilisateurId == utilisateurId);

        if (portefeuille == null)
            return;

        var configCapital = await db.ConfigsMarche
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Cle == "capital_initial");

        decimal capitalInitial = configCapital != null
            ? decimal.Parse(configCapital.Valeur)
            : 100000m;

        var valeurPositions = portefeuille.Positions
            .Sum(pos => pos.QuantiteDetenue * pos.Stock.PrixActuel);

        var valeurTotale = portefeuille.SoldeCash + valeurPositions;
        var pnl = valeurTotale - capitalInitial;
        var pnlPourcentage = capitalInitial == 0 ? 0 : Math.Round((pnl / capitalInitial) * 100, 2);

        await _notifier.NotifierPortefeuilleAsync(utilisateurId, new
        {
            soldeCash = portefeuille.SoldeCash,
            valeurPositions,
            valeurTotale,
            capitalInitial,
            pnl,
            pnlPourcentage,
            positions = portefeuille.Positions.Select(pos => new
            {
                stockId = pos.StockId,
                symbole = pos.Stock.Symbole,
                nomComplet = pos.Stock.NomComplet,
                quantiteDetenue = pos.QuantiteDetenue,
                prixMoyenAchat = pos.PrixMoyenAchat,
                prixActuel = pos.Stock.PrixActuel,
                valeur = pos.QuantiteDetenue * pos.Stock.PrixActuel,
                pnlPosition = (pos.Stock.PrixActuel - pos.PrixMoyenAchat) * pos.QuantiteDetenue
            })
        });
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
