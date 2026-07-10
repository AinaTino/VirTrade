import { useEffect, useState } from 'react';
import { cancelOrder, fetchOrders, modifyOrder } from '../../api/orders.js';
import ConfirmModal from '../common/ConfirmModal.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function loadOrders() {
    try {
      setLoading(true);
      setOrders(await fetchOrders());
    } catch (err) {
      setError(err.message ?? 'Erreur lors du chargement des ordres');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCancel = async (id) => {
    try {
      await cancelOrder(id);
      await loadOrders();
    } catch (err) {
      setError('Impossible d’annuler cet ordre');
    }
  };

  const [editingId, setEditingId] = useState(null);
  const [editQuantite, setEditQuantite] = useState(0);
  const [editPrix, setEditPrix] = useState(0);

  const startEdit = (order) => {
    setEditingId(order.id);
    setEditQuantite(order.quantite);
    setEditPrix(order.prixLimite ?? order.prix ?? 0);
  };

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  const handleSave = async (id) => {
    try {
      await modifyOrder(id, { quantite: Number(editQuantite), prixLimite: Number(editPrix) });
      setEditingId(null);
      setShowConfirm(false);
      setPendingId(null);
      await loadOrders();
      addToast('Ordre modifié avec succès', { type: 'success' });
    } catch (err) {
      setError("Impossible de modifier l'ordre");
    }
  };
  const { addToast } = useToast();

  if (loading) return <div className="rounded-panel border border-border-hairline bg-bg-surface/90 p-6 text-text-secondary">Chargement des ordres…</div>;
  if (error) return <div className="rounded-panel border border-ask-sell/30 bg-ask-sell-bg p-4 text-ask-sell">{error}</div>;

  return (
    <section className="rounded-panel border border-border-hairline bg-bg-surface/90 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-accent">Ordres</p>
          <h2 className="mt-2 text-xl font-semibold text-text-primary">Mes ordres</h2>
        </div>
        <div className="rounded-panel border border-border-hairline bg-bg-surface-alt px-3 py-2 text-sm text-text-secondary">{orders.length} actifs</div>
      </div>
      {orders.length === 0 ? (
        <p className="mt-4 text-text-secondary">Aucun ordre pour le moment.</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {orders.map((order) => (
            <article key={order.id} className="flex flex-col gap-3 rounded-panel border border-border-hairline bg-bg-surface-alt p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-text-primary">{order.symbole}</p>
                {editingId === order.id ? (
                  <div className="mt-2 flex items-center gap-2">
                    <input type="number" className="w-24 rounded-panel border px-2 py-1 text-sm" value={editQuantite} onChange={(e) => setEditQuantite(e.target.value)} />
                    <input type="number" step="0.01" className="w-28 rounded-panel border px-2 py-1 text-sm" value={editPrix} onChange={(e) => setEditPrix(e.target.value)} />
                    <button className="rounded-panel border px-3 py-1 text-sm text-text-primary" onClick={() => { setPendingId(order.id); setShowConfirm(true); }}>Enregistrer</button>
                    <button className="rounded-panel border px-3 py-1 text-sm text-text-secondary" onClick={() => setEditingId(null)}>Annuler</button>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">{order.sensOrdre} · {order.quantite} actions · {order.prixLimite ?? order.prix ?? '-'} €</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-panel border border-border-hairline bg-bg-surface px-2.5 py-1 text-xs text-text-secondary">{order.statut}</span>
                {editingId !== order.id && (
                  <>
                    <button className="rounded-panel border border-border-hairline px-3 py-1 text-sm text-text-primary transition hover:bg-bg-surface" onClick={() => startEdit(order)}>Modifier</button>
                    <button className="rounded-panel border border-border-hairline px-3 py-1 text-sm text-text-primary transition hover:bg-bg-surface" onClick={() => handleCancel(order.id)}>Annuler</button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      <ConfirmModal
        open={showConfirm}
        title="Confirmer la modification"
        message={`Enregistrer les changements (${editQuantite} @ ${editPrix}) ?`}
        onCancel={() => { setShowConfirm(false); setPendingId(null); }}
        onConfirm={() => handleSave(pendingId)}
      />
    </section>
  );
}
