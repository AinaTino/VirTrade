import { useNavigate } from 'react-router-dom'
import { usePortfolio } from '../../hooks/usePortfolio'
import { formatMontant, formatPourcentage } from '../../lib/format'

export function Positions() {
  const navigate = useNavigate()
  const { portefeuille, loading } = usePortfolio()

  if (loading || !portefeuille) return null

  if (portefeuille.positions.length === 0) {
    return (
      <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
        <p className="text-[13px] text-[var(--color-ink-muted)]">Aucune position ouverte pour le moment.</p>
        <button
          onClick={() => navigate('/marche')}
          className="mt-3 text-[13px] font-medium text-[var(--color-brand)] hover:underline"
        >
          Parcourir le marché →
        </button>
      </div>
    )
  }

  const valeurMax = Math.max(...portefeuille.positions.map((p) => p.valeurMarche), 1)

  return (
    <div className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-ink-muted)]">
            <th className="font-medium px-4 py-2.5">Actif</th>
            <th className="font-medium px-4 py-2.5 text-right">Quantité</th>
            <th className="font-medium px-4 py-2.5 text-right hidden sm:table-cell">Prix moyen</th>
            <th className="font-medium px-4 py-2.5 text-right">Valeur</th>
            <th className="font-medium px-4 py-2.5 text-right">P&L</th>
          </tr>
        </thead>
        <tbody>
          {portefeuille.positions.map((p) => (
            <tr
              key={p.symbole}
              onClick={() => navigate(`/trading/${p.symbole}`)}
              className="relative border-b border-[var(--color-border)] last:border-0 cursor-pointer hover:bg-[var(--color-canvas)] transition-colors"
            >
              <td className="px-4 py-3 relative">
                <div
                  className="absolute inset-y-0 left-0 bg-[var(--color-brand-soft)]"
                  style={{ width: `${(p.valeurMarche / valeurMax) * 100}%` }}
                />
                <span className="relative font-[var(--font-mono)] font-semibold">{p.symbole}</span>
                <span className="relative block text-[11px] text-[var(--color-ink-muted)]">{p.nomComplet}</span>
              </td>
              <td className="px-4 py-3 text-right tabular font-[var(--font-mono)] relative">{p.quantiteDetenue}</td>
              <td className="px-4 py-3 text-right tabular font-[var(--font-mono)] hidden sm:table-cell relative text-[var(--color-ink-muted)]">
                {formatMontant(p.prixMoyenAchat)}
              </td>
              <td className="px-4 py-3 text-right tabular font-[var(--font-mono)] font-medium relative">
                {formatMontant(p.valeurMarche)}
              </td>
              <td
                className={`px-4 py-3 text-right tabular font-[var(--font-mono)] font-medium relative ${
                  p.pnl >= 0 ? 'text-[var(--color-bid)]' : 'text-[var(--color-ask)]'
                }`}
              >
                {formatMontant(p.pnl)}
                <span className="block text-[11px]">{formatPourcentage(p.pnlPct)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
