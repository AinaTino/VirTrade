import { useOrderBook } from '../../hooks/useOrderBook.js';

export default function StockList() {
  const { stocks, loading, error } = useOrderBook();

  if (loading) return <div className="rounded-panel border border-border-hairline bg-bg-surface/90 p-6 text-text-secondary">Chargement des actions...</div>;
  if (error) return <div className="rounded-panel border border-ask-sell/30 bg-ask-sell-bg p-4 text-ask-sell">{error}</div>;

  return (
    <section className="rounded-panel border border-border-hairline bg-bg-surface/90 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-accent">Liste</p>
          <h2 className="mt-2 text-xl font-semibold text-text-primary">Titres observés</h2>
        </div>
        <div className="rounded-panel border border-border-hairline bg-bg-surface-alt px-3 py-2 text-sm text-text-secondary">Live</div>
      </div>
      <div className="mt-4 overflow-hidden rounded-panel border border-border-hairline">
        <table className="min-w-full text-left text-sm text-text-secondary">
          <thead className="bg-bg-surface-alt text-xs uppercase tracking-[0.2em] text-text-disabled">
            <tr>
              <th className="px-4 py-3">Symbole</th>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Prix</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <tr key={stock.id} className="border-t border-border-hairline bg-bg-surface/70">
                <td className="px-4 py-3 font-medium text-text-primary">{stock.symbole}</td>
                <td className="px-4 py-3">{stock.nom}</td>
                <td className="px-4 py-3 ticker-font text-market-bid">{stock.prixActuel.toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
