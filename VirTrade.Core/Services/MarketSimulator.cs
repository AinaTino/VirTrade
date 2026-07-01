using VirTrade.Core.Entities;
using VirTrade.Core.Interfaces;

namespace VirTrade.Core.Services;

public class MarketSimulator : IMarketSimulator
{
    private readonly IStockRepository _stockRepository;
    private const int TickIntervalMs = 3000; // valeur par défaut, viendra de ConfigMarche plus tard

    public MarketSimulator(IStockRepository stockRepository)
    {
        _stockRepository = stockRepository;
    }

    public async Task DemarrerAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            var stocks = await _stockRepository.GetAllAsync();

            foreach (var stock in stocks)
            {
                decimal nouveauPrix = GenererPrix(stock.PrixActuel, stock.Volatilite);
                await _stockRepository.UpdatePrixAsync(stock.Id, nouveauPrix);
            }

            await Task.Delay(TickIntervalMs, ct);
        }
    }

    public decimal GenererPrix(decimal prixActuel, decimal volatilite)
    {
        double u1 = 1.0 - Random.Shared.NextDouble();
        double u2 = 1.0 - Random.Shared.NextDouble();

        double gaussien = Math.Sqrt(-2.0 * Math.Log(u1))
                         * Math.Sin(2.0 * Math.PI * u2);

        double dt = 1.0 / (252 * 390);
        double choc = (double)volatilite * Math.Sqrt(dt) * gaussien;

        return prixActuel * (decimal)Math.Exp(choc);
    }
}