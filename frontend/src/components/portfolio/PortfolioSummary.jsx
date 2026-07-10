export default function PortfolioSummary({ portfolio }) {
  if (!portfolio) return <div className="rounded-panel border border-border-hairline bg-bg-surface/90 p-6 text-text-secondary">Chargement du portefeuille...</div>;

  return (
    <section className="rounded-panel border border-border-hairline bg-bg-surface/90 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-accent">Vue d’ensemble</p>
          <h2 className="mt-2 text-xl font-semibold text-text-primary">Performance du portefeuille</h2>
        </div>
        <div className="rounded-panel border border-border-hairline bg-bg-surface-alt px-3 py-2 text-sm text-text-secondary">Synced · 1min</div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-panel border border-border-hairline bg-bg-surface-alt p-4">
          <p className="text-sm text-text-secondary">Valeur totale</p>
          <p className="mt-2 ticker-font text-2xl text-market-bid">{portfolio.valueTotal.toFixed(2)} €</p>
        </div>
        <div className="rounded-panel border border-border-hairline bg-bg-surface-alt p-4">
          <p className="text-sm text-text-secondary">Positions</p>
          <p className="mt-2 ticker-font text-2xl text-text-primary">{portfolio.positions?.length ?? 0}</p>
        </div>
      </div>
    </section>
  );
}
