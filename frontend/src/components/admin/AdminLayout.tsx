import { Link, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Settings, LineChart } from 'lucide-react'
import { AppShell } from '../layout/AppShell'

export function AdminLayout() {
  const location = useLocation()

  const links = [
    { to: '/admin', icon: LayoutDashboard, label: 'Tableau de bord', exact: true },
    { to: '/admin/stocks', icon: LineChart, label: 'Actions', exact: false },
    { to: '/admin/users', icon: Users, label: 'Utilisateurs', exact: false },
    { to: '/admin/config', icon: Settings, label: 'Configuration', exact: false },
  ]

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-10rem)]">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[var(--color-border)] bg-[var(--color-canvas)]/50">
            <h2 className="text-lg font-bold text-[var(--color-ink)] flex items-center gap-2">
              <Settings size={20} className="text-[var(--color-accent)]" />
              Administration
            </h2>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = link.exact
                ? location.pathname === link.to
                : location.pathname.startsWith(link.to)

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand-hover)] font-medium'
                      : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-canvas)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </AppShell>
  )
}
