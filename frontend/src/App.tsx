import { Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './context/AuthContext'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { MarketPage } from './pages/MarketPage'
import { TradingPage } from './pages/TradingPage'
import { PortfolioPage } from './pages/PortfolioPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { AdminLayout } from './components/admin/AdminLayout'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminStocksPage } from './pages/admin/AdminStocksPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { AdminConfigPage } from './pages/admin/AdminConfigPage'
function RequireAuth({ children }: { children: ReactNode }) {
  const { utilisateur, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-canvas)] text-[13px] text-[var(--color-ink-muted)]">
        Chargement…
      </div>
    )
  }
  if (!utilisateur) return <Navigate to="/connexion" replace />
  return <>{children}</>
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { utilisateur, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-canvas)] text-[13px] text-[var(--color-ink-muted)]">
        Chargement…
      </div>
    )
  }
  if (!utilisateur) return <Navigate to="/connexion" replace />
  if (utilisateur.role !== 'ADMIN') return <Navigate to="/" replace />
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/connexion" element={<LoginPage />} />
      <Route path="/inscription" element={<RegisterPage />} />

      <Route
        path="/marche"
        element={
          <RequireAuth>
            <MarketPage />
          </RequireAuth>
        }
      />
      <Route
        path="/trading"
        element={
          <RequireAuth>
            <TradingPage />
          </RequireAuth>
        }
      />
      <Route
        path="/trading/:symbole"
        element={
          <RequireAuth>
            <TradingPage />
          </RequireAuth>
        }
      />
      <Route
        path="/portefeuille"
        element={
          <RequireAuth>
            <PortfolioPage />
          </RequireAuth>
        }
      />
      <Route
        path="/classement"
        element={
          <RequireAuth>
            <LeaderboardPage />
          </RequireAuth>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="stocks" element={<AdminStocksPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="config" element={<AdminConfigPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
