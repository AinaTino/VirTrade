import { apiClient } from './client'
import type { Ordre, SensOrdre, TypeOrdre } from '../types'

export interface PlacerOrdrePayload {
  symbole: string
  type: TypeOrdre
  sens: SensOrdre
  quantite: number
  prixLimite?: number
}

export interface PlacerOrdreResponse {
  ordreId: number
  statut: Ordre['statut']
  quantiteExecutee: number
  tradesExecutes: { prixExecution: number; quantite: number }[]
}

const enumValue = (value: string) => ({ MARKET: 0, LIMIT: 1, BUY: 0, SELL: 1, OPEN: 0, PARTIAL: 1, FILLED: 2, CANCELLED: 3 }[value])
const statutFromApi = (value: number | string): Ordre['statut'] =>
  typeof value === 'number' ? (['OPEN', 'PARTIAL', 'FILLED', 'CANCELLED'][value] as Ordre['statut']) : value.toUpperCase() as Ordre['statut']

export async function placerOrdre(payload: PlacerOrdrePayload): Promise<PlacerOrdreResponse> {
  const { data } = await apiClient.post<{
    id: number
    statut: number | string
    quantiteExecutee?: number
    tradesExecutes: number
  }>('/orders', {
    symbole: payload.symbole,
    typeOrdre: enumValue(payload.type),
    sensOrdre: enumValue(payload.sens),
    quantite: payload.quantite,
    prixLimite: payload.prixLimite ?? null,
    expiresAt: null,
  })
  return {
    ordreId: data.id,
    statut: statutFromApi(data.statut),
    quantiteExecutee: data.quantiteExecutee ?? 0,
    tradesExecutes: [],
  }
}

export async function getOrdres(): Promise<Ordre[]> {
  const { data } = await apiClient.get<Ordre[]>('/orders')
  return data
}

export async function annulerOrdre(id: number): Promise<void> {
  await apiClient.delete(`/orders/${id}`)
}
