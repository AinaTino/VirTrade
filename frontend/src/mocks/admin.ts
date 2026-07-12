import type { ConfigMarche, Utilisateur, Stock, Role } from '../types'
import { SEED_STOCKS } from './seedData'

let mockUsers: Utilisateur[] = [
  { id: 1, nom: 'Admin User', email: 'admin@virtrade.com', role: 'ADMIN', createdAt: new Date().toISOString() },
  { id: 2, nom: 'John Doe', email: 'john@virtrade.com', role: 'TRADER', createdAt: new Date().toISOString() },
  { id: 3, nom: 'Jane Smith', email: 'jane@virtrade.com', role: 'TRADER', createdAt: new Date().toISOString() },
]

let mockConfigs: ConfigMarche[] = [
  { id: 1, cle: 'STARTING_CAPITAL', valeur: '100000', description: 'Capital initial alloué à chaque nouvel utilisateur' },
  { id: 2, cle: 'MARKET_STATUS', valeur: 'OPEN', description: 'Statut du marché (OPEN/CLOSED)' },
  { id: 3, cle: 'GLOBAL_VOLATILITY', valeur: '1.0', description: 'Multiplicateur global de volatilité du simulateur' },
]

let mockStocks: Stock[] = [...SEED_STOCKS]

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function getUsersMock(): Promise<Utilisateur[]> {
  await delay(300)
  return [...mockUsers]
}

export async function updateUserRoleMock(userId: number, role: Role): Promise<Utilisateur> {
  await delay(300)
  const user = mockUsers.find(u => u.id === userId)
  if (!user) throw new Error('Utilisateur introuvable')
  user.role = role
  user.role = role
  return { ...user }
}

export async function deleteUserMock(userId: number): Promise<void> {
  await delay(300)
  mockUsers = mockUsers.filter(u => u.id !== userId)
}

export async function getConfigsMock(): Promise<ConfigMarche[]> {
  await delay(300)
  return [...mockConfigs]
}

export async function updateConfigMock(cle: string, valeur: string): Promise<ConfigMarche> {
  await delay(300)
  const config = mockConfigs.find(c => c.cle === cle)
  if (!config) throw new Error('Configuration introuvable')
  config.valeur = valeur
  return { ...config }
}

export async function getAdminStocksMock(): Promise<Stock[]> {
  await delay(300)
  return [...mockStocks]
}

export async function createStockMock(stockData: Omit<Stock, 'id' | 'variation24h' | 'prixActuel'> & { prixActuel: number }): Promise<Stock> {
  await delay(400)
  const newStock: Stock = {
    ...stockData,
    id: mockStocks.length > 0 ? Math.max(...mockStocks.map(s => s.id)) + 1 : 1,
    variation24h: 0,
  }
  mockStocks.push(newStock)
  return newStock
}

export async function updateStockMock(id: number, stockData: Partial<Stock>): Promise<Stock> {
  await delay(400)
  const index = mockStocks.findIndex(s => s.id === id)
  if (index === -1) throw new Error('Stock introuvable')
  mockStocks[index] = { ...mockStocks[index], ...stockData }
  return mockStocks[index]
}
