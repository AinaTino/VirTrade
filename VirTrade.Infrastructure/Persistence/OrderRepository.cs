using Microsoft.EntityFrameworkCore;
using VirTrade.Core.Entities;
using VirTrade.Core.Enums;
using VirTrade.Core.Interfaces;

namespace VirTrade.Infrastructure.Persistence;

public class OrderRepository(AppDbContext db) : IOrderRepository
{
    public async Task<List<Ordre>> GetOrdresOuvertsAsync()
        => await db.Ordres
            .Where(o => o.Statut == StatutOrdre.Open || o.Statut == StatutOrdre.Partial)
            .Include(o => o.Stock)
            .OrderBy(o => o.CreatedAt)
            .ToListAsync();

    public async Task<List<Ordre>> GetOrdresExpiresAsync()
        => await db.Ordres
            .Where(o => o.ExpiresAt < DateTime.UtcNow
                        && (o.Statut == StatutOrdre.Open || o.Statut == StatutOrdre.Partial))
            .Include(o => o.Stock)
            .ToListAsync();

    public async Task AnnulerOrdresAsync(List<Ordre> ordres)
    {
        foreach (var ordre in ordres)
            ordre.Statut = StatutOrdre.Cancelled;

        await db.SaveChangesAsync();
    }
}