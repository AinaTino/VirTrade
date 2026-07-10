import { apiClient } from './client'
import type { Portefeuille, Position } from '../types'

export async function getPortefeuille(): Promise<Portefeuille> {
  const [{ data: portefeuille }, { data: pnl }] = await Promise.all([apiClient.get('/portfolio'), apiClient.get('/portfolio/pnl')])
  return {
    soldeCash: portefeuille.soldeCash,
    valeurTotale: portefeuille.valeurTotale,
    capitalInitial: pnl.capitalInitial,
    pnl: pnl.pnl,
    pnlPct: pnl.pnlPourcentage,
    positions: portefeuille.positions.map((position: any) => ({
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
