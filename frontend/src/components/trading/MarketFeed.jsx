import { useSignalR } from '../../hooks/useSignalR.js';

export default function MarketFeed() {
  const { connected, marketEvents, latestQuote } = useSignalR();

  return (
    <section className="rounded-panel border border-border-hairline bg-bg-surface/90 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-accent">Flux</p>
          <h2 className="mt-2 text-xl font-semibold text-text-primary">Marché en direct</h2>
        </div>
        <span className={`pulse-live rounded-panel px-3 py-1 text-sm ${connected ? 'bg-market-bid-bg text-market-bid' : 'bg-ask-sell-bg text-ask-sell'}`}>
          {connected ? 'Live' : 'Hors ligne'}
        </span>
      </div>

      <div className="mt-4 rounded-panel border border-border-hairline bg-bg-surface-alt p-4">
        <p className="text-sm text-text-secondary">Dernier prix</p>
        <p className="mt-2 ticker-font text-3xl text-market-bid">{latestQuote ? `${latestQuote.price} €` : '—'}</p>
        {latestQuote?.symbol && <p className="mt-1 text-sm text-text-disabled">{latestQuote.symbol}</p>}
      </div>

      <div className="mt-4 space-y-2">
        {marketEvents.length === 0 ? (
          <p className="rounded-panel border border-border-hairline bg-bg-surface-alt p-4 text-sm text-text-secondary">Aucun événement reçu pour le moment.</p>
        ) : marketEvents.map((event) => (
          <div key={event.id} className="flex items-center justify-between rounded-panel border border-border-hairline bg-bg-surface-alt px-4 py-3">
            <div>
              <p className="text-sm font-medium text-text-primary">{event.message}</p>
              <p className="text-xs text-text-disabled">{event.type}</p>
            </div>
            <span className="text-xs text-text-secondary">{event.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
