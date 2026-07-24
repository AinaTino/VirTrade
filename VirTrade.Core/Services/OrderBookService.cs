using System.Collections.Concurrent;
using Microsoft.Extensions.DependencyInjection;
using VirTrade.Core.Entities;
using VirTrade.Core.Interfaces;

namespace VirTrade.Core.Services;

public class OrderBookService : IOrderBookService
{
    private readonly ConcurrentDictionary<string, OrderBook> _books = new();
    private readonly IServiceScopeFactory? _scopeFactory;
    private readonly IOrderRepository? _repository;

    [ActivatorUtilitiesConstructor]
    public OrderBookService(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public OrderBookService(IOrderRepository repository)
    {
        _repository = repository;
    }

    public async Task InitialiserAsync()
    {
        var repository = _repository;
        using var scope = repository == null ? _scopeFactory?.CreateScope() : null;
        repository ??= scope?.ServiceProvider.GetRequiredService<IOrderRepository>()
            ?? throw new InvalidOperationException("Aucun repository disponible pour initialiser le carnet d'ordres.");

        var ordresOuverts = await repository.GetOrdresOuvertsAsync();

        foreach (var ordre in ordresOuverts)
            ObtenirOuCreerBook(ObtenirSymbole(ordre)).Inject(ordre);

        var ordresExpires = await repository.GetOrdresExpiresAsync();

        if (ordresExpires.Count > 0)
        {
            await repository.AnnulerOrdresAsync(ordresExpires);

            foreach (var ordre in ordresExpires)
                ObtenirOuCreerBook(ObtenirSymbole(ordre)).Retirer(ordre);
        }
    }

    public OrderBook GetBook(string symbole)
        => ObtenirOuCreerBook(symbole);

    public void Inject(Ordre ordre)
        => ObtenirOuCreerBook(ObtenirSymbole(ordre)).Inject(ordre);

    public void Retirer(Ordre ordre)
    {
        if (_books.TryGetValue(ObtenirSymbole(ordre), out var book))
            book.Retirer(ordre);
    }

    private OrderBook ObtenirOuCreerBook(string symbole)
        => _books.GetOrAdd(symbole, s => new OrderBook(s));

    private static string ObtenirSymbole(Ordre ordre)
        => ordre.Stock?.Symbole
            ?? throw new InvalidOperationException($"L'ordre {ordre.Id} doit inclure son stock pour être placé dans le carnet.");
}
