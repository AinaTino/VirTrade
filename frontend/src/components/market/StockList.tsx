import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { getStocks } from '../../api/stocks'
import { useSignalR } from '../../hooks/useSignalR'
import { formatMontant, formatPourcentage } from '../../lib/format'
import type { Stock, PrixUpdateEvent } from '../../types'

export function StockList() {
  const navigate = useNavigate()
  const { connection } = useSignalR()
  const [stocks, setStocks] = useState<Stock[]>([])
  const [flash, setFlash] = useState<Record<string, 'up' | 'down'>>({})
  const [loading, setLoading] = useState(true)
  const prixPrecedents = useRef<Record<string, number>>({})

  useEffect(() => {
    let active = true
    const refresh = async () => {
      try {
        const data = await getStocks()
        if (!active) return
        setStocks((previous) => data.map((stock) => {
          const precedent = prixPrecedents.current[stock.symbole]
          if (precedent !== undefined && precedent !== stock.prixActuel) {
            setFlash((current) => ({ ...current, [stock.symbole]: stock.prixActuel > precedent ? 'up' : 'down' }))
          }
          prixPrecedents.current[stock.symbole] = stock.prixActuel
          const initial = previous.find((item) => item.symbole === stock.symbole)?.prixActuel ?? stock.prixActuel
          return { ...stock, variation24h: initial ? ((stock.prixActuel - initial) / initial) * 100 : 0 }
        }))
      } catch {
        // Keep the last successful market snapshot while the API is unavailable.
      } finally {
        if (active) setLoading(false)
      }
    }
    void refresh()
    const interval = window.setInterval(() => void refresh(), 3000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const onPrixUpdate = (payload: unknown) => {
      const { symbole, prix } = payload as PrixUpdateEvent
      setStocks((prev) => prev.map((s) => (s.symbole === symbole ? { ...s, prixActuel: prix } : s)))

      const precedent = prixPrecedents.current[symbole]
      if (precedent !== undefined) {
        setFlash((f) => ({ ...f, [symbole]: prix >= precedent ? 'up' : 'down' }))
        setTimeout(() => setFlash((f) => ({ ...f, [symbole]: undefined as unknown as 'up' })), 700)
      }
      prixPrecedents.current[symbole] = prix
    }
    connection.on('PrixUpdate', onPrixUpdate)
    return () => connection.off('PrixUpdate', onPrixUpdate)
  }, [connection])

  if (loading) {
    return (
      <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-[13px] text-[var(--color-ink-muted)]">
        Chargement du marché…
      </div>
    )
  }

  return (
    <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-ink-muted)]">
            <th className="font-medium px-4 py-2.5">Symbole</th>
            <th className="font-medium px-4 py-2.5 hidden sm:table-cell">Nom</th>
            <th className="font-medium px-4 py-2.5 text-right">Prix</th>
            <th className="font-medium px-4 py-2.5 text-right">Var. 24h</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr
              key={stock.id}
              onClick={() => navigate(`/trading/${stock.symbole}`)}
              className={`border-b border-[var(--color-border)] last:border-0 cursor-pointer hover:bg-[var(--color-canvas)] transition-colors ${
                flash[stock.symbole] === 'up' ? 'flash-up' : flash[stock.symbole] === 'down' ? 'flash-down' : ''
              }`}
            >
              <td className="px-4 py-3">
                <span className="font-[var(--font-mono)] font-semibold">{stock.symbole}</span>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell text-[var(--color-ink-muted)]">{stock.nomComplet}</td>
              <td className="px-4 py-3 text-right tabular font-[var(--font-mono)] font-medium">
                {formatMontant(stock.prixActuel)}
              </td>
              <td className="px-4 py-3 text-right">
                <span
                  className={`inline-flex items-center gap-1 tabular font-[var(--font-mono)] font-medium ${
                    stock.variation24h >= 0 ? 'text-[var(--color-bid)]' : 'text-[var(--color-ask)]'
                  }`}
                >
                  {stock.variation24h >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {formatPourcentage(stock.variation24h)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
