import { apiClient } from './client'
import type { Portefeuille, Position } from '../types'

export async function getPortefeuille(): Promise<Portefeuille> {
  // Optimisation : Récupère tout en une seule requête (portfolio + pnl combinés)
  const { data } = await apiClient.get('/portfolio')
  return {
    soldeCash: data.soldeCash,
    valeurTotale: data.valeurTotale,
    capitalInitial: data.capitalInitial,
    pnl: data.pnl,
    pnlPct: data.pnlPourcentage,
    positions: data.positions.map((position: any) => ({
      ...position,
      valeurMarche: position.valeur,
      pnl: position.pnlPosition ?? 0,
      pnlPct: position.prixMoyenAchat ? ((position.prixActuel - position.prixMoyenAchat) / position.prixMoyenAchat) * 100 : 0,
    })),
  }
}

export async function getPositions(): Promise<Position[]> {
  const { data } = await apiClient.get<any[]>('/portfolio/positions')
  return data.map((position) => ({ ...position, valeurMarche: position.valeur, pnl: position.pnlPosition, pnlPct: position.prixMoyenAchat ? ((position.prixActuel - position.prixMoyenAchat) / position.prixMoyenAchat) * 100 : 0 }))
}
