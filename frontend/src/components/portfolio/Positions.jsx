export default function Positions({ positions }) {
  if (!positions || positions.length === 0) return <div className="rounded-panel border border-border-hairline bg-bg-surface-alt p-4 text-text-secondary">Aucune position détenue.</div>;

  return (
    <section>
      <div className="overflow-hidden rounded-panel border border-border-hairline">
        <table className="min-w-full text-left text-sm text-text-secondary">
          <thead className="bg-bg-surface-alt text-xs uppercase tracking-[0.2em] text-text-disabled">
            <tr>
              <th className="px-4 py-3">Symbole</th>
              <th className="px-4 py-3">Quantité</th>
              <th className="px-4 py-3">Prix moyen</th>
              <th className="px-4 py-3">Valeur actuelle</th>
              <th className="px-4 py-3">P&L</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => (
              <tr key={position.id} className="border-t border-border-hairline bg-bg-surface/70">
                <td className="px-4 py-3 font-medium text-text-primary">{position.symbole}</td>
                <td className="px-4 py-3">{position.quantite}</td>
                <td className="px-4 py-3 ticker-font">{position.prixMoyen.toFixed(2)} €</td>
                <td className="px-4 py-3 ticker-font">{position.valeurActuelle.toFixed(2)} €</td>
                <td className={`px-4 py-3 ticker-font ${position.pnl >= 0 ? 'text-market-bid' : 'text-ask-sell'}`}>{position.pnl.toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
