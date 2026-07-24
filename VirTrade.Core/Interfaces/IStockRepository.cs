using VirTrade.Core.Entities;

namespace VirTrade.Core.Interfaces;

public interface IStockRepository
{
    Task<List<Stock>> GetAllAsync();
    Task<List<Stock>> GetAllForSimulatorAsync();
    Task UpdatePrixAsync(int stockId, decimal nouveauPrix);
    Task EnregistrerHistoriqueAsync(int stockId, decimal prix);
    
    /// <summary>Enregistre plusieurs historiques de prix en une seule transaction</summary>
    Task EnregistrerHistoriquesAsync(List<HistoriquePrix> historiques);

    // Ajouts pour AdminController (J5)
    Task<Stock?> GetByIdAsync(int stockId);
    Task<List<HistoriquePrix>> GetHistoriqueAsync(string symbole, int limit = 240);
    Task<Stock> AddAsync(Stock stock);
    Task UpdateAsync(Stock stock);
    Task DeleteAsync(int stockId);
}