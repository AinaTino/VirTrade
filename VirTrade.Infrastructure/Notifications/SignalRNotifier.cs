using Microsoft.AspNetCore.SignalR;
using VirTrade.Core.Entities;
using VirTrade.Core.Interfaces;

namespace VirTrade.Infrastructure.Notifications
{
    public class SignalRNotifier : ISignalRNotifier
    {
        private readonly IHubContext<BourseHub> _hub;

        public SignalRNotifier(IHubContext<BourseHub> hub)
        {
            _hub = hub;
        }

        // Trade exécuté → groupe du ticker concerné (section 11)
        public async Task NotifierNouveauTradeAsync(Trade trade)
        {
            await _hub.Clients.Group(trade.Stock.Symbole).SendAsync("NouveauTrade", new
            {
                tradeId = trade.Id,
                symbole = trade.Stock.Symbole,
                quantite = trade.Quantite,
                prixExecution = trade.PrixExecution,
                executedAt = trade.ExecutedAt
            });
        }

        // Nouveau prix → groupe du ticker concerné (section 11)
        public async Task NotifierPrixUpdateAsync(string symbole, decimal prix)
        {
            await _hub.Clients.Group(symbole).SendAsync("PrixUpdate", new
            {
                symbole,
                prix,
                timestamp = DateTime.UtcNow
            });
        }

        // Snapshot order book → groupe du ticker concerné (section 11)
        public async Task NotifierOrderBookAsync(string symbole, object book)
        {
            await _hub.Clients.Group(symbole).SendAsync("OrderBookUpdate", book);
        }

        // Portefeuille mis à jour → trader concerné uniquement (section 11)
        public async Task NotifierPortefeuilleAsync(int userId, object pf)
        {
            await _hub.Clients.User(userId.ToString()).SendAsync("PortefeuilleUpdate", pf);
        }

        // Leaderboard mis à jour → tous les clients (section 11)
        public async Task NotifierLeaderboardAsync(object leaderboard)
        {
            await _hub.Clients.All.SendAsync("LeaderboardUpdate", leaderboard);
        }
    }
}