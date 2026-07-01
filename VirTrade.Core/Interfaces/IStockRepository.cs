using VirTrade.Core.Entities;

namespace VirTrade.Core.Interfaces;

public interface IStockRepository
{
    Task<List<Stock>> GetAllAsync();
    Task UpdatePrixAsync(int stockId, decimal nouveauPrix);
}