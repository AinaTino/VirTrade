using Microsoft.Extensions.DependencyInjection;
using VirTrade.Core.Entities;
using VirTrade.Core.Interfaces;

namespace VirTrade.Core.Services;

public class MarketSimulator : IMarketSimulator
{
    private readonly IServiceScopeFactory _scopeFactory;
    private const int TickIntervalMs = 3000;

    public MarketSimulator(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public async Task DemarrerAsync(CancellationToken ct)
    {
        // Délai initial pour permettre au serveur de démarrer correctement
        await Task.Delay(2000, ct);
        
        while (!ct.IsCancellationRequested)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var stockRepository = scope.ServiceProvider.GetRequiredService<IStockRepository>();
                var matchingEngine = scope.ServiceProvider.GetRequiredService<IMatchingEngine>();
                var orderRepository = scope.ServiceProvider.GetRequiredService<IOrderRepository>();

                var stocks = await stockRepository.GetAllForSimulatorAsync();

                // Regroupe les mises à jour de prix et les historiques
                var prixUpdates = new Dictionary<int, decimal>();
                var historiquesPrix = new List<HistoriquePrix>();

                foreach (var stock in stocks)
                {
                    decimal nouveauPrix = GenererPrix(stock.PrixActuel, stock.Volatilite);
                    prixUpdates[stock.Id] = nouveauPrix;
                    
                    historiquesPrix.Add(new HistoriquePrix
                    {
                        Open = nouveauPrix,
                        High = nouveauPrix,
                        Low = nouveauPrix,
                        Close = nouveauPrix,
                        Volume = 0,
                        Timestamp = DateTime.UtcNow,
                        StockId = stock.Id
                    });

                    await matchingEngine.VerifierLimitOrdersAsync(stock.Symbole, nouveauPrix);
                }

                // Mises à jour en batch (ExecuteUpdateAsync)
                foreach (var (stockId, nouveauPrix) in prixUpdates)
                {
                    await stockRepository.UpdatePrixAsync(stockId, nouveauPrix);
                }

                // Historiques en batch
                if (historiquesPrix.Count > 0)
                {
                    await stockRepository.EnregistrerHistoriquesAsync(historiquesPrix);
                }

                // Expiration des ordres périmés (section 14 du document)
                var ordresExpires = await orderRepository.GetOrdresExpiresAsync();
                if (ordresExpires.Count > 0)
                {
                    await orderRepository.AnnulerOrdresAsync(ordresExpires);
                }
            }

            await Task.Delay(TickIntervalMs, ct);
        }
    }

    public decimal GenererPrix(decimal prixActuel, decimal volatilite)
    {
        double u1 = 1.0 - Random.Shared.NextDouble();
        double u2 = 1.0 - Random.Shared.NextDouble();
        double gaussien = Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Sin(2.0 * Math.PI * u2);
        double dt = 1.0 / (252 * 390);
        double choc = (double)volatilite * Math.Sqrt(dt) * gaussien;
        return prixActuel * (decimal)Math.Exp(choc);
    }
}