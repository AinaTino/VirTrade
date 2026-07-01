using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace VirTrade.API.Controllers
{
    [ApiController]
    [Route("api/leaderboard")]
    [Authorize]
    public class LeaderboardController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetLeaderboard()
        {
            // TODO : retourner le classement global par valeur totale de portefeuille
            return StatusCode(501, new { message = "GetLeaderboard pas encore implémenté" });
        }

        [HttpGet("me")]
        public IActionResult GetMaPosition()
        {
            // TODO : retourner le rang de l'utilisateur connecté dans le classement
            return StatusCode(501, new { message = "GetMaPosition pas encore implémenté" });
        }
    }
}