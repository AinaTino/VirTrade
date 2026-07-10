import { useEffect, useState } from 'react'
import { useSignalR } from './useSignalR'
import { getPortefeuille } from '../api/portfolio'
import type { Portefeuille, PortefeuilleUpdateEvent } from '../types'

export function usePortfolio() {
  const { connection } = useSignalR()
  const [portefeuille, setPortefeuille] = useState<Portefeuille | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPortefeuille().then((p) => {
      setPortefeuille(p)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const onUpdate = (payload: unknown) => setPortefeuille(payload as PortefeuilleUpdateEvent)
    connection.on('PortefeuilleUpdate', onUpdate)
    return () => connection.off('PortefeuilleUpdate', onUpdate)
  }, [connection])

  return { portefeuille, loading }
}
