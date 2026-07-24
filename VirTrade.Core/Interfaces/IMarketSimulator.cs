namespace VirTrade.Core.Interfaces;

public interface IMarketSimulator
{
    Task DemarrerAsync(CancellationToken ct);
}