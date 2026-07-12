import { useEffect, useState } from 'react'
import { getAdminStocks, getUsers, getConfigs } from '../../api/admin'
import { Link } from 'react-router-dom'
import { LineChart, Users, Settings, Activity, ArrowRight, ShieldCheck } from 'lucide-react'

export function AdminDashboardPage() {
  const [stats, setStats] = useState({ stocks: 0, users: 0, configs: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [stocks, users, configs] = await Promise.all([
          getAdminStocks(),
          getUsers(),
          getConfigs()
        ])
        setStats({
          stocks: stocks.length,
          users: users.length,
          configs: configs.length
        })
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-8 h-8 border-4 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      {/* En-tête amélioré avec dégradé subtil */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-canvas)] border border-[var(--color-border)] p-8">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-[var(--color-brand)] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-blue-500 opacity-10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="text-[var(--color-brand)]" size={28} />
            <h1 className="text-3xl font-[var(--font-display)] font-bold text-[var(--color-ink)] tracking-tight">Tableau de Bord</h1>
          </div>
          <p className="text-[var(--color-ink-muted)] text-lg max-w-2xl">Supervisez l'ensemble de la plateforme VirTrade, gérez les utilisateurs et configurez les paramètres de la simulation de marché en temps réel.</p>
        </div>
      </div>

      {/* Cartes statistiques repensées avec effets de survol */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand-soft)] rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-brand)]/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-500/10 to-transparent rounded-bl-full transition-transform duration-500 group-hover:scale-125"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[var(--color-ink-muted)] font-medium text-sm tracking-wider uppercase mb-1">Actions Cotées</p>
              <h3 className="text-4xl font-bold text-[var(--color-ink)]">{stats.stocks}</h3>
            </div>
            <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
              <LineChart size={24} strokeWidth={2.5} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
            <span className="text-xs text-[var(--color-ink-muted)]">Marché simulé actif</span>
            <Link to="/admin/stocks" className="text-xs font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] flex items-center gap-1">
              Gérer <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        <div className="group bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-blue-500/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full transition-transform duration-500 group-hover:scale-125"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[var(--color-ink-muted)] font-medium text-sm tracking-wider uppercase mb-1">Utilisateurs</p>
              <h3 className="text-4xl font-bold text-[var(--color-ink)]">{stats.users}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <Users size={24} strokeWidth={2.5} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
            <span className="text-xs text-[var(--color-ink-muted)]">Traders & Admins</span>
            <Link to="/admin/users" className="text-xs font-medium text-blue-500 hover:text-blue-600 flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        <div className="group bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-purple-500/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full transition-transform duration-500 group-hover:scale-125"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[var(--color-ink-muted)] font-medium text-sm tracking-wider uppercase mb-1">Paramètres</p>
              <h3 className="text-4xl font-bold text-[var(--color-ink)]">{stats.configs}</h3>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
              <Settings size={24} strokeWidth={2.5} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
            <span className="text-xs text-[var(--color-ink-muted)]">Règles du système</span>
            <Link to="/admin/config" className="text-xs font-medium text-purple-500 hover:text-purple-600 flex items-center gap-1">
              Configurer <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Section activité simulée */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[var(--color-border)]">
          <Activity className="text-[var(--color-ink-muted)]" size={20} />
          <h2 className="text-lg font-bold text-[var(--color-ink)]">Aperçu rapide</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-[var(--color-canvas)] rounded-xl border border-[var(--color-border)]">
              <h4 className="text-sm font-medium text-[var(--color-ink)] mb-2">Santé du Simulateur</h4>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-ink-muted)]">État du processus (Brownian Motion)</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs font-bold rounded">ACTIF</span>
              </div>
            </div>
            
            <div className="p-4 bg-[var(--color-canvas)] rounded-xl border border-[var(--color-border)]">
              <h4 className="text-sm font-medium text-[var(--color-ink)] mb-2">Base de données</h4>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-ink-muted)]">Connexion et Seed</span>
                <span className="text-[13px] font-mono text-[var(--color-ink)]">Connecté (SQLite)</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
             <h4 className="text-sm font-medium text-[var(--color-ink)] mb-2">Actions Rapides</h4>
             <Link to="/admin/stocks" className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-canvas)] transition-colors group">
                <span className="text-sm font-medium text-[var(--color-ink)]">Ajouter une nouvelle action</span>
                <ArrowRight size={16} className="text-[var(--color-ink-muted)] group-hover:text-[var(--color-brand)] group-hover:translate-x-1 transition-all" />
             </Link>
             <Link to="/admin/config" className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-canvas)] transition-colors group">
                <span className="text-sm font-medium text-[var(--color-ink)]">Modifier le capital initial</span>
                <ArrowRight size={16} className="text-[var(--color-ink-muted)] group-hover:text-[var(--color-brand)] group-hover:translate-x-1 transition-all" />
             </Link>
             <Link to="/admin/users" className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-canvas)] transition-colors group">
                <span className="text-sm font-medium text-[var(--color-ink)]">Gérer les droits utilisateurs</span>
                <ArrowRight size={16} className="text-[var(--color-ink-muted)] group-hover:text-[var(--color-brand)] group-hover:translate-x-1 transition-all" />
             </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
