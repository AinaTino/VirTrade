using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VirTrade.Infrastructure.Persistence;

namespace VirTrade.API.Controllers
{
    [ApiController]
    [Route("api/leaderboard")]
    [Authorize]
    public class LeaderboardController : ControllerBase
    {
        private readonly AppDbContext _db;

        public LeaderboardController(AppDbContext db)
        {
            _db = db;
        }

        // GET /api/leaderboard — classement global (section 10)
        [HttpGet]
        public async Task<IActionResult> GetLeaderboard()
        {
            var stocks = await _db.Stocks.ToListAsync();

            var portefeuilles = await _db.Portefeuilles
                .Include(p => p.Utilisateur)
                .Include(p => p.Positions)
                    .ThenInclude(pos => pos.Stock)
                .ToListAsync();

            // Classement par valeur totale décroissante (section 8.2 — LeaderboardController)
            var classement = portefeuilles
                .Select(p => new
                {
                    utilisateurId = p.UtilisateurId,
                    nom = p.Utilisateur.Nom,
                    soldeCash = p.SoldeCash,
                    valeurPositions = p.Positions
                        .Sum(pos => pos.QuantiteDetenue * pos.Stock.PrixActuel),
                    valeurTotale = p.SoldeCash + p.Positions
                        .Sum(pos => pos.QuantiteDetenue * pos.Stock.PrixActuel)
                })
                .OrderByDescending(p => p.valeurTotale)
                .Select((p, index) => new
                {
                    rang = index + 1,
                    utilisateurId = p.utilisateurId,
                    nom = p.nom,
                    soldeCash = p.soldeCash,
                    valeurPositions = p.valeurPositions,
                    valeurTotale = p.valeurTotale
                })
                .ToList();

            return Ok(classement);
        }

        // GET /api/leaderboard/me — rang de l'utilisateur connecté (section 10)
        [HttpGet("me")]
        public async Task<IActionResult> GetMaPosition()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var portefeuilles = await _db.Portefeuilles
                .Include(p => p.Utilisateur)
                .Include(p => p.Positions)
                    .ThenInclude(pos => pos.Stock)
                .ToListAsync();

            // Classement complet pour trouver le rang
            var classement = portefeuilles
                .Select(p => new
                {
                    utilisateurId = p.UtilisateurId,
                    nom = p.Utilisateur.Nom,
                    valeurTotale = p.SoldeCash + p.Positions
                        .Sum(pos => pos.QuantiteDetenue * pos.Stock.PrixActuel)
                })
                .OrderByDescending(p => p.valeurTotale)
                .ToList();

            var maPosition = classement
                .Select((p, index) => new { rang = index + 1, p.utilisateurId, p.nom, p.valeurTotale })
                .FirstOrDefault(p => p.utilisateurId == userId);

            if (maPosition == null)
                return NotFound(new { message = "Portefeuille introuvable" });

            return Ok(new
            {
                rang = maPosition.rang,
                totalParticipants = classement.Count,
                utilisateurId = maPosition.utilisateurId,
                nom = maPosition.nom,
                valeurTotale = maPosition.valeurTotale
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