using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VirTrade.Core.Entities;
using VirTrade.Core.Enums;
using VirTrade.Core.Interfaces;

namespace VirTrade.API.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController(
    IOrderBookService orderBookService,
    IMatchingEngine matchingEngine,
    IOrdersRepository ordresRepository) : ControllerBase
{
    // POST /api/orders
    [HttpPost]
    public async Task<IActionResult> PlacerOrdre([FromBody] PlacerOrdreRequest request)
    {
        var userId = ObtenirUserId();

        if (request.TypeOrdre == TypeOrdre.Limit && request.PrixLimite == null)
            return BadRequest("Un ordre Limit requiert un prix limite.");

        var stock = await ordresRepository.GetStockAsync(request.Symbole);
        if (stock == null)
            return NotFound($"Stock '{request.Symbole}' introuvable.");

        // Validation fonds / position (diagramme séquence : API → VAL → DB)
        var erreur = await ordresRepository.ValiderFondsAsync(
            userId, request.SensOrdre, request.Quantite, stock.PrixActuel);
        if (erreur != null)
            return BadRequest(erreur);

        var utilisateur = await ordresRepository.GetUtilisateurAsync(userId);

        var ordre = new Ordre
        {
            TypeOrdre          = request.TypeOrdre,
            SensOrdre          = request.SensOrdre,
            Quantite      = request.Quantite,
            PrixLimite    = request.PrixLimite,
            StockId       = stock.Id,
            Stock         = stock,
            UtilisateurId = userId,
            Utilisateur   = utilisateur,
            ExpiresAt     = request.ExpiresAt,
            Statut        = StatutOrdre.Open,
            CreatedAt     = DateTime.UtcNow
        };

        // INSERT ordre en DB d'abord → on a un Id avant d'injecter dans le book
        await ordresRepository.InsererOrdreAsync(ordre);

        // Injecter dans le book en mémoire
        orderBookService.Inject(ordre);

        // Tenter le matching
        var trades = await matchingEngine.ExecuterAsync(ordre);

        return CreatedAtAction(nameof(GetOrdre), new { id = ordre.Id }, new
        {
            ordre.Id,
            ordre.Statut,
            TradesExecutes = trades.Count
        });
    }

    // GET /api/orders
    [HttpGet]
    public async Task<IActionResult> GetOrdres([FromQuery] string? statut = null)
    {
        var userId = ObtenirUserId();
        var ordres = await ordresRepository.GetOrdresUtilisateurAsync(userId, statut);
        return Ok(ordres);
    }

    // GET /api/orders/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrdre(int id)
    {
        var userId = ObtenirUserId();
        var ordre = await ordresRepository.GetOrdreAsync(id);

        if (ordre == null)
            return NotFound();

        if (ordre.UtilisateurId != userId)
            return Forbid();

        return Ok(ordre);
    }

    // DELETE /api/orders/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> AnnulerOrdre(int id)
    {
        var userId = ObtenirUserId();
        var ordre = await ordresRepository.GetOrdreAsync(id);

        if (ordre == null)
            return NotFound();

        if (ordre.UtilisateurId != userId)
            return Forbid();

        if (ordre.Statut == StatutOrdre.Filled || ordre.Statut == StatutOrdre.Cancelled)
            return Conflict($"Impossible d'annuler un ordre au statut '{ordre.Statut}'.");

        ordre.Statut = StatutOrdre.Cancelled;
        await ordresRepository.MettreAJourOrdreAsync(ordre);
        orderBookService.Retirer(ordre);

        return NoContent();
    }

    private int ObtenirUserId()
        => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}