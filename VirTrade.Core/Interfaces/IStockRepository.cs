using VirTrade.Core.Entities;

namespace VirTrade.Core.Interfaces;

public interface IStockRepository
{
    Task<List<Stock>> GetAllAsync();
    Task UpdatePrixAsync(int stockId, decimal nouveauPrix);
    Task EnregistrerHistoriqueAsync(int stockId, decimal prix);

    // Ajouts pour AdminController (J5)
    Task<Stock?> GetByIdAsync(int stockId);
    Task<Stock> AddAsync(Stock stock);
    Task UpdateAsync(Stock stock);
    Task DeleteAsync(int stockId);
}