import { useEffect, useState } from 'react'
import { useSignalR } from './useSignalR'
import { getPortefeuille, normalizePortefeuillePayload } from '../api/portfolio'
import type { Portefeuille, PortefeuilleUpdateEvent } from '../types'

export function usePortfolio() {
  const { connection } = useSignalR()
  const [portefeuille, setPortefeuille] = useState<Portefeuille | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const p = await getPortefeuille()
      setPortefeuille(p)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  useEffect(() => {
    const onUpdate = (payload: unknown) => setPortefeuille(normalizePortefeuillePayload(payload as PortefeuilleUpdateEvent))
    connection.on('PortefeuilleUpdate', onUpdate)
    return () => connection.off('PortefeuilleUpdate', onUpdate)
  }, [connection])

  return { portefeuille, loading, refresh }
}
