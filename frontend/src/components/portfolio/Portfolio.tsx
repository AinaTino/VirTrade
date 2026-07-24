import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'
import { usePortfolio } from '../../hooks/usePortfolio'
import { formatMontant, formatPourcentage } from '../../lib/format'

export function Portfolio() {
  const { portefeuille, loading } = usePortfolio()

  if (loading || !portefeuille) {
    return (
      <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-[13px] text-[var(--color-ink-muted)]">
        Chargement du portefeuille…
      </div>
    )
  }

  const positif = portefeuille.pnl >= 0

  const cartes = [
    { label: 'Valeur totale', valeur: formatMontant(portefeuille.valeurTotale), icon: Wallet, accent: false },
    { label: 'Solde cash', valeur: formatMontant(portefeuille.soldeCash), icon: PiggyBank, accent: false },
    {
      label: 'P&L global',
      valeur: `${formatMontant(portefeuille.pnl)} (${formatPourcentage(portefeuille.pnlPct)})`,
      icon: positif ? TrendingUp : TrendingDown,
      accent: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cartes.map(({ label, valeur, icon: Icon, accent }) => (
        <div key={label} className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--color-ink-muted)] mb-2">
            <Icon size={14} />
            {label}
          </div>
          <p
            className={`text-[20px] font-semibold font-[var(--font-mono)] tabular ${
              accent ? (positif ? 'text-[var(--color-bid)]' : 'text-[var(--color-ask)]') : 'text-[var(--color-ink)]'
            }`}
          >
            {valeur}
          </p>
        </div>
      ))}
    </div>
  )
}
