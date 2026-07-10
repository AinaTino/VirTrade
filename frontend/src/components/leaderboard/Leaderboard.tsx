import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { getLeaderboard } from '../../api/leaderboard'
import { useSignalR } from '../../hooks/useSignalR'
import { useAuth } from '../../context/AuthContext'
import { formatMontant, formatPourcentage } from '../../lib/format'
import type { LeaderboardEntry, LeaderboardUpdateEvent } from '../../types'

const MEDAILLES = ['text-[#D4A017]', 'text-[#8C97A3]', 'text-[#B87333]']

export function Leaderboard() {
  const { connection } = useSignalR()
  const { utilisateur } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLeaderboard().then((data) => {
      setEntries(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const onUpdate = (payload: unknown) => setEntries((payload as LeaderboardUpdateEvent).entries)
    connection.on('LeaderboardUpdate', onUpdate)
    return () => connection.off('LeaderboardUpdate', onUpdate)
  }, [connection])

  if (loading) {
    return (
      <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-[13px] text-[var(--color-ink-muted)]">
        Chargement du classement…
      </div>
    )
  }

  return (
    <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-ink-muted)]">
            <th className="font-medium px-4 py-2.5 w-14">Rang</th>
            <th className="font-medium px-4 py-2.5">Trader</th>
            <th className="font-medium px-4 py-2.5 text-right">Valeur totale</th>
            <th className="font-medium px-4 py-2.5 text-right">P&L</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const estMoi = entry.nom === utilisateur?.nom
            return (
              <tr
                key={entry.userId}
                className={`border-b border-[var(--color-border)] last:border-0 ${
                  estMoi ? 'bg-[var(--color-brand-soft)]' : ''
                }`}
              >
                <td className="px-4 py-3">
                  {entry.rang <= 3 ? (
                    <Trophy size={15} className={MEDAILLES[entry.rang - 1]} fill="currentColor" />
                  ) : (
                    <span className="tabular font-[var(--font-mono)] text-[var(--color-ink-muted)]">{entry.rang}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">
                  {entry.nom} {estMoi && <span className="text-[11px] text-[var(--color-brand)]">(vous)</span>}
                </td>
                <td className="px-4 py-3 text-right tabular font-[var(--font-mono)] font-medium">
                  {formatMontant(entry.valeurTotale)}
                </td>
                <td
                  className={`px-4 py-3 text-right tabular font-[var(--font-mono)] font-medium ${
                    entry.pnl >= 0 ? 'text-[var(--color-bid)]' : 'text-[var(--color-ask)]'
                  }`}
                >
                  {formatPourcentage(entry.pnlPct)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
