using FluentAssertions;
using Moq;
using VirTrade.Core.Entities;
using VirTrade.Core.Enums;
using VirTrade.Core.Interfaces;
using VirTrade.Core.Services;

namespace VirTrade.Tests;

public class MatchingEngineTests
{
    private readonly OrderBook _book;
    private readonly OrderBookService _orderBookService;
    private readonly MatchingEngine _engine;
    private readonly Mock<IMatchingRepository> _repoMock = new();
    private readonly Mock<ISignalRNotifier> _notifierMock = new();

    public MatchingEngineTests()
    {
        var orderRepoMock = new Mock<IOrderRepository>();
        orderRepoMock.Setup(r => r.GetOrdresOuvertsAsync()).ReturnsAsync(new List<Ordre>());
        orderRepoMock.Setup(r => r.GetOrdresExpiresAsync()).ReturnsAsync(new List<Ordre>());

        _repoMock
            .Setup(r => r.PersisterTradeAsync(
                It.IsAny<Trade>(), It.IsAny<Ordre>(),
                It.IsAny<Ordre>(), It.IsAny<int>(), It.IsAny<decimal>()))
            .Returns(Task.CompletedTask);

        _orderBookService = new OrderBookService(orderRepoMock.Object);
        _engine = new MatchingEngine(_orderBookService, _repoMock.Object, _notifierMock.Object);
        _book = _orderBookService.GetBook("AAPL");
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private static Ordre CreerOrdre(SensOrdre sens, TypeOrdre type, decimal? prix,
        int quantite = 100, int id = 1)
    {
        var stock = new Stock
        {
            Id         = 1,
            Symbole    = "AAPL",
            NomComplet = "Apple Inc.",
            PrixActuel = 150m
        };

        var utilisateur = new Utilisateur
        {
            Id           = id,
            Nom          = $"Trader{id}",
            Email        = $"trader{id}@test.com",
            PasswordHash = "hash123"
        };

        return new Ordre
        {
            Id            = id,
            SensOrdre     = sens,
            TypeOrdre     = type,
            PrixLimite    = prix,
            Quantite      = quantite,
            Statut        = StatutOrdre.Open,
            Stock         = stock,
            StockId       = 1,
            Utilisateur   = utilisateur,
            UtilisateurId = id
        };
    }

    // -----------------------------------------------------------------------
    // Market / Limit orders
    // -----------------------------------------------------------------------

    [Fact]
    public async Task MarketOrder_ExecuteImmediatement_SurLeMeilleurAsk()
    {
        var ask = CreerOrdre(SensOrdre.Sell, TypeOrdre.Limit, 149m, id: 1);
        _book.Inject(ask);

        var bid = CreerOrdre(SensOrdre.Buy, TypeOrdre.Market, null, id: 2);
        _book.Inject(bid);

        var trades = await _engine.ExecuterAsync(bid);

        trades.Should().HaveCount(1);
        trades[0].PrixExecution.Should().Be(149m);
        trades[0].Quantite.Should().Be(100);
    }

    [Fact]
    public async Task MarketOrder_SansContrePartie_ExecuteAuPrixActuelEtRemplitLordre()
    {
        var bid = CreerOrdre(SensOrdre.Buy, TypeOrdre.Market, null, quantite: 10, id: 2);
        _book.Inject(bid);

        var trades = await _engine.ExecuterAsync(bid);

        trades.Should().HaveCount(1);
        trades[0].Quantite.Should().Be(10);
        trades[0].PrixExecution.Should().Be(bid.Stock!.PrixActuel);
        bid.Statut.Should().Be(StatutOrdre.Filled);
    }

    [Fact]
    public async Task LimitOrder_ResteOuvert_SiPrixNonAtteint()
    {
        var ask = CreerOrdre(SensOrdre.Sell, TypeOrdre.Limit, 155m, id: 1);
        _book.Inject(ask);

        var bid = CreerOrdre(SensOrdre.Buy, TypeOrdre.Limit, 150m, id: 2);
        _book.Inject(bid);

        var trades = await _engine.ExecuterAsync(bid);

        trades.Should().BeEmpty();
        bid.Statut.Should().Be(StatutOrdre.Open);
    }

    [Fact]
    public async Task LimitOrder_SExecute_QuandPrixAtteint()
    {
        var ask = CreerOrdre(SensOrdre.Sell, TypeOrdre.Limit, 150m, id: 1);
        _book.Inject(ask);

        var bid = CreerOrdre(SensOrdre.Buy, TypeOrdre.Limit, 150m, id: 2);
        _book.Inject(bid);

        var trades = await _engine.ExecuterAsync(bid);

        trades.Should().HaveCount(1);
        bid.Statut.Should().Be(StatutOrdre.Filled);
        ask.Statut.Should().Be(StatutOrdre.Filled);
    }

    // -----------------------------------------------------------------------
    // Partial fill
    // -----------------------------------------------------------------------

    [Fact]
    public async Task PartialFill_OrdreResteDansBook_QuantiteReduite()
    {
        var ask = CreerOrdre(SensOrdre.Sell, TypeOrdre.Limit, 150m, quantite: 100, id: 1);
        _book.Inject(ask);

        var bid = CreerOrdre(SensOrdre.Buy, TypeOrdre.Limit, 150m, quantite: 60, id: 2);
        _book.Inject(bid);

        var trades = await _engine.ExecuterAsync(bid);

        trades.Should().HaveCount(1);
        trades[0].Quantite.Should().Be(60);
        ask.Statut.Should().Be(StatutOrdre.Partial);
        ask.QuantiteExecutee.Should().Be(60);
        bid.Statut.Should().Be(StatutOrdre.Filled);
        _book.MeilleurAsk().Should().Be(ask);
    }

    [Fact]
    public async Task PlusieursAcheteurs_MatchAvecUnVendeur_PartialFills()
    {
        var ask = CreerOrdre(SensOrdre.Sell, TypeOrdre.Limit, 150m, quantite: 100, id: 1);
        _book.Inject(ask);
    
        var bid1 = CreerOrdre(SensOrdre.Buy, TypeOrdre.Limit, 150m, quantite: 60, id: 2);
        _book.Inject(bid1);
    
        await _engine.ExecuterAsync(bid1);
    
        // bid2 injecté seulement après que bid1 soit traité
        var bid2 = CreerOrdre(SensOrdre.Buy, TypeOrdre.Limit, 150m, quantite: 40, id: 3);
        _book.Inject(bid2);
    
        var trades2 = await _engine.ExecuterAsync(bid2);
    
        ask.Statut.Should().Be(StatutOrdre.Filled);
        ask.QuantiteExecutee.Should().Be(100);
        trades2[0].Quantite.Should().Be(40);
    }

    // -----------------------------------------------------------------------
    // Priorités
    // -----------------------------------------------------------------------

    [Fact]
    public async Task PrioriteTemporelle_PremierOrdreExecuteEnPremier()
    {
        var ask1 = CreerOrdre(SensOrdre.Sell, TypeOrdre.Limit, 150m, quantite: 50, id: 1);
        var ask2 = CreerOrdre(SensOrdre.Sell, TypeOrdre.Limit, 150m, quantite: 50, id: 2);
        _book.Inject(ask1);
        _book.Inject(ask2);

        var bid = CreerOrdre(SensOrdre.Buy, TypeOrdre.Limit, 150m, quantite: 50, id: 3);
        _book.Inject(bid);

        var trades = await _engine.ExecuterAsync(bid);

        trades[0].SellOrderId.Should().Be(ask1.Id);
    }

    [Fact]
    public async Task PricePriority_MeilleurPrixExecuteEnPremier()
    {
        var askCher   = CreerOrdre(SensOrdre.Sell, TypeOrdre.Limit, 155m, id: 1);
        var askPasCher = CreerOrdre(SensOrdre.Sell, TypeOrdre.Limit, 149m, id: 2);
        _book.Inject(askCher);
        _book.Inject(askPasCher);

        var bid = CreerOrdre(SensOrdre.Buy, TypeOrdre.Limit, 155m, id: 3);
        _book.Inject(bid);

        var trades = await _engine.ExecuterAsync(bid);

        // Meilleur ask = prix le plus bas → askPasCher doit matcher en premier
        trades[0].SellOrderId.Should().Be(askPasCher.Id);
        trades[0].PrixExecution.Should().Be(149m);
    }

    // -----------------------------------------------------------------------
    // Annulation / expiration
    // -----------------------------------------------------------------------

    [Fact]
    public async Task AnnulationOrdre_RetireOrdreDeBook()
    {
        var ask = CreerOrdre(SensOrdre.Sell, TypeOrdre.Limit, 150m, id: 1);
        _book.Inject(ask);

        ask.Statut = StatutOrdre.Cancelled;
        _orderBookService.Retirer(ask);

        var bid = CreerOrdre(SensOrdre.Buy, TypeOrdre.Limit, 150m, id: 2);
        _book.Inject(bid);

        var trades = await _engine.ExecuterAsync(bid);

        trades.Should().BeEmpty();
    }

    [Fact]
    public void OrdreExpire_EstExpire_RetourneTrue()
    {
        var ordre = CreerOrdre(SensOrdre.Buy, TypeOrdre.Limit, 150m, id: 1);
        ordre.ExpiresAt = DateTime.UtcNow.AddSeconds(-1);

        ordre.EstExpire().Should().BeTrue();
    }

    // -----------------------------------------------------------------------
    // Market Impact
    // -----------------------------------------------------------------------

    [Fact]
    public async Task MarketImpact_BuyTrade_AugmentePrix()
    {
        var ask = CreerOrdre(SensOrdre.Sell, TypeOrdre.Limit, 150m, quantite: 1000, id: 1);
        _book.Inject(ask);

        var bid = CreerOrdre(SensOrdre.Buy, TypeOrdre.Limit, 150m, quantite: 1000, id: 2);
        _book.Inject(bid);

        var prixAvant = bid.Stock.PrixActuel;

        await _engine.ExecuterAsync(bid);

        bid.Stock.PrixActuel.Should().BeGreaterThan(prixAvant);
    }

    [Fact]
    public async Task MarketImpact_SellTrade_DiminuePrix()
    {
        var buy = CreerOrdre(SensOrdre.Buy, TypeOrdre.Limit, 150m, quantite: 1000, id: 1);
        _book.Inject(buy);

        var sell = CreerOrdre(SensOrdre.Sell, TypeOrdre.Market, null, quantite: 1000, id: 2);
        _book.Inject(sell);

        var prixAvant = sell.Stock.PrixActuel;

        await _engine.ExecuterAsync(sell);

        sell.Stock.PrixActuel.Should().BeLessThan(prixAvant);
    }

    // -----------------------------------------------------------------------
    // Reconstruction book
    // -----------------------------------------------------------------------

    [Fact]
    public async Task ReconstructionBook_OrdresOuverts_ChargésDepuisDB()
    {
        var stock = new Stock
        {
            Id         = 1,
            Symbole    = "AAPL",
            NomComplet = "Apple Inc.",
            PrixActuel = 150m
        };

        var utilisateur = new Utilisateur
        {
            Id           = 1,
            Nom          = "Test",
            Email        = "test@test.com",
            PasswordHash = "x"
        };

        var ordresOuverts = new List<Ordre>
        {
            new()
            {
                Id            = 1,
                TypeOrdre     = TypeOrdre.Limit,
                SensOrdre     = SensOrdre.Buy,
                Quantite      = 100,
                PrixLimite    = 150m,
                Statut        = StatutOrdre.Open,
                StockId       = 1,
                Stock         = stock,
                UtilisateurId = 1,
                Utilisateur   = utilisateur
            },
            new()
            {
                Id            = 2,
                TypeOrdre     = TypeOrdre.Limit,
                SensOrdre     = SensOrdre.Sell,
                Quantite      = 50,
                PrixLimite    = 155m,
                Statut        = StatutOrdre.Open,
                StockId       = 1,
                Stock         = stock,
                UtilisateurId = 1,
                Utilisateur   = utilisateur
            }
        };

        var orderRepoMock = new Mock<IOrderRepository>();
        orderRepoMock
            .Setup(r => r.GetOrdresOuvertsAsync())
            .ReturnsAsync(ordresOuverts);
        orderRepoMock
            .Setup(r => r.GetOrdresExpiresAsync())
            .ReturnsAsync(new List<Ordre>());

        var service = new OrderBookService(orderRepoMock.Object);
        await service.InitialiserAsync();

        var book = service.GetBook("AAPL");

        book.MeilleurBid().Should().NotBeNull();
        book.MeilleurBid()!.Id.Should().Be(1);
        book.MeilleurAsk().Should().NotBeNull();
        book.MeilleurAsk()!.Id.Should().Be(2);
    }
}