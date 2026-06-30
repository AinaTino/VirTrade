using VirTrade.Core.Entities;

namespace VirTrade.Core.Interfaces;

public interface ISignalRNotifier
{
    Task NotifierNouveauTradeAsync(Trade trade);
    Task NotifierPrixUpdateAsync(string symbole, decimal prix);
    Task NotifierOrderBookAsync(string symbole, object book);
    Task NotifierPortefeuilleAsync(int userId, object pf);
    Task NotifierLeaderboardAsync(object leaderboard);
}