using Microsoft.AspNetCore.SignalR;

namespace VirTrade.Infrastructure.Notifications
{
    public class BourseHub : Hub
    {
        public async Task AbonnerStock(string symbole)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, symbole);
        }

        public async Task SeDesabonner(string symbole)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, symbole);
        }

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}