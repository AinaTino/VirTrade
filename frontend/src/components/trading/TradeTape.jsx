import { useEffect, useMemo, useState } from 'react';
import { fetchTrades } from '../../api/orders.js';
import { useSignalR } from '../../hooks/useSignalR.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function TradeTape() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [symboleFilter, setSymboleFilter] = useState('All');
  const [sideFilter, setSideFilter] = useState('All');

  const { subscribe, unsubscribe } = useSignalR();
  const { addToast } = useToast();

  const loadTrades = async () => {
    try {
      setLoading(true);
      const data = await fetchTrades();
      setTrades(data);
      setError(null);
    } catch (err) {
      setError(err.message ?? 'Erreur lors du chargement des transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades();
  }, []);

  useEffect(() => {
    const handleTradeExecuted = (trade) => {
      if (!trade) return;
      const enriched = {
        ...trade,
        heure: trade.heure || new Date().toLocaleTimeString('fr-FR')
      };
      setTrades((prev) => [enriched, ...prev].slice(0, 50));
      addToast(`Trade exécuté : ${enriched.symbole} ${enriched.sens} ${enriched.quantite}@${enriched.prix}€`, { type: 'info' });
    };

    subscribe('TradeExecuted', handleTradeExecuted);
    return () => unsubscribe('TradeExecuted', handleTradeExecuted);
  }, [subscribe, unsubscribe, addToast]);

  const visibleTrades = useMemo(() => {
    return trades.filter((trade) => {
      if (symboleFilter !== 'All' && trade.symbole !== symboleFilter) return false;
      if (sideFilter !== 'All' && trade.sens !== sideFilter) return false;
      return true;
    });
  }, [trades, symboleFilter, sideFilter]);

  const symbolOptions = useMemo(() => {
    const symbols = trades.map((trade) => trade.symbole);
    return ['All', ...Array.from(new Set(symbols))];
  }, [trades]);

  const exportCsv = () => {
    if (visibleTrades.length === 0) {
      addToast('Aucun trade à exporter.', { type: 'error' });
      return;
    }

    const rows = [
      ['Heure', 'Symbole', 'Sens', 'Quantité', 'Prix'],
      ...visibleTrades.map((trade) => [trade.heure, trade.symbole, trade.sens, trade.quantite, trade.prix])
    ];

    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trade_tape_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Export CSV téléchargé.', { type: 'success' });
  };

  if (loading) {
    return (
      <section className="rounded-panel border border-border-hairline bg-bg-surface/90 p-6">
        <p className="text-text-secondary">Chargement du journal de trades…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-panel border border-ask-sell/30 bg-ask-sell-bg p-6 text-ask-sell">
        {error}
      </section>
    );
  }

  return (
    <section className="rounded-panel border border-border-hairline bg-bg-surface/90 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-accent">Trade Tape</p>
          <h2 className="mt-2 text-xl font-semibold text-text-primary">Journal des transactions</h2>
        </div>
        <button className="rounded-panel border border-border-hairline bg-bg-surface-alt px-3 py-2 text-sm text-text-primary transition hover:bg-bg-surface" onClick={exportCsv}>
          Export CSV
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-text-secondary">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-disabled">Symbole</span>
          <select className="w-full rounded-panel border border-border-hairline bg-bg-surface-alt px-3 py-2" value={symboleFilter} onChange={(e) => setSymboleFilter(e.target.value)}>
            {symbolOptions.map((symbol) => (
              <option key={symbol} value={symbol}>{symbol === 'All' ? 'Tous' : symbol}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-text-secondary">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-disabled">Sens</span>
          <select className="w-full rounded-panel border border-border-hairline bg-bg-surface-alt px-3 py-2" value={sideFilter} onChange={(e) => setSideFilter(e.target.value)}>
            <option value="All">Tous</option>
            <option value="Buy">Achat</option>
            <option value="Sell">Vente</option>
          </select>
        </label>
      </div>

      <div className="mt-5 space-y-3">
        {visibleTrades.length === 0 ? (
          <div className="rounded-panel border border-border-hairline bg-bg-surface-alt p-4 text-sm text-text-secondary">Aucun trade ne correspond aux filtres.</div>
        ) : visibleTrades.map((trade) => (
          <div key={trade.id} className="grid gap-2 rounded-panel border border-border-hairline bg-bg-surface-alt p-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="font-semibold text-text-primary">{trade.symbole} · {trade.quantite} @ {trade.prix}€</p>
              <p className="text-sm text-text-secondary">{trade.sens} · {trade.heure}</p>
            </div>
            <span className={`rounded-panel px-3 py-1 text-xs font-semibold ${trade.sens === 'Buy' ? 'bg-market-bid/15 text-market-bid' : 'bg-ask-sell/15 text-ask-sell'}`}>
              {trade.sens}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
