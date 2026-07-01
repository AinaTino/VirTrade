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
    IOrdersRepository ordersRepository) : ControllerBase
{
    // -----------------------------------------------------------------------
    // POST /api/orders — Placer un ordre
    // -----------------------------------------------------------------------

    [HttpPost]
    public async Task<IActionResult> PlacerOrdre([FromBody] PlacerOrdreRequest request)
    {
        var userId = ObtenirUserId();

        // Validation métier : Limit Order sans prix = refus
        if (request.TypeOrdre == TypeOrdre.Limit && request.PrixLimite == null)
            return BadRequest("Un ordre Limit requiert un prix limite.");

        var stock = await ordersRepository.GetStockAsync(request.Symbole);
        if (stock == null)
            return NotFound($"Stock '{request.Symbole}' introuvable.");

        // Validation solde / position (délégué à Membre 2 via IPortefeuilleValidator)
        var erreur = await ordersRepository.ValiderFondsAsync(userId, request, stock.PrixActuel);
        if (erreur != null)
            return BadRequest(erreur);

        var ordre = new Ordre
        {
            TypeOrdre             = request.TypeOrdre,
            SensOrdre             = request.SensOrdre,
            Quantite         = request.Quantite,
            PrixLimite       = request.PrixLimite,
            StockId          = stock.Id,
            Stock            = stock,
            UtilisateurId    = userId,
            Utilisateur      = await ordersRepository.GetUtilisateurAsync(userId),
            ExpiresAt        = request.ExpiresAt,
            Statut           = "OPEN",
            CreatedAt        = DateTime.UtcNow
        };

        // INSERT en DB d'abord → on a un Id avant d'injecter dans le book
        await ordersRepository.InsererOrdreAsync(ordre);

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

    // -----------------------------------------------------------------------
    // GET /api/orders — Mes ordres
    // -----------------------------------------------------------------------

    [HttpGet]
    public async Task<IActionResult> GetOrdres([FromQuery] string? statut = null)
    {
        var userId = ObtenirUserId();
        var ordres = await ordersRepository.GetOrdresUtilisateurAsync(userId, statut);
        return Ok(ordres);
    }

    // -----------------------------------------------------------------------
    // GET /api/orders/{id} — Détail d'un ordre
    // -----------------------------------------------------------------------

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrdre(int id)
    {
        var userId = ObtenirUserId();
        var ordre = await ordersRepository.GetOrdreAsync(id);

        if (ordre == null)
            return NotFound();

        // Un trader ne peut voir que ses propres ordres
        if (ordre.UtilisateurId != userId)
            return Forbid();

        return Ok(ordre);
    }

    // -----------------------------------------------------------------------
    // DELETE /api/orders/{id} — Annuler un ordre
    // -----------------------------------------------------------------------

    [HttpDelete("{id}")]
    public async Task<IActionResult> AnnulerOrdre(int id)
    {
        var userId = ObtenirUserId();
        var ordre = await ordersRepository.GetOrdreAsync(id);

        if (ordre == null)
            return NotFound();

        if (ordre.UtilisateurId != userId)
            return Forbid();

        // On ne peut annuler que OPEN ou PARTIAL
        if (ordre.Statut == "FILLED" || ordre.Statut == "CANCELLED")
            return Conflict($"Impossible d'annuler un ordre au statut '{ordre.Statut}'.");

        ordre.Statut = "CANCELLED";
        await ordersRepository.MettreAJourOrdreAsync(ordre);

        // Retirer du book en mémoire
        orderBookService.Retirer(ordre);

        return NoContent();
    }

    // -----------------------------------------------------------------------
    // Utilitaire
    // -----------------------------------------------------------------------

    private int ObtenirUserId()
        => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}