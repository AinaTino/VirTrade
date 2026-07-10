import { apiClient } from './client'
import type { LeaderboardEntry } from '../types'

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data } = await apiClient.get<any[]>('/leaderboard')
  return data.map((entry) => ({ ...entry, userId: entry.utilisateurId, pnl: 0, pnlPct: 0 }))
}
