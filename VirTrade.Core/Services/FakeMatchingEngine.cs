using VirTrade.Core.Entities;
using VirTrade.Core.Interfaces;

namespace VirTrade.Core.Services;

// TEMPORAIRE - à remplacer par le vrai MatchingEngine quand
// IMatchingRepository et ISignalRNotifier seront implémentés (Membre 2)
public class FakeMatchingEngine : IMatchingEngine
{
    public Task<List<Trade>> ExecuterAsync(Ordre nouvelOrdre)
        => Task.FromResult(new List<Trade>());
}