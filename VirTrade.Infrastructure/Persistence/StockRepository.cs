using Microsoft.EntityFrameworkCore;
using VirTrade.Core.Entities;
using VirTrade.Core.Interfaces;
using VirTrade.Infrastructure.Persistence;

namespace VirTrade.Infrastructure.Persistence;

public class StockRepository : IStockRepository
{
    private readonly AppDbContext _db;

    public StockRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<Stock>> GetAllAsync()
        => await _db.Stocks.AsNoTracking().ToListAsync();
    
    public async Task<List<Stock>> GetAllForSimulatorAsync()
        => await _db.Stocks
            .AsNoTracking()
            .Select(s => new Stock 
            { 
                Id = s.Id,
                Symbole = s.Symbole,
                NomComplet = s.NomComplet,
                PrixActuel = s.PrixActuel, 
                Volatilite = s.Volatilite 
            })
            .ToListAsync();

    public async Task<Stock?> GetByIdAsync(int stockId)
        => await _db.Stocks.FindAsync(stockId);

    public async Task<List<HistoriquePrix>> GetHistoriqueAsync(string symbole, int limit = 240)
    {
        var stockId = await _db.Stocks
            .Where(s => s.Symbole.ToLower() == symbole.ToLower())
            .Select(s => s.Id)
            .FirstOrDefaultAsync();

        if (stockId == 0) return new List<HistoriquePrix>();

        // Le simulateur insère un tick toutes les 3s (~20 ticks/minute).
        // On récupère assez de ticks pour couvrir les 'limit' minutes.
        var rawHistory = await _db.HistoriquesPrix
            .Where(h => h.StockId == stockId)
            .OrderByDescending(h => h.Timestamp)
            .Take(limit * 20)
            .AsNoTracking()
            .ToListAsync();

        // Aggrégation en mémoire en bougies d'1 minute (OHLC)
        var aggregated = rawHistory
            .GroupBy(h => new DateTime(h.Timestamp.Year, h.Timestamp.Month, h.Timestamp.Day, h.Timestamp.Hour, h.Timestamp.Minute, 0, DateTimeKind.Utc))
            .Select(g => 
            {
                var ordered = g.OrderBy(h => h.Timestamp).ToList();
                return new HistoriquePrix
                {
                    StockId = stockId,
                    Timestamp = g.Key,
                    Open = ordered.First().Open,
                    High = g.Max(h => h.High),
                    Low = g.Min(h => h.Low),
                    Close = ordered.Last().Close,
                    Volume = g.Sum(h => h.Volume)
                };
            })
            .OrderBy(h => h.Timestamp)
            .TakeLast(limit)
            .ToList();

        return aggregated;
    }

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
        await _db.Stocks
            .Where(s => s.Id == stockId)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.PrixActuel, nouveauPrix));
    }

    public async Task EnregistrerHistoriqueAsync(int stockId, decimal prix)
    {
        _db.HistoriquesPrix.Add(new HistoriquePrix
        {
            Open = prix,
            High = prix,
            Low = prix,
            Close = prix,
            Volume = 0,
            Timestamp = DateTime.UtcNow,
            StockId = stockId
        });
        await _db.SaveChangesAsync();
    }

    public async Task EnregistrerHistoriquesAsync(List<HistoriquePrix> historiques)
    {
        _db.HistoriquesPrix.AddRange(historiques);
        await _db.SaveChangesAsync();
    }
}