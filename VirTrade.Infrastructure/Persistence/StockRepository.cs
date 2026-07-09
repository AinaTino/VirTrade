using Microsoft.EntityFrameworkCore;
using VirTrade.Core.Entities;
using VirTrade.Core.Interfaces;
using VirTrade.Infrastructure.Persistence;

namespace VirTrade.Infrastructure.Persistence.Repositories;

public class StockRepository : IStockRepository
{
    private readonly AppDbContext _db;

    public StockRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Stock>> GetAllAsync()
        => await _db.Stocks.ToListAsync();

    public async Task<Stock?> GetByIdAsync(int stockId)
        => await _db.Stocks.FindAsync(stockId);

    public async Task<Stock> AddAsync(Stock stock)
    {
        _db.Stocks.Add(stock);
        await _db.SaveChangesAsync();
        return stock;
    }

    public async Task UpdateAsync(Stock stock)
    {
        _db.Stocks.Update(stock);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int stockId)
    {
        var stock = await _db.Stocks.FindAsync(stockId);
        if (stock != null)
        {
            _db.Stocks.Remove(stock);
            await _db.SaveChangesAsync();
        }
    }

    public async Task UpdatePrixAsync(int stockId, decimal nouveauPrix)
    {
        var stock = await _db.Stocks.FindAsync(stockId);
        if (stock != null)
        {
            stock.PrixActuel = nouveauPrix;
            await _db.SaveChangesAsync();
        }
    }

    public async Task EnregistrerHistoriqueAsync(int stockId, decimal prix)
    {
        var stock = await _db.Stocks.FindAsync(stockId);
        if (stock != null)
        {
            _db.HistoriquesPrix.Add(new HistoriquePrix
            {
                Open = prix,
                High = prix,
                Low = prix,
                Close = prix,
                Volume = 0,
                Timestamp = DateTime.UtcNow,
                StockId = stockId,
                Stock = stock
            });
            await _db.SaveChangesAsync();
        }
    }
}