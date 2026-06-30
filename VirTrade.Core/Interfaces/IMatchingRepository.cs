using VirTrade.Core.Entities;

namespace VirTrade.Core.Interfaces;

public interface IMatchingRepository
{
    Task PersisterTradeAsync(
        Trade trade,
        Ordre bid,
        Ordre ask,
        int qteMatch,
        decimal prixExecution);
}