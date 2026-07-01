using Microsoft.AspNetCore.SignalR;

namespace VirTrade.Infrastructure.Notifications
{
    public class SignalRNotifier
    {
        private readonly IHubContext<BourseHub> _hub;

        public SignalRNotifier(IHubContext<BourseHub> hub)
        {
            _hub = hub;
        }

        public async Task NotifierNouveauTradeAsync(string symbole, object trade)
        {
            // TODO : remplacer "object trade" par l'entité Trade une fois disponible (Membre 1)
            await _hub.Clients.Group(symbole).SendAsync("NouveauTrade", trade);
        }

        public async Task NotifierPrixUpdateAsync(string symbole, decimal prix)
        {
            await _hub.Clients.Group(symbole).SendAsync("PrixUpdate", new { symbole, prix, timestamp = DateTime.UtcNow });
        }

        public async Task NotifierOrderBookAsync(string symbole, object book)
        {
            await _hub.Clients.Group(symbole).SendAsync("OrderBookUpdate", book);
        }

        public async Task NotifierPortefeuilleAsync(int userId, object portefeuille)
        {
            // TODO : nécessite un IUserIdProvider configuré pour mapper userId -> connexion SignalR
            await _hub.Clients.User(userId.ToString()).SendAsync("PortefeuilleUpdate", portefeuille);
        }

        public async Task NotifierLeaderboardAsync(object leaderboard)
        {
            await _hub.Clients.All.SendAsync("LeaderboardUpdate", leaderboard);
        }
    }
}