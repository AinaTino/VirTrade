using VirTrade.Core.Entities;
using VirTrade.Core.Enums;

namespace VirTrade.Core.Interfaces;

public interface IOrdersRepository
{
    Task<Stock?> GetStockAsync(string symbole);
    Task<Utilisateur> GetUtilisateurAsync(int userId);
    Task<string?> ValiderFondsAsync(int userId, SensOrdre sens, int quantite, decimal prixActuel);
    Task InsererOrdreAsync(Ordre ordre);
    Task<List<Ordre>> GetOrdresUtilisateurAsync(int userId, string? statut);
    Task<Ordre?> GetOrdreAsync(int id);
    Task MettreAJourOrdreAsync(Ordre ordre);
}