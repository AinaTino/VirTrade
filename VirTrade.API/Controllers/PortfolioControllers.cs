using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VirTrade.Infrastructure.Persistence;

namespace VirTrade.API.Controllers
{
    [ApiController]
    [Route("api/portfolio")]
    [Authorize]
    public class PortfolioController : ControllerBase
    {
        private readonly AppDbContext _db;

        public PortfolioController(AppDbContext db)
        {
            _db = db;
        }

        // GET /api/portfolio — portefeuille complet (section 10)
        [HttpGet]
        public async Task<IActionResult> GetPortefeuille()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var portefeuille = await _db.Portefeuilles
                .Include(p => p.Positions)
                    .ThenInclude(pos => pos.Stock)
                .FirstOrDefaultAsync(p => p.UtilisateurId == userId);

            if (portefeuille == null)
                return NotFound(new { message = "Portefeuille introuvable" });

            // Valeur totale = solde cash + valeur des positions
            var valeurPositions = portefeuille.Positions
                .Sum(pos => pos.QuantiteDetenue * pos.Stock.PrixActuel);

            var valeurTotale = portefeuille.SoldeCash + valeurPositions;

            return Ok(new
            {
                id = portefeuille.Id,
                soldeCash = portefeuille.SoldeCash,
                valeurPositions,
                valeurTotale,
                createdAt = portefeuille.CreatedAt,
                positions = portefeuille.Positions.Select(pos => new
                {
                    stockId = pos.StockId,
                    symbole = pos.Stock.Symbole,
                    nomComplet = pos.Stock.NomComplet,
                    quantiteDetenue = pos.QuantiteDetenue,
                    prixMoyenAchat = pos.PrixMoyenAchat,
                    prixActuel = pos.Stock.PrixActuel,
                    valeur = pos.QuantiteDetenue * pos.Stock.PrixActuel
                })
            });
        }

        // GET /api/portfolio/positions — positions par stock (section 10)
        [HttpGet("positions")]
        public async Task<IActionResult> GetPositions()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var portefeuille = await _db.Portefeuilles
                .FirstOrDefaultAsync(p => p.UtilisateurId == userId);

            if (portefeuille == null)
                return NotFound(new { message = "Portefeuille introuvable" });

            var positions = await _db.Positions
                .Include(p => p.Stock)
                .Where(p => p.PortefeuilleId == portefeuille.Id
                         && p.QuantiteDetenue > 0)
                .ToListAsync();

            return Ok(positions.Select(pos => new
            {
                stockId = pos.StockId,
                symbole = pos.Stock.Symbole,
                nomComplet = pos.Stock.NomComplet,
                quantiteDetenue = pos.QuantiteDetenue,
                prixMoyenAchat = pos.PrixMoyenAchat,
                prixActuel = pos.Stock.PrixActuel,
                valeur = pos.QuantiteDetenue * pos.Stock.PrixActuel,
                // PnL par position — section 1.5 du document
                pnlPosition = (pos.Stock.PrixActuel - pos.PrixMoyenAchat)
                              * pos.QuantiteDetenue
            }));
        }

        // GET /api/portfolio/trades — historique trades (section 10)
        [HttpGet("trades")]
        public async Task<IActionResult> GetTrades()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var trades = await _db.Trades
                .Include(t => t.Stock)
                .Include(t => t.BuyOrder)
                .Include(t => t.SellOrder)
                .Where(t => t.BuyOrder.UtilisateurId == userId
                         || t.SellOrder.UtilisateurId == userId)
                .OrderByDescending(t => t.ExecutedAt)
                .ToListAsync();

            return Ok(trades.Select(t => new
            {
                id = t.Id,
                symbole = t.Stock.Symbole,
                quantite = t.Quantite,
                prixExecution = t.PrixExecution,
                executedAt = t.ExecutedAt,
                sens = t.BuyOrder.UtilisateurId == userId ? "BUY" : "SELL"
            }));
        }

        // GET /api/portfolio/pnl — P&L global (section 10 + formule section 1.5)
        [HttpGet("pnl")]
        public async Task<IActionResult> GetPnl()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var portefeuille = await _db.Portefeuilles
                .Include(p => p.Positions)
                    .ThenInclude(pos => pos.Stock)
                .FirstOrDefaultAsync(p => p.UtilisateurId == userId);

            if (portefeuille == null)
                return NotFound(new { message = "Portefeuille introuvable" });

            // Capital initial depuis ConfigMarche (section 14)
            var configCapital = await _db.ConfigsMarche
                .FirstOrDefaultAsync(c => c.Cle == "capital_initial");

            decimal capitalInitial = configCapital != null
                ? decimal.Parse(configCapital.Valeur)
                : 100000m;

            // Valeur totale actuelle = cash + positions
            var valeurPositions = portefeuille.Positions
                .Sum(pos => pos.QuantiteDetenue * pos.Stock.PrixActuel);

            var valeurTotale = portefeuille.SoldeCash + valeurPositions;

            // PnL = Valeur actuelle - Capital initial (section 1.5)
            var pnl = valeurTotale - capitalInitial;
            var pnlPourcentage = (pnl / capitalInitial) * 100;

            return Ok(new
            {
                capitalInitial,
                valeurTotale,
                soldeCash = portefeuille.SoldeCash,
                valeurPositions,
                pnl,
                pnlPourcentage = Math.Round(pnlPourcentage, 2)
            });
        }

        // Méthode privée — extraire userId depuis les claims JWT
        private int? GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return claim != null ? int.Parse(claim) : null;
        }
    }
}