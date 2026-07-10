import { AppShell } from '../components/layout/AppShell'
import { StockList } from '../components/market/StockList'

export function MarketPage() {
  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="font-[var(--font-display)] text-[20px] font-semibold">Marché</h1>
        <p className="text-[13px] text-[var(--color-ink-muted)]">Prix en temps réel — cliquez sur un titre pour trader.</p>
      </div>
      <StockList />
    </AppShell>
  )
}
