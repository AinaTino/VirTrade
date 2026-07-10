import { useState, useEffect } from 'react';
import { placeOrder } from '../../api/orders.js';
import { useTrading } from '../../context/TradingContext.jsx';

export default function OrderForm() {
  const { draft, updateDraft } = useTrading();
  const [symbole, setSymbole] = useState(draft.symbole);
  const [sensOrdre, setSensOrdre] = useState(draft.sens);
  const [typeOrdre, setTypeOrdre] = useState(draft.type);
  const [quantite, setQuantite] = useState(draft.quantite);
  const [prixLimite, setPrixLimite] = useState(draft.prix ?? '');
  const [stopPrix, setStopPrix] = useState(draft.stopPrix ?? '');
  const [expiresAt, setExpiresAt] = useState(draft.expiresAt ?? '');
  const [message, setMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (quantite <= 0) {
      setMessage('La quantité doit être supérieure à 0.');
      return;
    }

    if (typeOrdre === 'Limit' && !prixLimite) {
      setMessage('Un ordre Limit nécessite un prix limite.');
      return;
    }

    if ((typeOrdre === 'Stop' || typeOrdre === 'StopLimit') && !stopPrix) {
      setMessage('Un ordre Stop nécessite un prix de déclenchement.');
      return;
    }

    if ((typeOrdre === 'Limit' || typeOrdre === 'StopLimit' || typeOrdre === 'IOC' || typeOrdre === 'GTD') && !prixLimite) {
      setMessage(`Un ordre ${typeOrdre} nécessite un prix limite.`);
      return;
    }

    if (typeOrdre === 'StopLimit' && (!stopPrix || !prixLimite)) {
      setMessage('Un ordre Stop-Limit nécessite un prix de déclenchement et un prix limite.');
      return;
    }

    if (typeOrdre === 'GTD' && !expiresAt) {
      setMessage('Un ordre GTD nécessite une date d’expiration.');
      return;
    }

    const payload = {
      symbole,
      sensOrdre,
      typeOrdre,
      quantite,
      prixLimite: ['Limit', 'StopLimit', 'IOC', 'GTD'].includes(typeOrdre) ? parseFloat(prixLimite) : null,
      stopPrix: ['Stop', 'StopLimit'].includes(typeOrdre) ? parseFloat(stopPrix) : null,
      expiresAt: typeOrdre === 'GTD' ? new Date(expiresAt).toISOString() : null,
      timeInForce: typeOrdre === 'IOC' ? 'IOC' : typeOrdre === 'GTD' ? 'GTD' : 'GTC'
    };

    try {
      const result = await placeOrder(payload);
      setMessage(`Ordre placé: ${result.id} (${result.statut})`);
      // reset draft to minimal default after placing
      updateDraft({ quantite: 1 });
    } catch (err) {
      setMessage('Échec du placement de l’ordre.');
    }
  };

  // keep local form in sync with external draft (click-to-fill)
  useEffect(() => {
    if (!draft) return;
    setSymbole(draft.symbole ?? symbole);
    setSensOrdre(draft.sens ?? sensOrdre);
    setTypeOrdre(draft.type ?? typeOrdre);
    setQuantite(draft.quantite ?? quantite);
    setPrixLimite(draft.prix ?? prixLimite);
    setStopPrix(draft.stopPrix ?? stopPrix);
    setExpiresAt(draft.expiresAt ?? expiresAt);
  }, [draft]);

  return (
    <section className="rounded-panel border border-border-hairline bg-bg-surface/90 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-accent">Ordre</p>
          <h2 className="mt-2 text-xl font-semibold text-text-primary">Passer un ordre</h2>
        </div>
        <div className={`rounded-panel border px-3 py-2 text-sm ${sensOrdre === 'Buy' ? 'border-market-bid/20 bg-market-bid-bg text-market-bid' : 'border-ask-sell/20 bg-ask-sell-bg text-ask-sell'}`}>
          {sensOrdre === 'Buy' ? 'Achat' : 'Vente'}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-text-secondary">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-disabled">Symbole</span>
            <input className="w-full rounded-panel border border-border-hairline bg-bg-surface-alt px-3 py-2" value={symbole} onChange={(e) => { setSymbole(e.target.value.toUpperCase()); updateDraft({ symbole: e.target.value.toUpperCase() }); }} required />
          </label>
          <label className="text-sm text-text-secondary">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-disabled">Sens</span>
            <select className="w-full rounded-panel border border-border-hairline bg-bg-surface-alt px-3 py-2" value={sensOrdre} onChange={(e) => { setSensOrdre(e.target.value); updateDraft({ sens: e.target.value }); }}>
              <option value="Buy">Achat</option>
              <option value="Sell">Vente</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-text-secondary">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-disabled">Type</span>
            <select className="w-full rounded-panel border border-border-hairline bg-bg-surface-alt px-3 py-2" value={typeOrdre} onChange={(e) => { setTypeOrdre(e.target.value); updateDraft({ type: e.target.value }); }}>
              <option value="Market">Market</option>
              <option value="Limit">Limit</option>
              <option value="Stop">Stop</option>
              <option value="StopLimit">Stop-Limit</option>
              <option value="IOC">IOC</option>
              <option value="GTD">GTD</option>
            </select>
          </label>
          <label className="text-sm text-text-secondary">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-disabled">Quantité</span>
            <input className="w-full rounded-panel border border-border-hairline bg-bg-surface-alt px-3 py-2" type="number" value={quantite} onChange={(e) => { const v = parseInt(e.target.value, 10) || 0; setQuantite(v); updateDraft({ quantite: v }); }} min="1" required />
          </label>
        </div>

        {(typeOrdre === 'Limit' || typeOrdre === 'StopLimit') && (
          <label className="block text-sm text-text-secondary">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-disabled">Prix limite</span>
            <input className="w-full rounded-panel border border-border-hairline bg-bg-surface-alt px-3 py-2" type="number" step="0.01" value={prixLimite} onChange={(e) => { setPrixLimite(e.target.value); updateDraft({ prix: e.target.value ? parseFloat(e.target.value) : null }); }} required />
          </label>
        )}

        {(typeOrdre === 'Stop' || typeOrdre === 'StopLimit') && (
          <label className="block text-sm text-text-secondary">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-disabled">Prix Stop</span>
            <input className="w-full rounded-panel border border-border-hairline bg-bg-surface-alt px-3 py-2" type="number" step="0.01" value={stopPrix} onChange={(e) => { setStopPrix(e.target.value); updateDraft({ stopPrix: e.target.value ? parseFloat(e.target.value) : null }); }} required />
          </label>
        )}

        {(typeOrdre === 'GTD') ? (
          <label className="block text-sm text-text-secondary">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-disabled">Expiration GTD</span>
            <input className="w-full rounded-panel border border-border-hairline bg-bg-surface-alt px-3 py-2" type="datetime-local" value={expiresAt} onChange={(e) => { setExpiresAt(e.target.value); updateDraft({ expiresAt: e.target.value }); }} required />
          </label>
        ) : (
          <label className="block text-sm text-text-secondary">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-disabled">Expiration</span>
            <input className="w-full rounded-panel border border-border-hairline bg-bg-surface-alt px-3 py-2" type="datetime-local" value={expiresAt} onChange={(e) => { setExpiresAt(e.target.value); updateDraft({ expiresAt: e.target.value }); }} />
          </label>
        )}

        <button className={`w-full rounded-panel px-4 py-3 text-sm font-semibold transition ${sensOrdre === 'Buy' ? 'bg-btn-buy hover:bg-btn-buy-hover' : 'bg-btn-sell hover:bg-btn-sell-hover'}`} type="submit">
          {sensOrdre === 'Buy' ? 'Envoyer un ordre d’achat' : 'Envoyer un ordre de vente'}
        </button>
      </form>

      {message && <div className={`mt-4 rounded-panel border px-3 py-3 text-sm ${message.includes('placé') ? 'border-market-bid/20 bg-market-bid-bg text-market-bid' : 'border-ask-sell/20 bg-ask-sell-bg text-ask-sell'}`}>{message}</div>}
    </section>
  );
}
