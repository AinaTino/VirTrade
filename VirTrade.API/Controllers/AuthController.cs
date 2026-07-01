using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace VirTrade.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        [HttpPost("register")]
        public IActionResult Register([FromBody] object request)
        {
            // TODO : implémenter une fois Utilisateur/Portefeuille disponibles (Membre 1)
            return StatusCode(501, new { message = "Register pas encore implémenté" });
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] object request)
        {
            // TODO : vérifier credentials + générer JWT une fois Utilisateur disponible
            return StatusCode(501, new { message = "Login pas encore implémenté" });
        }

        [Authorize]
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // TODO : logique de déconnexion (stateless JWT -> souvent juste côté client)
            return StatusCode(501, new { message = "Logout pas encore implémenté" });
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            // TODO : retourner le profil de l'utilisateur connecté via les claims du JWT
            return StatusCode(501, new { message = "Me pas encore implémenté" });
        }
    }
}