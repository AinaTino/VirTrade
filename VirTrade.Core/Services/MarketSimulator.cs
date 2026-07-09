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
        while (!ct.IsCancellationRequested)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var stockRepository = scope.ServiceProvider.GetRequiredService<IStockRepository>();
                var matchingEngine = scope.ServiceProvider.GetRequiredService<IMatchingEngine>();
                var orderRepository = scope.ServiceProvider.GetRequiredService<IOrderRepository>();

                var stocks = await stockRepository.GetAllAsync();

                foreach (var stock in stocks)
                {
                    decimal nouveauPrix = GenererPrix(stock.PrixActuel, stock.Volatilite);
                    await stockRepository.UpdatePrixAsync(stock.Id, nouveauPrix);
                    await stockRepository.EnregistrerHistoriqueAsync(stock.Id, nouveauPrix);

                    // Vérifie si des Limit Orders se déclenchent suite au nouveau prix
                    await matchingEngine.VerifierLimitOrdersAsync(stock.Symbole, nouveauPrix);
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