using VirTrade.Core.Entities;
using VirTrade.Core.Interfaces;

namespace VirTrade.Core.Services;

// TEMPORAIRE - à supprimer quand le vrai StockRepository (AppDbContext) sera prêt
public class FakeStockRepository : IStockRepository
{
    private readonly List<Stock> _stocks = new()
    {
        new Stock { Id = 1, Symbole = "AAPL", NomComplet = "Apple Inc.", PrixActuel = 150.00m, Volatilite = 0.015m },
        new Stock { Id = 2, Symbole = "TSLA", NomComplet = "Tesla Inc.", PrixActuel = 250.00m, Volatilite = 0.025m }
    };

    public Task<List<Stock>> GetAllAsync() => Task.FromResult(_stocks);

    public Task UpdatePrixAsync(int stockId, decimal nouveauPrix)
    {
        var stock = _stocks.FirstOrDefault(s => s.Id == stockId);
        if (stock != null) stock.PrixActuel = nouveauPrix;
        return Task.CompletedTask;
    }

    public Task EnregistrerHistoriqueAsync(int stockId, decimal prix)
    {
        var stock = _stocks.FirstOrDefault(s => s.Id == stockId);
        if (stock != null)
        {
            stock.HistoriquePrix.Add(new HistoriquePrix
            {
                Open = prix,
                High = prix,
                Low = prix,
                Close = prix,
                Volume = 0,
                Timestamp = DateTime.UtcNow,
                Stock = stock
            });
        }
        return Task.CompletedTask;
    }
}