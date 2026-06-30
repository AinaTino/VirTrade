using VirTrade.Core.Entities;

namespace VirTrade.Core.Interfaces;

public interface IOrderRepository
{
    Task<List<Ordre>> GetOrdresOuvertsAsync();
    Task<List<Ordre>> GetOrdresExpiresAsync();
    Task AnnulerOrdresAsync(List<Ordre> ordres);
}