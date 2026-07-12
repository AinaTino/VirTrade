import axios from 'axios'

// Base URL du backend ASP.NET Core. En développement, on passe par le proxy Vite.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Intercepteur — injecte automatiquement le Bearer JWT sur chaque requête
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('virtrade_jwt')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Intercepteur — déconnecte automatiquement sur un 401 (token expiré/invalide)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('virtrade_jwt')
    }
    return Promise.reject(error)
  }
)
