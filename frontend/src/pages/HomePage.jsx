import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-panel border border-border-hairline bg-bg-surface/90 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.24em] text-accent">VirTrade · Terminal de marché</p>
            <h1 className="mt-3 text-3xl font-semibold text-text-primary sm:text-4xl">Votre salle de marché en temps réel.</h1>
            <p className="mt-4 text-base text-text-secondary">
              Surveillez les prix, passez vos ordres et suivez votre portefeuille depuis une interface pensée pour le trading.
            </p>
          </div>
          <div className="rounded-panel border border-border-hairline bg-bg-surface-alt px-4 py-3 text-sm text-text-secondary">
            <p className="uppercase tracking-[0.2em] text-text-disabled">Session</p>
            <p className="mt-2 ticker-font text-text-primary">09:42:18 UTC</p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <div className="rounded-panel border border-border-hairline bg-bg-surface-alt p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-text-disabled">Marché</p>
            <p className="mt-2 ticker-font text-xl text-text-primary">+0.83%</p>
          </div>
          <div className="rounded-panel border border-border-hairline bg-bg-surface-alt p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-text-disabled">Ordres</p>
            <p className="mt-2 ticker-font text-xl text-text-primary">12 ouverts</p>
          </div>
          <div className="rounded-panel border border-border-hairline bg-bg-surface-alt p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-text-disabled">Portefeuille</p>
            <p className="mt-2 ticker-font text-xl text-market-bid">+$1,240</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/market" className="rounded-panel bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4a84ff]">Voir le marché</Link>
          <Link to="/trading" className="rounded-panel border border-border-hairline bg-bg-surface-alt px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-bg-surface">Passer un ordre</Link>
          <Link to="/portfolio" className="rounded-panel border border-market-bid/30 bg-market-bid/10 px-4 py-2 text-sm font-medium text-market-bid transition hover:bg-market-bid/20">Analyser le portefeuille</Link>
        </div>
      </div>
    </section>
  );
}
