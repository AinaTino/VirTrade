using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VirTrade.Core.Entities;
using VirTrade.Core.Interfaces;
using VirTrade.Infrastructure.Persistence;

namespace VirTrade.API.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly IStockRepository _stockRepository;
    private readonly AppDbContext _db;

    public AdminController(IStockRepository stockRepository, AppDbContext db)
    {
        _stockRepository = stockRepository;
        _db = db;
    }

    // ===== CONFIG MARCHE =====

    // GET /api/admin/config
    [HttpGet("config")]
    public async Task<IActionResult> GetConfig()
    {
        var config = await _db.ConfigsMarche.ToListAsync();
        return Ok(config);
    }

    // PUT /api/admin/config/{cle}
    [HttpPut("config/{cle}")]
    public async Task<IActionResult> UpdateConfig(string cle, [FromBody] string nouvelleValeur)
    {
        var config = await _db.ConfigsMarche.FirstOrDefaultAsync(c => c.Cle == cle);
        if (config == null)
            return NotFound($"Paramètre '{cle}' introuvable");

        config.Valeur = nouvelleValeur;
        await _db.SaveChangesAsync();
        return Ok(config);
    }

    // ===== UTILISATEURS =====

    // GET /api/admin/users
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _db.Utilisateurs
            .Select(u => new { u.Id, u.Nom, u.Email, u.Role, u.CreatedAt })
            .ToListAsync();
        return Ok(users);
    }

    // PUT /api/admin/users/{id}
    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] Utilisateur updatedUser)
    {
        var user = await _db.Utilisateurs.FindAsync(id);
        if (user == null)
            return NotFound($"Utilisateur {id} introuvable");

        user.Nom = updatedUser.Nom;
        user.Email = updatedUser.Email;
        user.Role = updatedUser.Role;
        await _db.SaveChangesAsync();
        return Ok(user);
    }

    // DELETE /api/admin/users/{id}
    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _db.Utilisateurs.FindAsync(id);
        if (user == null)
            return NotFound($"Utilisateur {id} introuvable");

        _db.Utilisateurs.Remove(user);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ===== STOCKS (CRUD Admin) =====

    // POST /api/stocks (Admin) - placé ici mais route /api/stocks comme prévu dans le doc
    [HttpPost("/api/stocks")]
    public async Task<IActionResult> CreateStock([FromBody] Stock stock)
    {
        var created = await _stockRepository.AddAsync(stock);
        return CreatedAtAction(nameof(CreateStock), new { id = created.Id }, created);
    }

    // PUT /api/stocks/{id} (Admin)
    [HttpPut("/api/stocks/{id}")]
    public async Task<IActionResult> UpdateStock(int id, [FromBody] Stock updatedStock)
    {
        var stock = await _stockRepository.GetByIdAsync(id);
        if (stock == null)
            return NotFound($"Stock {id} introuvable");

        stock.Symbole = updatedStock.Symbole;
        stock.NomComplet = updatedStock.NomComplet;
        stock.Volatilite = updatedStock.Volatilite;
        await _stockRepository.UpdateAsync(stock);
        return Ok(stock);
    }

    // DELETE /api/stocks/{id} (Admin)
    [HttpDelete("/api/stocks/{id}")]
    public async Task<IActionResult> DeleteStock(int id)
    {
        var stock = await _stockRepository.GetByIdAsync(id);
        if (stock == null)
            return NotFound($"Stock {id} introuvable");

        await _stockRepository.DeleteAsync(id);
        return NoContent();
    }
}