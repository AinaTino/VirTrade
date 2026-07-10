import { useMemo } from 'react';

export default function MarketOverview({ stocks }) {
  const averagePrice = useMemo(() => {
    if (!stocks.length) return 0;
    return stocks.reduce((acc, stock) => acc + stock.prixActuel, 0) / stocks.length;
  }, [stocks]);

  return (
    <section className="rounded-panel border border-border-hairline bg-bg-surface/90 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-accent">Vue marché</p>
          <h2 className="mt-2 text-xl font-semibold text-text-primary">Surveillance continue</h2>
        </div>
        <div className="rounded-panel border border-border-hairline bg-bg-surface-alt px-3 py-2 text-sm text-text-secondary">
          24h · live feed
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-panel border border-border-hairline bg-bg-surface-alt p-4">
          <p className="text-sm text-text-secondary">Actions suivies</p>
          <p className="mt-2 ticker-font text-2xl text-text-primary">{stocks.length}</p>
        </div>
        <div className="rounded-panel border border-border-hairline bg-bg-surface-alt p-4">
          <p className="text-sm text-text-secondary">Prix moyen</p>
          <p className="mt-2 ticker-font text-2xl text-market-bid">{averagePrice.toFixed(2)} €</p>
        </div>
        <div className="rounded-panel border border-border-hairline bg-bg-surface-alt p-4">
          <p className="text-sm text-text-secondary">Spread</p>
          <p className="mt-2 ticker-font text-2xl text-warn">0.14%</p>
        </div>
      </div>
    </section>
  );
}
