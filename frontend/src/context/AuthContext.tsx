import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import type { Utilisateur } from '../types'

interface AuthContextValue {
  utilisateur: Utilisateur | null
  loading: boolean
  login: (email: string, motDePasse: string) => Promise<void>
  register: (nom: string, email: string, motDePasse: string) => Promise<void>
  logout: () => Promise<void>
  erreur: string | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'virtrade_jwt'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null)
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then(setUtilisateur)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, motDePasse: string) {
    setErreur(null)
    try {
      const res = await authApi.login({ email, motDePasse })
      localStorage.setItem(TOKEN_KEY, res.token)
      setUtilisateur(res.utilisateur)
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Échec de la connexion')
      throw e
    }
  }

  async function register(nom: string, email: string, motDePasse: string) {
    setErreur(null)
    try {
      const res = await authApi.register({ nom, email, motDePasse })
      localStorage.setItem(TOKEN_KEY, res.token)
      setUtilisateur(res.utilisateur)
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Échec de l'inscription")
      throw e
    }
  }

  async function logout() {
    await authApi.logout()
    localStorage.removeItem(TOKEN_KEY)
    setUtilisateur(null)
  }

  return (
    <AuthContext.Provider value={{ utilisateur, loading, login, register, logout, erreur }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider')
  return ctx
}
