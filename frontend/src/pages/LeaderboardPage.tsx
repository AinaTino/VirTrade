import { AppShell } from '../components/layout/AppShell'
import { Leaderboard } from '../components/leaderboard/Leaderboard'

export function LeaderboardPage() {
  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="font-[var(--font-display)] text-[20px] font-semibold">Classement</h1>
        <p className="text-[13px] text-[var(--color-ink-muted)]">Les meilleurs traders, classés par valeur de portefeuille.</p>
      </div>
      <Leaderboard />
    </AppShell>
  )
}
