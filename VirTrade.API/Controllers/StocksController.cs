using Microsoft.AspNetCore.Mvc;
using VirTrade.Core.Interfaces;

namespace VirTrade.API.Controllers;

[ApiController]
[Route("api/stocks")]
public class StocksController : ControllerBase
{
    private readonly IStockRepository _stockRepository;

    public StocksController(IStockRepository stockRepository)
    {
        _stockRepository = stockRepository;
    }

    // GET /api/stocks
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var stocks = await _stockRepository.GetAllAsync();
        return Ok(stocks);
    }

    // GET /api/stocks/{symbole}
    [HttpGet("{symbole}")]
    public async Task<IActionResult> GetBySymbole(string symbole)
    {
        var stocks = await _stockRepository.GetAllAsync();
        var stock = stocks.FirstOrDefault(s =>
            s.Symbole.Equals(symbole, StringComparison.OrdinalIgnoreCase));

        if (stock == null)
            return NotFound($"Stock '{symbole}' introuvable");

        return Ok(stock);
    }

    // GET /api/stocks/{symbole}/historique
    [HttpGet("{symbole}/historique")]
    public async Task<IActionResult> GetHistorique(string symbole)
    {
        var stocks = await _stockRepository.GetAllAsync();
        var stock = stocks.FirstOrDefault(s =>
            s.Symbole.Equals(symbole, StringComparison.OrdinalIgnoreCase));

        if (stock == null)
            return NotFound($"Stock '{symbole}' introuvable");

        // Pour l'instant, on renvoie la collection HistoriquePrix du stock
        // (vide tant que MarketSimulator n'a pas tourné - normal à ce stade)
        return Ok(stock.HistoriquePrix);
    }
}