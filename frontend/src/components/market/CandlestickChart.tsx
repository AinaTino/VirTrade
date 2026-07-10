import { useEffect, useState } from 'react'
import Chart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { getHistorique, getStock } from '../../api/stocks'
import { useSignalR } from '../../hooks/useSignalR'
import type { HistoriquePrix, PrixUpdateEvent } from '../../types'

export function CandlestickChart({ symbole }: { symbole: string }) {
  const { connection } = useSignalR()
  const [historique, setHistorique] = useState<HistoriquePrix[]>([])
  const [loading, setLoading] = useState(true)

  const ajouterCours = (prix: number, timestamp = new Date().toISOString()) => {
    setHistorique((previous) => {
      const derniere = previous.at(-1)
      if (!derniere) {
        return [{ timestamp, open: prix, high: prix, low: prix, close: prix, volume: 0 }]
      }

      // Une bougie représente une minute, comme l'OHLC persistant du backend.
      // Les snapshots obtenus toutes les 3 s mettent donc à jour la même bougie
      // au lieu d'en créer une avec un espace artificiel entre chaque tick.
      const date = new Date(timestamp)
      date.setSeconds(0, 0)
      const periode = date.toISOString()
      if (derniere.timestamp === periode) {
        return [
          ...previous.slice(0, -1),
          {
            ...derniere,
            high: Math.max(derniere.high, prix),
            low: Math.min(derniere.low, prix),
            close: prix,
          },
        ]
      }

      return [
        ...previous.slice(-59),
        { timestamp: periode, open: derniere.close, high: prix, low: prix, close: prix, volume: 0 },
      ]
    })
  }

  useEffect(() => {
    let active = true
    setLoading(true)
    const refresh = async () => {
      try {
        const data = await getHistorique(symbole)
        if (!active) return
        if (data.length > 0) {
          setHistorique(data)
        } else {
          const stock = await getStock(symbole)
          if (active) ajouterCours(stock.prixActuel)
        }
      } catch {
        // Keep the last successful candle series while the API is unavailable.
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
  }, [symbole])

  useEffect(() => {
    const onPrixUpdate = (payload: unknown) => {
      const { symbole: s, prix } = payload as PrixUpdateEvent
      if (s !== symbole) return
      ajouterCours(prix)
    }
    connection.on('PrixUpdate', onPrixUpdate)
    void connection.invoke('AbonnerStock', symbole).catch(() => {})
    return () => {
      connection.off('PrixUpdate', onPrixUpdate)
      void connection.invoke('SeDesabonner', symbole).catch(() => {})
    }
  }, [connection, symbole])

  if (loading) {
    return (
      <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 h-[380px] flex items-center justify-center text-[13px] text-[var(--color-ink-muted)]">
        Chargement du graphique…
      </div>
    )
  }

  if (historique.length === 0) {
    return (
      <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 h-[380px] flex items-center justify-center text-[13px] text-[var(--color-ink-muted)]">
        Aucune bougie disponible pour ce titre.
      </div>
    )
  }

  const series = [
    {
      data: historique.map((b) => ({
        x: new Date(b.timestamp).getTime(),
        y: [b.open, b.high, b.low, b.close],
      })),
    },
  ]

  const options: ApexOptions = {
    chart: {
      type: 'candlestick',
      toolbar: { show: false },
      fontFamily: 'JetBrains Mono, monospace',
      animations: { enabled: false },
      background: 'transparent',
    },
    grid: { borderColor: '#E3E6EB', strokeDashArray: 3 },
    xaxis: {
      type: 'datetime',
      labels: { style: { colors: '#667085', fontSize: '11px' } },
      axisBorder: { color: '#E3E6EB' },
      axisTicks: { color: '#E3E6EB' },
    },
    yaxis: {
      opposite: true,
      labels: {
        style: { colors: '#667085', fontSize: '11px' },
        formatter: (v: number) => v.toFixed(4),
      },
    },
    plotOptions: {
      candlestick: {
        colors: { upward: '#0E9F6E', downward: '#E11D48' },
        wick: { useFillColor: true },
      },
    },
    tooltip: { theme: 'light' },
  }

  return (
    <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <Chart options={options} series={series} type="candlestick" height={380} />
    </div>
  )
}
