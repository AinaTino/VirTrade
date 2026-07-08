using Microsoft.EntityFrameworkCore;
using VirTrade.Core.Entities;
using VirTrade.Core.Enums;
using VirTrade.Core.Interfaces;

namespace VirTrade.Infrastructure.Persistence;

public class OrdersRepository(AppDbContext db) : IOrdersRepository
{
    public async Task<Stock?> GetStockAsync(string symbole)
        => await db.Stocks.FirstOrDefaultAsync(s => s.Symbole == symbole);

    public async Task<Utilisateur> GetUtilisateurAsync(int userId)
        => await db.Utilisateurs.FindAsync(userId)
           ?? throw new InvalidOperationException($"Utilisateur {userId} introuvable.");

    public async Task<string?> ValiderFondsAsync(
        int userId, SensOrdre sens, int quantite, decimal prixActuel, int stockId)
    {
        var portefeuille = await db.Portefeuilles
            .Include(p => p.Positions)
            .FirstOrDefaultAsync(p => p.UtilisateurId == userId);

        if (portefeuille == null)
            return "Portefeuille introuvable.";

        if (sens == SensOrdre.Buy)
        {
            var coutTotal = quantite * prixActuel;
            if (portefeuille.SoldeCash < coutTotal)
                return $"Solde insuffisant. Requis : {coutTotal:C}, Disponible : {portefeuille.SoldeCash:C}";
        }
        else
        {
            var position = portefeuille.Positions.FirstOrDefault(p => p.StockId == stockId);
            var qteDispo = position?.QuantiteDetenue ?? 0;

            if (qteDispo < quantite)
                return $"Actions insuffisantes. Requis : {quantite}, Disponible : {qteDispo}";
        }

        return null;
    }

    public async Task InsererOrdreAsync(Ordre ordre)
    {
        db.Ordres.Add(ordre);
        await db.SaveChangesAsync();
    }

    public async Task<List<Ordre>> GetOrdresUtilisateurAsync(int userId, string? statut)
    {
        var query = db.Ordres
            .Where(o => o.UtilisateurId == userId)
            .Include(o => o.Stock)
            .AsQueryable();

        if (!string.IsNullOrEmpty(statut) && Enum.TryParse<StatutOrdre>(statut, true, out var statutEnum))
            query = query.Where(o => o.Statut == statutEnum);

        return await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
    }

    public async Task<Ordre?> GetOrdreAsync(int id)
        => await db.Ordres
            .Include(o => o.Stock)
            .Include(o => o.Utilisateur)
            .FirstOrDefaultAsync(o => o.Id == id);

    public async Task MettreAJourOrdreAsync(Ordre ordre)
    {
        db.Ordres.Update(ordre);
        await db.SaveChangesAsync();
    }
}