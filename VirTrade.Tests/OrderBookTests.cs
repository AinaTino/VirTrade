using FluentAssertions;
using Moq;
using VirTrade.Core.Entities;
using VirTrade.Core.Enums;
using VirTrade.Core.Interfaces;
using VirTrade.Core.Services;

namespace VirTrade.Tests;

public class OrderBookTests
{
    private static Ordre CreerOrdre(SensOrdre sens, decimal? prixLimite, int quantite = 100, int id = 1)
        => new()
        {
            Id            = id,
            SensOrdre     = sens,
            TypeOrdre     = prixLimite.HasValue ? TypeOrdre.Limit : TypeOrdre.Market,
            Quantite      = quantite,
            PrixLimite    = prixLimite,
            Statut        = StatutOrdre.Open,
            UtilisateurId = 1,
            Utilisateur   = new Utilisateur { Id = 1, Nom = "Test", Email = "test@test.com", PasswordHash = "x" },
            StockId       = 1,
            Stock         = new Stock { Id = 1, Symbole = "AAPL", NomComplet = "Apple", PrixActuel = 150m }
        };

    [Fact]
    public void Inject_BidOrdre_ApparaitDansMeilleurBid()
    {
        var book = new OrderBook("AAPL");
        var ordre = CreerOrdre(SensOrdre.Buy, 150m);

        book.Inject(ordre);

        book.MeilleurBid().Should().Be(ordre);
    }

    [Fact]
    public void Inject_AskOrdre_ApparaitDansMeilleurAsk()
    {
        var book = new OrderBook("AAPL");
        var ordre = CreerOrdre(SensOrdre.Sell, 149m);

        book.Inject(ordre);

        book.MeilleurAsk().Should().Be(ordre);
    }

    [Fact]
    public void Retirer_OrdreExistant_NApparaitPlusDansBook()
    {
        var book = new OrderBook("AAPL");
        var ordre = CreerOrdre(SensOrdre.Buy, 150m);
        book.Inject(ordre);

        book.Retirer(ordre);

        book.MeilleurBid().Should().BeNull();
    }

    [Fact]
    public void PricePriority_MeilleurPrixExecuteEnPremier()
    {
        var book      = new OrderBook("AAPL");
        var ordreBas  = CreerOrdre(SensOrdre.Buy, 148m, id: 1);
        var ordreHaut = CreerOrdre(SensOrdre.Buy, 152m, id: 2);

        book.Inject(ordreBas);
        book.Inject(ordreHaut);

        book.MeilleurBid().Should().Be(ordreHaut);
    }

    [Fact]
    public void PrioriteTemporelle_PremierOrdreExecuteEnPremier()
    {
        var book          = new OrderBook("AAPL");
        var premierOrdre  = CreerOrdre(SensOrdre.Buy, 150m, id: 1);
        var deuxiemeOrdre = CreerOrdre(SensOrdre.Buy, 150m, id: 2);

        book.Inject(premierOrdre);
        book.Inject(deuxiemeOrdre);

        book.MeilleurBid().Should().Be(premierOrdre);
    }

    [Fact]
    public void Spread_DeuxOrdresTouches_RetourneZero()
    {
        var book = new OrderBook("AAPL");
        book.Inject(CreerOrdre(SensOrdre.Buy,  150m, id: 1));
        book.Inject(CreerOrdre(SensOrdre.Sell, 150m, id: 2));

        book.Spread().Should().Be(0);
    }

    [Fact]
    public void Spread_BookVide_RetourneZero()
    {
        var book = new OrderBook("AAPL");

        book.Spread().Should().Be(0);
    }
}