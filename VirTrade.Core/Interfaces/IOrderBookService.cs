using VirTrade.Core.Entities;
using VirTrade.Core.Services;

namespace VirTrade.Core.Interfaces;

public interface IOrderBookService
{
    Task InitialiserAsync();
    OrderBook GetBook(string symbole);
    void Inject(Ordre ordre);
    void Retirer(Ordre ordre);
}