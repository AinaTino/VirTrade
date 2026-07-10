import { useCallback, useEffect, useState } from 'react'
import { useSignalR } from './useSignalR'
import { getOrderBook } from '../api/stocks'
import type { OrderBookSnapshot } from '../types'

type ApiOrder = {
  prix?: number | null
  Prix?: number | null
  prixLimite?: number | null
  PrixLimite?: number | null
  quantite?: number
  Quantite?: number
  quantiteExecutee?: number
  QuantiteExecutee?: number
}

function aggregateLevels(orders: ApiOrder[] = []) {
  const levels = new Map<number, number>()
  for (const order of orders) {
    const prix = order.prix ?? order.Prix ?? order.prixLimite ?? order.PrixLimite
    if (prix == null || !Number.isFinite(prix)) continue
    const quantite = order.quantite ?? order.Quantite ?? 0
    const quantiteExecutee = order.quantiteExecutee ?? order.QuantiteExecutee ?? 0
    const remaining = quantite - quantiteExecutee
    if (remaining > 0) levels.set(prix, (levels.get(prix) ?? 0) + remaining)
  }
  return [...levels].map(([prix, quantite]) => ({ prix, quantite }))
}

function normalizeUpdate(symbole: string, payload: unknown): OrderBookSnapshot | null {
  const data = payload as {
    symbole?: string
    bids?: ApiOrder[]
    asks?: ApiOrder[]
    Bids?: ApiOrder[]
    Asks?: ApiOrder[]
    spread?: number
    Spread?: number
    timestamp?: string
    Timestamp?: string
  }

  const bidsData = Array.isArray(data.bids) ? data.bids : Array.isArray(data.Bids) ? data.Bids : undefined
  const asksData = Array.isArray(data.asks) ? data.asks : Array.isArray(data.Asks) ? data.Asks : undefined

  if (!bidsData && !asksData) return null

  const bids = aggregateLevels(bidsData).sort((a, b) => b.prix - a.prix)
  const asks = aggregateLevels(asksData).sort((a, b) => a.prix - b.prix)

  if (bids.length === 0 && asks.length === 0) return null

  return {
    symbole: data.symbole ?? symbole,
    bids,
    asks,
    spread: data.spread ?? data.Spread ?? (bids[0] && asks[0] ? asks[0].prix - bids[0].prix : 0),
    timestamp: data.timestamp ?? data.Timestamp ?? new Date().toISOString(),
  }
}

export function useOrderBook(symbole: string) {
  const { connection } = useSignalR()
  const [orderBook, setOrderBook] = useState<OrderBookSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const snapshot = await getOrderBook(symbole)
      setOrderBook(snapshot)
    } catch (err: any) {
      setError(err?.response?.status === 404 ? 'Le snapshot du carnet n’est pas encore exposé par le backend.' : 'Impossible de charger le carnet.')
    } finally {
      setLoading(false)
    }
  }, [symbole])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    let isMounted = true

    const onUpdate = (payload: unknown) => {
      if (!isMounted) return
      const data = normalizeUpdate(symbole, payload)
      if (data && data.symbole === symbole) {
        setOrderBook(data)
        setError(null)
      }
    }

    try {
      if (connection && typeof (connection as any).invoke === 'function') {
        ;(connection as any)
          .invoke('AbonnerStock', symbole)
          .then(() => {
            if (isMounted) connection.on('OrderBookUpdate', onUpdate)
          })
          .catch(() => {
            // subscription failed; continue with REST data
          })
      }
    } catch {
      // connection not ready; continue with REST data
    }

    return () => {
      isMounted = false
      if (connection && typeof (connection as any).invoke === 'function') {
        try {
          connection.off('OrderBookUpdate', onUpdate)
          ;(connection as any).invoke('SeDesabonner', symbole).catch(() => {})
        } catch {}
      }
    }
  }, [connection, symbole])

  return { orderBook, loading, error, refresh }
}
