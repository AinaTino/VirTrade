using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using VirTrade.API.Controllers;
using VirTrade.Core.Entities;
using VirTrade.Core.Enums;
using VirTrade.Core.Interfaces;
using VirTrade.Core.Services;

namespace VirTrade.Tests;

public class OrdersControllerTests
{
    [Fact]
    public async Task PlacerOrdre_MarketSansContrepartie_ResteEnAttenteAuLieuDeRetournerConflict()
    {
        var orderRepo = new Mock<IOrdersRepository>();
        var stock = new Stock { Id = 1, Symbole = "AAPL", NomComplet = "Apple", PrixActuel = 100m };
        var utilisateur = new Utilisateur { Id = 42, Nom = "Trader", Email = "trader@test.com", PasswordHash = "hash" };

        orderRepo.Setup(r => r.GetStockAsync("AAPL")).ReturnsAsync(stock);
        orderRepo.Setup(r => r.GetUtilisateurAsync(42)).ReturnsAsync(utilisateur);
        orderRepo.Setup(r => r.ValiderFondsAsync(42, SensOrdre.Buy, 10, 100m, 1)).ReturnsAsync((string?)null);
        orderRepo.Setup(r => r.InsererOrdreAsync(It.IsAny<Ordre>())).Returns(Task.CompletedTask);
        orderRepo.Setup(r => r.MettreAJourOrdreAsync(It.IsAny<Ordre>())).Returns(Task.CompletedTask);

        var orderBookService = new OrderBookService(new Mock<IOrderRepository>().Object);
        var matchingEngine = new Mock<IMatchingEngine>();
        matchingEngine.Setup(m => m.ExecuterAsync(It.IsAny<Ordre>())).ReturnsAsync(new List<Trade>());
        var notifier = new Mock<ISignalRNotifier>();

        var controller = new OrdersController(
            orderBookService,
            matchingEngine.Object,
            orderRepo.Object,
            notifier.Object);

        var claimsPrincipal = new System.Security.Claims.ClaimsPrincipal(
            new System.Security.Claims.ClaimsIdentity(new[] { new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.NameIdentifier, "42") }, "Test"));
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = claimsPrincipal }
        };

        var request = new PlacerOrdreRequest("AAPL", TypeOrdre.Market, SensOrdre.Buy, 10, null, null);

        var result = await controller.PlacerOrdre(request);

        result.Should().BeOfType<CreatedAtActionResult>();
        var created = result.As<CreatedAtActionResult>();
        created.Value.Should().NotBeNull();
    }
}
