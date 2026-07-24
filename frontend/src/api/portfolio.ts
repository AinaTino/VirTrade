import { apiClient } from './client'
import type { Portefeuille, Position } from '../types'

function normalizePosition(position: any): Position {
  const prixActuel = Number(position.prixActuel ?? position.prix ?? 0)
  const quantiteDetenue = Number(position.quantiteDetenue ?? 0)
  const prixMoyenAchat = Number(position.prixMoyenAchat ?? 0)
  const valeurMarche = Number(position.valeurMarche ?? position.valeur ?? quantiteDetenue * prixActuel)
  const pnl = Number(position.pnl ?? position.pnlPosition ?? (prixActuel - prixMoyenAchat) * quantiteDetenue)
  const pnlPct = Number(
    position.pnlPct ??
      (position.pnlPourcentage ?? (prixMoyenAchat ? ((prixActuel - prixMoyenAchat) / prixMoyenAchat) * 100 : 0))
  )

  return {
    ...position,
    stockId: position.stockId ?? position.stock_id,
    symbole: position.symbole,
    nomComplet: position.nomComplet,
    quantiteDetenue,
    prixMoyenAchat,
    prixActuel,
    valeurMarche,
    pnl,
    pnlPct,
  }
}

export function normalizePortefeuillePayload(data: any): Portefeuille {
  const positions = Array.isArray(data?.positions) ? data.positions.map(normalizePosition) : []
  const soldeCash = Number(data?.soldeCash ?? 0)
  const capitalInitial = Number(data?.capitalInitial ?? 0)
  const valeurTotale = Number(
    data?.valeurTotale ??
      soldeCash + positions.reduce((sum: number, position: Position) => sum + (position.valeurMarche ?? 0), 0)
  )
  const pnl = Number(data?.pnl ?? valeurTotale - capitalInitial)
  const pnlPct = Number(data?.pnlPct ?? data?.pnlPourcentage ?? (capitalInitial ? (pnl / capitalInitial) * 100 : 0))

  return {
    soldeCash,
    valeurTotale,
    capitalInitial,
    pnl,
    pnlPct,
    positions,
  }
}

export async function getPortefeuille(): Promise<Portefeuille> {
  const { data } = await apiClient.get<any>('/portfolio')
  return normalizePortefeuillePayload(data)
}

export async function getPositions(): Promise<Position[]> {
  const { data } = await apiClient.get<any[]>('/portfolio/positions')
  return data.map(normalizePosition)
}
