import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { CandlestickChart } from '../components/market/CandlestickChart'
import { OrderBook } from '../components/market/OrderBook'
import { OrderForm } from '../components/trading/OrderForm'
import { getStock, getStocks } from '../api/stocks'
import { useSignalR } from '../hooks/useSignalR'
import { formatMontant, formatPourcentage } from '../lib/format'
import type { Stock, PrixUpdateEvent } from '../types'

export function TradingPage() {
  const { symbole } = useParams<{ symbole: string }>()
  const navigate = useNavigate()
  const { connection } = useSignalR()
  const [stock, setStock] = useState<Stock | null>(null)
  const [tousLesStocks, setTousLesStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const prixReference = useRef<number | null>(null)

  useEffect(() => {
    getStocks().then(setTousLesStocks)
  }, [])

  useEffect(() => {
    if (!symbole) return
    let active = true
    setLoading(true)
    prixReference.current = null
    const refresh = async () => {
      try {
        const next = await getStock(symbole)
        if (active) {
          setStock(() => {
            prixReference.current ??= next.prixActuel
            const variation24h = prixReference.current
              ? ((next.prixActuel - prixReference.current) / prixReference.current) * 100
              : 0
            return { ...next, variation24h }
          })
        }
      } catch {
        if (active) navigate('/marche')
      } finally {
        if (active) setLoading(false)
      }
    }
    void refresh()
    // Augmenté de 3000ms à 10000ms (10s) pour réduire la charge
    // SignalR handle les mises à jour temps réel, polling est fallback seulement
    const interval = window.setInterval(() => void refresh(), 10000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [symbole, navigate])

  useEffect(() => {
    const onPrixUpdate = (payload: unknown) => {
      const { symbole: s, prix } = payload as PrixUpdateEvent
      setStock((prev) => {
        if (!prev || prev.symbole !== s) return prev
        prixReference.current ??= prev.prixActuel
        const variation24h = prixReference.current
          ? ((prix - prixReference.current) / prixReference.current) * 100
          : 0
        return { ...prev, prixActuel: prix, variation24h }
      })
    }
    connection.on('PrixUpdate', onPrixUpdate)
    void connection.invoke('AbonnerStock', symbole).catch(() => {})
    return () => connection.off('PrixUpdate', onPrixUpdate)
  }, [connection, symbole])

  if (!symbole) {
    return (
      <AppShell>
        <p className="text-[13px] text-[var(--color-ink-muted)]">
          Choisissez un titre depuis le{' '}
          <button onClick={() => navigate('/marche')} className="text-[var(--color-brand)] font-medium hover:underline">
            marché
          </button>
          .
        </p>
      </AppShell>
    )
  }

  const [orderBookRefreshToken, setOrderBookRefreshToken] = useState(0)

  return (
    <AppShell>
      {/* Sélecteur rapide de ticker */}
      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
        {tousLesStocks.map((s) => (
          <button
            key={s.symbole}
            onClick={() => navigate(`/trading/${s.symbole}`)}
            className={`px-3 py-1.5 rounded-[6px] text-[12px] font-[var(--font-mono)] font-semibold whitespace-nowrap transition-colors ${
              s.symbole === symbole
                ? 'bg-[var(--color-ink)] text-white'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            {s.symbole}
          </button>
        ))}
      </div>

      {loading || !stock ? (
        <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-[13px] text-[var(--color-ink-muted)]">
          Chargement…
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-3 mb-4">
            <h1 className="font-[var(--font-display)] text-[22px] font-semibold">{stock.symbole}</h1>
            <span className="text-[13px] text-[var(--color-ink-muted)]">{stock.nomComplet}</span>
            <span className="text-[20px] font-[var(--font-mono)] font-semibold tabular ml-auto">
              {formatMontant(stock.prixActuel)}
            </span>
            <span
              className={`text-[13px] font-[var(--font-mono)] font-medium tabular ${
                stock.variation24h >= 0 ? 'text-[var(--color-bid)]' : 'text-[var(--color-ask)]'
              }`}
            >
              {formatPourcentage(stock.variation24h)}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
            <div className="space-y-4">
              <CandlestickChart symbole={stock.symbole} />
              <OrderBook symbole={stock.symbole} refreshKey={orderBookRefreshToken} />
            </div>
            <div>
              <OrderForm stock={stock} onOrdrePasse={() => setOrderBookRefreshToken((current) => current + 1)} />
            </div>
          </div>
        </>
      )}
    </AppShell>
  )
}
