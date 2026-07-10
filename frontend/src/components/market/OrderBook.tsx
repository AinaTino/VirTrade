import { useOrderBook } from '../../hooks/useOrderBook'
import { formatNombre } from '../../lib/format'

export function OrderBook({ symbole }: { symbole: string }) {
  const { orderBook, loading, error } = useOrderBook(symbole)

  if (loading) {
    return (
      <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center text-[13px] text-[var(--color-ink-muted)]">
        Chargement du carnet d'ordres…
      </div>
    )
  }

  if (!orderBook) {
    return (
      <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-[13px] text-[var(--color-ink-muted)]">
        {error ?? 'Carnet indisponible.'}
      </div>
    )
  }

  const volumeMax = Math.max(
    ...orderBook.bids.map((b) => b.quantite),
    ...orderBook.asks.map((a) => a.quantite),
    1
  )

  return (
    <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)]">
        <h3 className="text-[13px] font-semibold font-[var(--font-display)]">Carnet d'ordres</h3>
        <span className="text-[12px] text-[var(--color-ink-muted)]">
          Spread{' '}
          <span className="font-[var(--font-mono)] font-medium text-[var(--color-ink)] tabular">
            {formatNombre(orderBook.spread)}
          </span>
        </span>
      </div>

      <div className="grid grid-cols-2 divide-x divide-[var(--color-border)]">
        {/* ASKS — vendeurs, triés du plus bas au plus haut */}
        <div>
          <div className="grid grid-cols-2 px-3 py-1.5 text-[11px] font-medium text-[var(--color-ink-faint)]">
            <span>Prix</span>
            <span className="text-right">Qté</span>
          </div>
          <div className="flex flex-col-reverse">
            {orderBook.asks.map((niveau, i) => (
              <div key={i} className="relative grid grid-cols-2 px-3 py-[3px] text-[12px] tabular font-[var(--font-mono)]">
                <div
                  className="absolute inset-y-0 right-0 bg-[var(--color-ask-soft)]"
                  style={{ width: `${(niveau.quantite / volumeMax) * 100}%` }}
                />
                <span className="relative text-[var(--color-ask)] font-medium">{formatNombre(niveau.prix)}</span>
                <span className="relative text-right text-[var(--color-ink-muted)]">{niveau.quantite}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BIDS — acheteurs, triés du plus haut au plus bas */}
        <div>
          <div className="grid grid-cols-2 px-3 py-1.5 text-[11px] font-medium text-[var(--color-ink-faint)]">
            <span>Prix</span>
            <span className="text-right">Qté</span>
          </div>
          {orderBook.bids.map((niveau, i) => (
            <div key={i} className="relative grid grid-cols-2 px-3 py-[3px] text-[12px] tabular font-[var(--font-mono)]">
              <div
                className="absolute inset-y-0 left-0 bg-[var(--color-bid-soft)]"
                style={{ width: `${(niveau.quantite / volumeMax) * 100}%` }}
              />
              <span className="relative text-[var(--color-bid)] font-medium">{formatNombre(niveau.prix)}</span>
              <span className="relative text-right text-[var(--color-ink-muted)]">{niveau.quantite}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
