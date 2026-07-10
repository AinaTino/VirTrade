import { useRef } from 'react';
import { useTrading } from '../../context/TradingContext.jsx';

export default function OrderBook({ bids, asks }) {
  const maxBid = Math.max(...bids.map((bid) => bid.quantity), 1);
  const maxAsk = Math.max(...asks.map((ask) => ask.quantity), 1);
  const { updateDraft } = useTrading();
  const dragState = useRef(null);

  return (
    <section className="rounded-panel border border-border-hairline bg-bg-surface/90 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-accent">Depth</p>
          <h2 className="mt-2 text-xl font-semibold text-text-primary">Order Book</h2>
        </div>
        <div className="rounded-panel border border-border-hairline bg-bg-surface-alt px-3 py-2 text-sm text-text-secondary">AAPL</div>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-panel border border-ask-sell/20 bg-ask-sell-bg p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-ask-sell">Ventes</h3>
          <div className="mt-3 space-y-2">
            {asks.map((ask, index) => (
              <div key={index} className="rounded-panel border border-ask-sell/15 bg-bg-surface/70 p-2">
                <div className="flex items-center justify-between text-sm text-text-secondary">
                  <button type="button" onClick={() => updateDraft({ symbole: 'AAPL', sens: 'Sell', quantite: ask.quantity, prix: ask.price })} className="ticker-font text-ask-sell hover:underline">{ask.price.toFixed(2)}</button>
                  <span>{ask.quantity}</span>
                </div>
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-surface-alt"
                  onMouseDown={(e) => {
                    // start drag-to-size for this ask
                    dragState.current = { side: 'ask', startX: e.clientX, baseQty: ask.quantity, max: maxAsk };
                    const onMove = (mv) => {
                      if (!dragState.current) return;
                      const dx = mv.clientX - dragState.current.startX;
                      const delta = Math.round((dx / 200) * dragState.current.baseQty);
                      const newQty = Math.max(1, dragState.current.baseQty + delta);
                      updateDraft({ quantite: Math.min(newQty, dragState.current.max) });
                    };
                    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); dragState.current = null; };
                    window.addEventListener('mousemove', onMove);
                    window.addEventListener('mouseup', onUp);
                  }}
                >
                  <div className="h-full rounded-full bg-ask-sell" style={{ width: `${(ask.quantity / maxAsk) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-panel border border-market-bid/20 bg-market-bid-bg p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-market-bid">Achats</h3>
          <div className="mt-3 space-y-2">
            {bids.map((bid, index) => (
              <div key={index} className="rounded-panel border border-market-bid/15 bg-bg-surface/70 p-2">
                <div className="flex items-center justify-between text-sm text-text-secondary">
                  <button type="button" onClick={() => updateDraft({ symbole: 'AAPL', sens: 'Buy', quantite: bid.quantity, prix: bid.price })} className="ticker-font text-market-bid hover:underline">{bid.price.toFixed(2)}</button>
                  <span>{bid.quantity}</span>
                </div>
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-surface-alt"
                  onMouseDown={(e) => {
                    // drag-to-size for bid
                    dragState.current = { side: 'bid', startX: e.clientX, baseQty: bid.quantity, max: maxBid };
                    const onMove = (mv) => {
                      if (!dragState.current) return;
                      const dx = mv.clientX - dragState.current.startX;
                      const delta = Math.round((dx / 200) * dragState.current.baseQty);
                      const newQty = Math.max(1, dragState.current.baseQty + delta);
                      updateDraft({ quantite: Math.min(newQty, dragState.current.max) });
                    };
                    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); dragState.current = null; };
                    window.addEventListener('mousemove', onMove);
                    window.addEventListener('mouseup', onUp);
                  }}
                >
                  <div className="h-full rounded-full bg-market-bid" style={{ width: `${(bid.quantity / maxBid) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
