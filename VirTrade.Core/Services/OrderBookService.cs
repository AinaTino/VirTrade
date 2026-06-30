using System.Collections.Concurrent;
using VirTrade.Core.Interfaces;
using VirTrade.Core.Entities;

namespace VirTrade.Core.Services;

public class OrderBookService(IOrderRepository repository) : IOrderBookService
{
    private readonly ConcurrentDictionary<string, OrderBook> _books = new();

    public async Task InitialiserAsync()
    {
        var ordresOuverts = await repository.GetOrdresOuvertsAsync();

        foreach (var ordre in ordresOuverts)
            ObtenirOuCreerBook(ordre.Stock.Symbole).Inject(ordre);

        var ordresExpires = await repository.GetOrdresExpiresAsync();

        if (ordresExpires.Count > 0)
        {
            await repository.AnnulerOrdresAsync(ordresExpires);

            foreach (var ordre in ordresExpires)
                ObtenirOuCreerBook(ordre.Stock.Symbole).Retirer(ordre);
        }
    }

    public OrderBook GetBook(string symbole) 
        => ObtenirOuCreerBook(symbole);

    public void Inject(Ordre ordre) 
        => ObtenirOuCreerBook(ordre.Stock.Symbole).Inject(ordre);

    public void Retirer(Ordre ordre)
    {
        if (_books.TryGetValue(ordre.Stock.Symbole, out var book))
            book.Retirer(ordre);
    }

    private OrderBook ObtenirOuCreerBook(string symbole) 
        => _books.GetOrAdd(symbole, s => new OrderBook(s));
}