import Positions from './Positions.jsx';

export default function Portfolio({ portfolio }) {
  if (!portfolio) return <div className="rounded-panel border border-border-hairline bg-bg-surface/90 p-6 text-text-secondary">Chargement du portefeuille...</div>;

  return (
    <section className="rounded-panel border border-border-hairline bg-bg-surface/90 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-accent">Portefeuille</p>
          <h2 className="mt-2 text-xl font-semibold text-text-primary">Positions ouvertes</h2>
        </div>
        <div className="rounded-panel border border-border-hairline bg-bg-surface-alt px-3 py-2 text-sm text-text-secondary">
          {portfolio.positions?.length ?? 0} titres
        </div>
      </div>
      <div className="mt-4 rounded-panel border border-border-hairline bg-bg-surface-alt p-4 text-sm text-text-secondary">
        Valeur totale : <span className="ml-2 font-semibold text-market-bid">{portfolio.valueTotal.toFixed(2)} €</span>
      </div>
      <div className="mt-6">
        <Positions positions={portfolio.positions} />
      </div>
    </section>
  );
}
