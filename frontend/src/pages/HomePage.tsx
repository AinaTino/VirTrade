import { Link } from 'react-router-dom'
import { CandlestickChart, Activity, ShieldCheck } from 'lucide-react'

export function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)] flex flex-col">
      <header className="mx-auto w-full max-w-[1200px] px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-[4px] bg-[var(--color-brand)] flex items-center justify-center">
            <span className="text-white text-[12px] font-bold font-[var(--font-mono)]">VT</span>
          </div>
          <span className="font-[var(--font-display)] font-semibold text-[16px]">VirTrade</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/connexion" className="text-[13px] font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
            Se connecter
          </Link>
          <Link
            to="/inscription"
            className="text-[13px] font-semibold bg-[var(--color-brand)] text-white px-4 py-2 rounded-[6px] hover:bg-[var(--color-brand-hover)] transition-colors"
          >
            Créer un compte
          </Link>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-[1200px] px-6 flex flex-col lg:flex-row items-center gap-12 py-16">
        <div className="flex-1 max-w-[520px]">
          <span className="inline-block text-[12px] font-semibold text-[var(--color-brand)] bg-[var(--color-brand-soft)] px-2.5 py-1 rounded-[4px] mb-4">
            Projet académique — ENI Fianarantsoa
          </span>
          <h1 className="font-[var(--font-display)] text-[40px] leading-[1.1] font-semibold tracking-tight text-[var(--color-ink)] mb-4">
            Le prix émerge du marché.
            <br />
            Pas d'un algorithme.
          </h1>
          <p className="text-[15px] text-[var(--color-ink-muted)] leading-relaxed mb-8">
            VirTrade est une bourse virtuelle avec carnet d'ordres et moteur de matching en
            temps réel. Passez des ordres Market ou Limit, observez le carnet bouger en direct,
            et suivez votre P&L comme sur un vrai terminal de trading.
          </p>
          <div className="flex items-center gap-3">
            <Link
              to="/inscription"
              className="text-[14px] font-semibold bg-[var(--color-ink)] text-white px-5 py-2.5 rounded-[6px] hover:bg-black transition-colors"
            >
              Démarrer avec 100 000 $ virtuels
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-[var(--color-border)]">
            {[
              { icon: Activity, label: 'Order book live' },
              { icon: CandlestickChart, label: 'Charts OHLC' },
              { icon: ShieldCheck, label: 'Portefeuille simulé' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-start gap-2">
                <Icon size={18} className="text-[var(--color-brand)]" />
                <span className="text-[12px] font-medium text-[var(--color-ink-muted)]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 w-full max-w-[560px] rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 text-[12px] text-[var(--color-ink-muted)]">
            <span className="font-[var(--font-mono)] font-semibold text-[var(--color-ink)]">AAPL</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-bid)] animate-pulse-dot" />
              Live
            </span>
          </div>
          <div className="grid grid-cols-2 gap-px bg-[var(--color-border)] rounded-[6px] overflow-hidden text-[12px] font-[var(--font-mono)] tabular">
            {[
              { p: 150.4, q: 320, s: 'ask' },
              { p: 150.32, q: 180, s: 'ask' },
              { p: 150.25, q: 90, s: 'ask' },
              { p: 149.98, q: 210, s: 'bid' },
              { p: 149.85, q: 140, s: 'bid' },
              { p: 149.7, q: 260, s: 'bid' },
            ].map((row, i) => (
              <div
                key={i}
                className={`px-3 py-1.5 bg-[var(--color-surface)] flex justify-between ${
                  row.s === 'ask' ? 'text-[var(--color-ask)]' : 'text-[var(--color-bid)]'
                }`}
              >
                <span>{row.p.toFixed(2)}</span>
                <span className="text-[var(--color-ink-faint)]">{row.q}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
