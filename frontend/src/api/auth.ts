import { apiClient } from './client'
import type { Utilisateur } from '../types'

export interface LoginPayload {
  email: string
  motDePasse: string
}

export interface RegisterPayload {
  nom: string
  email: string
  motDePasse: string
}

export interface AuthResponse {
  token: string
  utilisateur: Utilisateur
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  // Adapter les noms de champs au format attendu par le backend
  const { data } = await apiClient.post('/auth/login', {
    Email: payload.email,
    Password: payload.motDePasse,
  })

  const token: string = data.token
  // stocker temporairement le token pour que l'appel /auth/me fonctionne
  localStorage.setItem('virtrade_jwt', token)

  const { data: utilisateur } = await apiClient.get('/auth/me')
  utilisateur.role = utilisateur.role.toUpperCase()
  return { token, utilisateur }
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  // Envoyer les champs attendus par le backend
  await apiClient.post('/auth/register', {
    Nom: payload.nom,
    Email: payload.email,
    Password: payload.motDePasse,
  })

  // Le backend ne renvoie pas de token à l'inscription ; se connecter automatiquement
  return login({ email: payload.email, motDePasse: payload.motDePasse })
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function me(): Promise<Utilisateur> {
  const { data } = await apiClient.get<Utilisateur>('/auth/me')
  data.role = data.role.toUpperCase() as any
  return data
}
