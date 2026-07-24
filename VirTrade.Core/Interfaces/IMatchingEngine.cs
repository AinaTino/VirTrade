using VirTrade.Core.Entities;

namespace VirTrade.Core.Interfaces;

public interface IMatchingEngine
{
    Task<List<Trade>> ExecuterAsync(Ordre nouvelOrdre);
    Task<List<Trade>> VerifierLimitOrdersAsync(string symbole, decimal nouveauPrix);
}