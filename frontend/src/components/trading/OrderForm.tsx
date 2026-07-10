import axios from 'axios'
import { useState, type FormEvent } from 'react'
import { placerOrdre } from '../../api/orders'
import { usePortfolio } from '../../hooks/usePortfolio'
import { formatMontant } from '../../lib/format'
import type { SensOrdre, TypeOrdre, Stock } from '../../types'

interface OrderFormProps {
  stock: Stock
  onOrdrePasse?: () => void
}

function messageErreurOrdre(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data
    if (typeof body === 'string') return body
    if (body && typeof body === 'object') {
      const message = body.title ?? body.message ?? body.detail
      if (typeof message === 'string') return message
    }
    if (error.response?.status === 409) {
      return 'Conflit lors du traitement de l’ordre. Réessayez après avoir actualisé votre portefeuille.'
    }
  }
  return error instanceof Error ? error.message : 'Échec du placement de l’ordre'
}

export function OrderForm({ stock, onOrdrePasse }: OrderFormProps) {
  const { portefeuille } = usePortfolio()
  const [sens, setSens] = useState<SensOrdre>('BUY')
  const [type, setType] = useState<TypeOrdre>('MARKET')
  const [quantite, setQuantite] = useState(10)
  const [prixLimite, setPrixLimite] = useState(stock.prixActuel)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [succes, setSucces] = useState<string | null>(null)

  const position = portefeuille?.positions.find((p) => p.symbole === stock.symbole)
  const prixEstime = type === 'MARKET' ? stock.prixActuel : prixLimite
  const coutEstime = quantite * prixEstime

  const soldeInsuffisant = sens === 'BUY' && portefeuille ? portefeuille.soldeCash < coutEstime : false
  const positionInsuffisante =
    sens === 'SELL' && (!position || position.quantiteDetenue < quantite)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErreur(null)
    setSucces(null)

    if (quantite <= 0) {
      setErreur('La quantité doit être positive')
      return
    }
    if (soldeInsuffisant) {
      setErreur('Solde insuffisant pour cet ordre')
      return
    }
    if (positionInsuffisante) {
      setErreur('Vous ne détenez pas assez d\'actions pour cette vente')
      return
    }

    setEnvoi(true)
    try {
      const res = await placerOrdre({
        symbole: stock.symbole,
        type,
        sens,
        quantite,
        prixLimite: type === 'LIMIT' ? prixLimite : undefined,
      })
      setSucces(
        res.statut === 'FILLED'
          ? 'Ordre exécuté.'
          : 'Ordre placé — en attente dans le carnet'
      )
      onOrdrePasse?.()
    } catch (err) {
      setErreur(messageErreurOrdre(err))
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-4">
      <h3 className="text-[13px] font-semibold font-[var(--font-display)]">Placer un ordre — {stock.symbole}</h3>

      {/* Sens : BUY / SELL */}
      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-[6px] bg-[var(--color-canvas)]">
        <button
          type="button"
          onClick={() => setSens('BUY')}
          className={`py-1.5 rounded-[5px] text-[13px] font-semibold transition-colors ${
            sens === 'BUY' ? 'bg-[var(--color-bid)] text-white' : 'text-[var(--color-ink-muted)]'
          }`}
        >
          Acheter
        </button>
        <button
          type="button"
          onClick={() => setSens('SELL')}
          className={`py-1.5 rounded-[5px] text-[13px] font-semibold transition-colors ${
            sens === 'SELL' ? 'bg-[var(--color-ask)] text-white' : 'text-[var(--color-ink-muted)]'
          }`}
        >
          Vendre
        </button>
      </div>

      {/* Type : MARKET / LIMIT */}
      <div>
        <label className="block text-[12px] font-medium text-[var(--color-ink-muted)] mb-1.5">Type d'ordre</label>
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-[6px] bg-[var(--color-canvas)]">
          <button
            type="button"
            onClick={() => setType('MARKET')}
            className={`py-1.5 rounded-[5px] text-[12px] font-medium transition-colors ${
              type === 'MARKET' ? 'bg-[var(--color-surface)] shadow-sm text-[var(--color-ink)]' : 'text-[var(--color-ink-muted)]'
            }`}
          >
            Market
          </button>
          <button
            type="button"
            onClick={() => setType('LIMIT')}
            className={`py-1.5 rounded-[5px] text-[12px] font-medium transition-colors ${
              type === 'LIMIT' ? 'bg-[var(--color-surface)] shadow-sm text-[var(--color-ink)]' : 'text-[var(--color-ink-muted)]'
            }`}
          >
            Limit
          </button>
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-medium text-[var(--color-ink-muted)] mb-1.5" htmlFor="quantite">
          Quantité
        </label>
        <input
          id="quantite"
          type="number"
          min={1}
          value={quantite}
          onChange={(e) => setQuantite(Number(e.target.value))}
          className="w-full rounded-[6px] border border-[var(--color-border-strong)] px-3 py-2 text-[14px] tabular font-[var(--font-mono)] outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)]"
        />
      </div>

      {type === 'LIMIT' && (
        <div>
          <label className="block text-[12px] font-medium text-[var(--color-ink-muted)] mb-1.5" htmlFor="prixLimite">
            Prix limite
          </label>
          <input
            id="prixLimite"
            type="number"
            step="0.01"
            min={0.01}
            value={prixLimite}
            onChange={(e) => setPrixLimite(Number(e.target.value))}
            className="w-full rounded-[6px] border border-[var(--color-border-strong)] px-3 py-2 text-[14px] tabular font-[var(--font-mono)] outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:border-[var(--color-brand)]"
          />
        </div>
      )}

      <div className="flex items-center justify-between text-[12px] py-2 border-y border-[var(--color-border)]">
        <span className="text-[var(--color-ink-muted)]">Coût estimé</span>
        <span className="tabular font-[var(--font-mono)] font-medium">{formatMontant(coutEstime)}</span>
      </div>

      {sens === 'SELL' && (
        <p className="text-[12px] text-[var(--color-ink-muted)]">
          Détenu : <span className="tabular font-[var(--font-mono)]">{position?.quantiteDetenue ?? 0}</span>
        </p>
      )}

      {erreur && <p className="text-[13px] text-[var(--color-ask)] bg-[var(--color-ask-soft)] rounded-[6px] px-3 py-2">{erreur}</p>}
      {succes && <p className="text-[13px] text-[var(--color-bid)] bg-[var(--color-bid-soft)] rounded-[6px] px-3 py-2">{succes}</p>}

      <button
        type="submit"
        disabled={envoi}
        className={`w-full rounded-[6px] text-white text-[14px] font-semibold py-2.5 transition-colors disabled:opacity-60 ${
          sens === 'BUY' ? 'bg-[var(--color-bid)] hover:brightness-95' : 'bg-[var(--color-ask)] hover:brightness-95'
        }`}
      >
        {envoi ? 'Envoi…' : sens === 'BUY' ? `Acheter ${stock.symbole}` : `Vendre ${stock.symbole}`}
      </button>
    </form>
  )
}
