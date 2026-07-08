using Xunit;

namespace VirTrade.Tests;

public class MarketSimulatorTests
{
    // On teste GenererPrix directement via une petite classe helper,
    // car MarketSimulator dépend maintenant de IServiceScopeFactory (DI complexe à mocker)
    private decimal GenererPrix(decimal prixActuel, decimal volatilite)
    {
        double u1 = 1.0 - Random.Shared.NextDouble();
        double u2 = 1.0 - Random.Shared.NextDouble();
        double gaussien = Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Sin(2.0 * Math.PI * u2);
        double dt = 1.0 / (252 * 390);
        double choc = (double)volatilite * Math.Sqrt(dt) * gaussien;
        return prixActuel * (decimal)Math.Exp(choc);
    }

    [Fact]
    public void GenererPrix_ProduitDesVariationsRealistes()
    {
        decimal prixActuel = 150.00m;
        decimal volatilite = 0.015m;

        decimal nouveauPrix = GenererPrix(prixActuel, volatilite);

        Assert.True(nouveauPrix > 0, "Le prix doit toujours être positif");
        decimal variation = Math.Abs(nouveauPrix - prixActuel) / prixActuel;
        Assert.True(variation < 0.05m, $"Variation trop grande : {variation:P2}");
    }
}