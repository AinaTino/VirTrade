using VirTrade.Core.Interfaces;

namespace VirTrade.API;

public class MarketSimulatorHostedService : BackgroundService
{
    private readonly IMarketSimulator _simulator;

    public MarketSimulatorHostedService(IMarketSimulator simulator)
    {
        _simulator = simulator;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await _simulator.DemarrerAsync(stoppingToken);
    }
}