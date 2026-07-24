using Microsoft.AspNetCore.Mvc;
using VirTrade.Core.Interfaces;

namespace VirTrade.API.Controllers;

[ApiController]
[Route("api/stocks")]
public class StocksController : ControllerBase
{
    private readonly IStockRepository _stockRepository;
    private readonly IOrderBookService _orderBookService;

    public StocksController(IStockRepository stockRepository, IOrderBookService orderBookService)
    {
        _stockRepository = stockRepository;
        _orderBookService = orderBookService;
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
        var historique = await _stockRepository.GetHistoriqueAsync(symbole);
        return Ok(historique);
    }

    // GET /api/stocks/{symbole}/orderbook
    [HttpGet("{symbole}/orderbook")]
    public IActionResult GetOrderBook(string symbole)
    {
        var book = _orderBookService.GetBook(symbole);
        return Ok(book.ObtenirSnapshot());
    }
}