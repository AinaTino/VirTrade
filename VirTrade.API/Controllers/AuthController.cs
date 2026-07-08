using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using VirTrade.Core.Entities;
using VirTrade.Core.Enums;
using VirTrade.Infrastructure.Persistence;

namespace VirTrade.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext db, IConfiguration configuration)
        {
            _db = db;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // Vérifier si email déjà utilisé
            if (await _db.Utilisateurs.AnyAsync(u => u.Email == request.Email))
                return Conflict(new { message = "Email déjà utilisé" });

            // Créer l'utilisateur avec mot de passe haché (BCrypt)
            var utilisateur = new Utilisateur
            {
                Nom = request.Nom,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = Role.Trader
            };

            // Créer le portefeuille associé (1,1 -- 1,1 section 7.3)
            var capitalInitial = await _db.ConfigsMarche
                .FirstOrDefaultAsync(c => c.Cle == "capital_initial");

            decimal capital = capitalInitial != null
                ? decimal.Parse(capitalInitial.Valeur)
                : 100000m;

            var portefeuille = new Portefeuille
            {
                SoldeCash = capital,
                Utilisateur = utilisateur
            };

            _db.Utilisateurs.Add(utilisateur);
            _db.Portefeuilles.Add(portefeuille);
            await _db.SaveChangesAsync();

            return StatusCode(201, new { message = "Inscription réussie", utilisateurId = utilisateur.Id });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Vérifier si l'utilisateur existe
            var utilisateur = await _db.Utilisateurs
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (utilisateur == null || !BCrypt.Net.BCrypt.Verify(request.Password, utilisateur.PasswordHash))
                return Unauthorized(new { message = "Email ou mot de passe incorrect" });

            // Générer le JWT
            var token = GenererToken(utilisateur);

            return Ok(new
            {
                token,
                utilisateurId = utilisateur.Id,
                nom = utilisateur.Nom,
                role = utilisateur.Role.ToString()
            });
        }

        [Authorize]
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // JWT est stateless — la déconnexion se gère côté client (suppression du token)
            // section 3 du document : JWT Bearer = authentification stateless
            return Ok(new { message = "Déconnexion réussie" });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            // Récupérer l'id depuis les claims du JWT
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized();

            var utilisateur = await _db.Utilisateurs
                .FirstOrDefaultAsync(u => u.Id == int.Parse(userIdClaim));

            if (utilisateur == null)
                return NotFound(new { message = "Utilisateur introuvable" });

            return Ok(new
            {
                id = utilisateur.Id,
                nom = utilisateur.Nom,
                email = utilisateur.Email,
                role = utilisateur.Role.ToString(),
                createdAt = utilisateur.CreatedAt
            });
        }

        // Méthode privée — génération du token JWT
        private string GenererToken(Utilisateur utilisateur)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings["Key"]!));

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, utilisateur.Id.ToString()),
                new Claim(ClaimTypes.Email, utilisateur.Email),
                new Claim(ClaimTypes.Name, utilisateur.Nom),
                new Claim(ClaimTypes.Role, utilisateur.Role.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(
                    double.Parse(jwtSettings["ExpiresInMinutes"]!)),
                signingCredentials: new SigningCredentials(
                    key, SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    // Records simples pour recevoir les requêtes HTTP
    public record RegisterRequest(string Nom, string Email, string Password);
    public record LoginRequest(string Email, string Password);
}