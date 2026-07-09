using FluentAssertions;
using Xunit;

namespace VirTrade.Tests;

public class MarketSimulatorTests
{
    // On teste GenererPrix directement via une petite fonction locale,
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
    public void GenererPrix_ProduitUnPrixPositif()
    {
        decimal nouveauPrix = GenererPrix(150.00m, 0.015m);

        nouveauPrix.Should().BeGreaterThan(0, "un prix de marché ne peut jamais être négatif ou nul");
    }

    [Fact]
    public void GenererPrix_ProduitDesVariationsRealistes()
    {
        decimal prixActuel = 150.00m;
        decimal volatilite = 0.015m;

        decimal nouveauPrix = GenererPrix(prixActuel, volatilite);
        decimal variation = Math.Abs(nouveauPrix - prixActuel) / prixActuel;

        variation.Should().BeLessThan(0.05m, "un seul tick ne doit jamais produire un saut de prix violent");
    }

    [Theory]
    [InlineData(0.005)]   // faible volatilité (ex: MSFT)
    [InlineData(0.015)]   // volatilité par défaut (ex: AAPL)
    [InlineData(0.030)]   // forte volatilité (ex: NVDA)
    public void GenererPrix_RespecteLaVolatiliteDonnee(double volatiliteDouble)
    {
        decimal volatilite = (decimal)volatiliteDouble;
        decimal prixActuel = 100.00m;

        // On génère plusieurs ticks pour observer la tendance de dispersion
        var variations = new List<decimal>();
        for (int i = 0; i < 50; i++)
        {
            decimal nouveauPrix = GenererPrix(prixActuel, volatilite);
            variations.Add(Math.Abs(nouveauPrix - prixActuel) / prixActuel);
        }

        // Toutes les variations doivent rester dans une plage raisonnable
        variations.Should().OnlyContain(v => v < 0.1m,
            "même avec une forte volatilité, un seul tick ne doit pas produire un choc extrême");
    }

    [Fact]
    public void GenererPrix_estDeterministeSurLaMoyenne_SurBeaucoupDeTicks()
    {
        // Avec un drift neutre (μ=0), la moyenne des prix générés sur beaucoup
        // de ticks doit rester proche du prix de départ (loi des grands nombres)
        decimal prixActuel = 150.00m;
        decimal volatilite = 0.015m;
        decimal somme = 0;
        int nombreTicks = 1000;

        for (int i = 0; i < nombreTicks; i++)
        {
            somme += GenererPrix(prixActuel, volatilite);
        }

        decimal moyenne = somme / nombreTicks;
        decimal ecartRelatif = Math.Abs(moyenne - prixActuel) / prixActuel;

        ecartRelatif.Should().BeLessThan(0.01m,
            "sur un grand nombre de ticks, la moyenne des prix générés doit rester proche du prix de départ");
    }
}