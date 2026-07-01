using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace VirTrade.API.Controllers
{
    [ApiController]
    [Route("api/portfolio")]
    [Authorize]
    public class PortfolioController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetPortefeuille()
        {
            // TODO : retourner le portefeuille complet (solde_cash + positions) une fois AppDbContext finalisé
            return StatusCode(501, new { message = "GetPortefeuille pas encore implémenté" });
        }

        [HttpGet("positions")]
        public IActionResult GetPositions()
        {
            // TODO : retourner les positions par stock (quantite_detenue, prix_moyen_achat)
            return StatusCode(501, new { message = "GetPositions pas encore implémenté" });
        }

        [HttpGet("trades")]
        public IActionResult GetTrades()
        {
            // TODO : retourner l'historique des trades de l'utilisateur connecté
            return StatusCode(501, new { message = "GetTrades pas encore implémenté" });
        }

        [HttpGet("pnl")]
        public IActionResult GetPnl()
        {
            // TODO : calculer PnL global = valeur actuelle du portefeuille - capital initial
            return StatusCode(501, new { message = "GetPnl pas encore implémenté" });
        }
    }
}