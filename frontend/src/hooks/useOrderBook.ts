import { useEffect, useState } from 'react'
import { useSignalR } from './useSignalR'
import { getOrderBook } from '../api/stocks'
import type { OrderBookSnapshot } from '../types'

type ApiOrder = {
  prixLimite?: number | null
  quantite?: number
  quantiteExecutee?: number
}

function aggregateLevels(orders: ApiOrder[] = []) {
  const levels = new Map<number, number>()
  for (const order of orders) {
    if (order.prixLimite == null || !Number.isFinite(order.prixLimite)) continue
    const remaining = (order.quantite ?? 0) - (order.quantiteExecutee ?? 0)
    if (remaining > 0) levels.set(order.prixLimite, (levels.get(order.prixLimite) ?? 0) + remaining)
  }
  return [...levels].map(([prix, quantite]) => ({ prix, quantite }))
}

function normalizeUpdate(symbole: string, payload: unknown): OrderBookSnapshot | null {
  const data = payload as {
    symbole?: string
    bids?: ApiOrder[]
    asks?: ApiOrder[]
    spread?: number
    timestamp?: string
  }
  if (!data || (!Array.isArray(data.bids) && !Array.isArray(data.asks))) return null

  const bids = aggregateLevels(data.bids).sort((a, b) => b.prix - a.prix)
  const asks = aggregateLevels(data.asks).sort((a, b) => a.prix - b.prix)
  return {
    symbole: data.symbole ?? symbole,
    bids,
    asks,
    spread: data.spread ?? (bids[0] && asks[0] ? asks[0].prix - bids[0].prix : 0),
    timestamp: data.timestamp ?? new Date().toISOString(),
  }
}

export function useOrderBook(symbole: string) {
  const { connection } = useSignalR()
  const [orderBook, setOrderBook] = useState<OrderBookSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load initial orderbook from REST API (always works, falls back to local generator)
  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)
    getOrderBook(symbole)
      .then((snapshot) => {
        if (isMounted) {
          setOrderBook(snapshot)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.response?.status === 404 ? 'Le snapshot du carnet n’est pas encore exposé par le backend.' : 'Impossible de charger le carnet.')
          setLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [symbole])

  // Listen for SignalR updates (opportunistically, no blocking)
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
      // attempt to subscribe if connection allows
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

  return { orderBook, loading, error }
}
