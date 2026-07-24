import { AppShell } from '../components/layout/AppShell'
import { Portfolio } from '../components/portfolio/Portfolio'
import { Positions } from '../components/portfolio/Positions'

export function PortfolioPage() {
  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="font-[var(--font-display)] text-[20px] font-semibold">Portefeuille</h1>
        <p className="text-[13px] text-[var(--color-ink-muted)]">Vos positions et votre performance en temps réel.</p>
      </div>
      <div className="space-y-4">
        <Portfolio />
        <Positions />
      </div>
    </AppShell>
  )
}
