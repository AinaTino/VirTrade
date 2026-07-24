// En développement, nous utilisons les mocks, car le backend pour l'administration n'est peut-être pas prêt.
// Si le backend était prêt, nous utiliserions apiClient de ./client
import type { ConfigMarche, Utilisateur, Stock, Role } from '../types'
import {
  getUsersMock,
  updateUserRoleMock,
  getConfigsMock,
  updateConfigMock,
  getAdminStocksMock,
  createStockMock,
  updateStockMock,
  deleteUserMock
} from '../mocks/admin'

export async function getUsers(): Promise<Utilisateur[]> {
  // Remplacer par apiClient.get<Utilisateur[]>('/admin/users') le moment venu
  return getUsersMock()
}

export async function updateUserRole(userId: number, role: Role): Promise<Utilisateur> {
  // Remplacer par apiClient.put(`/admin/users/${userId}/role`, { role })
  return updateUserRoleMock(userId, role)
}

export async function deleteUser(userId: number): Promise<void> {
  // Remplacer par apiClient.delete(`/admin/users/${userId}`)
  return deleteUserMock(userId)
}

export async function getConfigs(): Promise<ConfigMarche[]> {
  // Remplacer par apiClient.get<ConfigMarche[]>('/admin/configs')
  return getConfigsMock()
}

export async function updateConfig(cle: string, valeur: string): Promise<ConfigMarche> {
  // Remplacer par apiClient.put(`/admin/configs/${cle}`, { valeur })
  return updateConfigMock(cle, valeur)
}

export async function getAdminStocks(): Promise<Stock[]> {
  // Remplacer par apiClient.get<Stock[]>('/admin/stocks')
  return getAdminStocksMock()
}

export async function createStock(stock: Omit<Stock, 'id' | 'variation24h'>): Promise<Stock> {
  // Remplacer par apiClient.post('/admin/stocks', stock)
  return createStockMock(stock)
}

export async function updateStock(id: number, stock: Partial<Stock>): Promise<Stock> {
  // Remplacer par apiClient.put(`/admin/stocks/${id}`, stock)
  return updateStockMock(id, stock)
}
