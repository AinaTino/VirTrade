import { apiClient } from './client'
import type { Stock, OrderBookSnapshot, HistoriquePrix } from '../types'

export async function getStocks(): Promise<Stock[]> {
  const { data } = await apiClient.get<Array<Omit<Stock, 'variation24h'>>>('/stocks')
  return data.map((stock) => ({ ...stock, variation24h: 0 }))
}

export async function getStock(symbole: string): Promise<Stock> {
  const { data } = await apiClient.get<Omit<Stock, 'variation24h'>>(`/stocks/${symbole}`)
  return { ...data, variation24h: 0 }
}

export async function getOrderBook(symbole: string): Promise<OrderBookSnapshot> {
  const { data } = await apiClient.get<OrderBookSnapshot>(`/stocks/${symbole}/orderbook`)
  return data
}

export async function getHistorique(symbole: string): Promise<HistoriquePrix[]> {
  const { data } = await apiClient.get<HistoriquePrix[]>(`/stocks/${symbole}/historique`)
  return data
}
