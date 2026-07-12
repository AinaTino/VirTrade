import { NavLink, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { LineChart, Wallet, Trophy, LogOut, CandlestickChart, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSignalR } from '../../hooks/useSignalR'
import { ConnectionStatusDot } from './ConnectionStatusDot'

const NAV_ITEMS = [
  { to: '/marche', label: 'Marché', icon: LineChart },
  { to: '/trading', label: 'Trading', icon: CandlestickChart },
  { to: '/portefeuille', label: 'Portefeuille', icon: Wallet },
  { to: '/classement', label: 'Classement', icon: Trophy },
]

export function AppShell({ children }: { children: ReactNode }) {
  const { utilisateur, logout } = useAuth()
  const { status } = useSignalR()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/connexion')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)]">
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 h-14 flex items-center gap-6">
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-6 w-6 rounded-[4px] bg-[var(--color-brand)] flex items-center justify-center">
              <span className="text-white text-[11px] font-bold font-[var(--font-mono)]">VT</span>
            </div>
            <span className="font-[var(--font-display)] font-semibold tracking-tight text-[15px]">
              VirTrade
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1 flex-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand-hover)]'
                      : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-canvas)]'
                  }`
                }
              >
                <Icon size={15} strokeWidth={2} />
                {label}
              </NavLink>
            ))}
            {utilisateur?.role === 'ADMIN' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand-hover)]'
                      : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-canvas)]'
                  }`
                }
              >
                <Shield size={15} strokeWidth={2} />
                Admin
              </NavLink>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <ConnectionStatusDot status={status} />
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-[var(--color-border)]">
              <div className="h-6 w-6 rounded-full bg-[var(--color-ink)] text-white text-[10px] font-semibold flex items-center justify-center">
                {utilisateur?.nom.slice(0, 1).toUpperCase()}
              </div>
              <span className="text-[13px] font-medium">{utilisateur?.nom.split(' ')[0]}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ask)] transition-colors"
              title="Se déconnecter"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Nav mobile */}
        <nav className="md:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] font-medium whitespace-nowrap ${
                  isActive ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand-hover)]' : 'text-[var(--color-ink-muted)]'
                }`
              }
            >
              <Icon size={14} />
              {label}
            </NavLink>
          ))}
          {utilisateur?.role === 'ADMIN' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] font-medium whitespace-nowrap ${
                  isActive ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand-hover)]' : 'text-[var(--color-ink-muted)]'
                }`
              }
            >
              <Shield size={14} />
              Admin
            </NavLink>
          )}
        </nav>
      </header>

      <main className="flex-1 mx-auto w-full max-w-[1600px] px-4 sm:px-6 py-5">{children}</main>
    </div>
  )
}
