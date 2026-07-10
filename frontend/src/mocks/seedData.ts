import type { Stock, Utilisateur, LeaderboardEntry } from '../types'

// Stocks de seed suggérés par la doc (section 14)
export const SEED_STOCKS: Stock[] = [
  { id: 1, symbole: 'AAPL', nomComplet: 'Apple Inc.', prixActuel: 150.75, volatilite: 0.015, variation24h: 2.3 },
  { id: 2, symbole: 'TSLA', nomComplet: 'Tesla, Inc.', prixActuel: 250.0, volatilite: 0.032, variation24h: -1.1 },
  { id: 3, symbole: 'MSFT', nomComplet: 'Microsoft Corporation', prixActuel: 412.3, volatilite: 0.012, variation24h: 0.8 },
  { id: 4, symbole: 'GOOGL', nomComplet: 'Alphabet Inc.', prixActuel: 168.5, volatilite: 0.017, variation24h: 1.4 },
  { id: 5, symbole: 'AMZN', nomComplet: 'Amazon.com, Inc.', prixActuel: 185.2, volatilite: 0.019, variation24h: -0.4 },
  { id: 6, symbole: 'NVDA', nomComplet: 'NVIDIA Corporation', prixActuel: 118.6, volatilite: 0.028, variation24h: 3.7 },
]

export const MOCK_USER: Utilisateur = {
  id: 1,
  nom: 'Rakoto Andrianina',
  email: 'demo@virtrade.mg',
  role: 'TRADER',
  createdAt: '2026-06-01T08:00:00.000Z',
}

export const CAPITAL_INITIAL = 100_000

const NOMS_TRADERS = [
  'Rakoto Andrianina', 'Hery Rasoanaivo', 'Voahangy Randria', 'Tojo Rabe',
  'Nirina Andria', 'Fara Rasolofo', 'Mamy Ravelo', 'Sitraka Andrianjafy',
]

export function genererLeaderboard(): LeaderboardEntry[] {
  return NOMS_TRADERS
    .map((nom, i) => {
      const pnlPct = (Math.random() - 0.35) * 40
      const valeurTotale = Math.round(CAPITAL_INITIAL * (1 + pnlPct / 100))
      return {
        rang: 0,
        userId: i + 2,
        nom,
        valeurTotale,
        pnl: valeurTotale - CAPITAL_INITIAL,
        pnlPct: Math.round(pnlPct * 100) / 100,
      }
    })
    .sort((a, b) => b.valeurTotale - a.valeurTotale)
    .map((e, i) => ({ ...e, rang: i + 1 }))
}
