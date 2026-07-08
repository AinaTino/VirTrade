using VirTrade.Core.Entities;
using VirTrade.Core.Interfaces;
using VirTrade.Core.Services;
using Xunit;

namespace VirTrade.Tests;

// Faux repository, utilisé uniquement pour les tests.
public class FakeStockRepository : IStockRepository
{
    public Task<List<Stock>> GetAllAsync() => Task.FromResult(new List<Stock>());
    public Task UpdatePrixAsync(int stockId, decimal nouveauPrix) => Task.CompletedTask;
    public Task EnregistrerHistoriqueAsync(int stockId, decimal prix) => Task.CompletedTask;
}

public class MarketSimulatorTests
{
    [Fact]
    public void GenererPrix_ProduitDesVariationsRealistes()
    {
        var sim = new MarketSimulator(new FakeStockRepository());
        decimal prixActuel = 150.00m;
        decimal volatilite = 0.015m;

        decimal nouveauPrix = sim.GenererPrix(prixActuel, volatilite);

        Assert.True(nouveauPrix > 0, "Le prix doit toujours être positif");
        decimal variation = Math.Abs(nouveauPrix - prixActuel) / prixActuel;
        Assert.True(variation < 0.05m, $"Variation trop grande : {variation:P2}");
    }

    [Fact]
    public void GenererPrix_AfficheDixTicksPourInspectionVisuelle()
    {
        var sim = new MarketSimulator(new FakeStockRepository());
        decimal prix = 150.00m;

        for (int i = 0; i < 10; i++)
        {
            prix = sim.GenererPrix(prix, 0.015m);
            Console.WriteLine($"Tick {i + 1} : {prix:F4}");
        }

        Assert.True(prix > 0);
    }
}