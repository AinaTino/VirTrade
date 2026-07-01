using VirTrade.Core.Services;
using Xunit;

namespace VirTrade.Tests;

public class MarketSimulatorTests
{
    [Fact]
    public void GenererPrix_ProduitDesVariationsRealistes()
    {
        // Arrange
        var sim = new MarketSimulator();
        decimal prixActuel = 150.00m;
        decimal volatilite = 0.015m;

        // Act
        decimal nouveauPrix = sim.GenererPrix(prixActuel, volatilite);

        // Assert
        Assert.True(nouveauPrix > 0, "Le prix doit toujours être positif");
        // La variation ne doit pas dépasser 5% en un seul tick (large marge de sécurité)
        decimal variation = Math.Abs(nouveauPrix - prixActuel) / prixActuel;
        Assert.True(variation < 0.05m, $"Variation trop grande : {variation:P2}");
    }

    [Fact]
    public void GenererPrix_AfficheDixTicksPourInspectionVisuelle()
    {
        var sim = new MarketSimulator();
        decimal prix = 150.00m;

        for (int i = 0; i < 10; i++)
        {
            prix = sim.GenererPrix(prix, 0.015m);
            Console.WriteLine($"Tick {i + 1} : {prix:F4}");
        }

        Assert.True(prix > 0);
    }
}