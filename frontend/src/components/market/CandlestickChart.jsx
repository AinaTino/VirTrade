import { useMemo, useState, useRef, useEffect } from 'react';
import { useSignalR } from '../../hooks/useSignalR.js';

export default function CandlestickChart({ data }) {
  const [timeframe, setTimeframe] = useState('1d');

  const candles = useMemo(() => {
    const mapping = { '1m': 60, '5m': 120, '15m': 240, '1h': 480, '1d': 24 };
    const count = mapping[timeframe] ?? 24;
    return (data ?? []).slice(-count);
  }, [data, timeframe]);

  if (!candles.length) {
    return (
      <section className="rounded-panel border border-border-hairline bg-bg-surface/90 p-6">
        <h2 className="text-xl font-semibold text-text-primary">Candlesticks</h2>
        <div className="mt-4 rounded-panel border border-dashed border-border-hairline p-6 text-sm text-text-secondary">
          Aucune donnée historique disponible.
        </div>
      </section>
    );
  }

  const chartWidth = 760;
  const chartHeight = 320;
  const padding = { top: 24, right: 24, bottom: 40, left: 48 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // displayed candles state (for animations / live updates)
  const [displayedCandles, setDisplayedCandles] = useState(candles);
  useEffect(() => setDisplayedCandles(candles), [candles]);

  const maxHigh = Math.max(...displayedCandles.map((c) => c.high));
  const minLow = Math.min(...displayedCandles.map((c) => c.low));
  const range = maxHigh - minLow || 1;
  const lastCandle = displayedCandles[displayedCandles.length - 1];
  const candleWidth = innerWidth / Math.max(1, displayedCandles.length) / 2.6;

  // interactive state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState(0); // pan offset in pixels
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef(null);
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [showSMA, setShowSMA] = useState(true);
  const [showRSI, setShowRSI] = useState(true);

  useEffect(() => {
    // reset offset when data changes
    setOffset(0);
    setScale(1);
    setHoverIndex(null);
  }, [data]);

  const { subscribe, unsubscribe, latestQuote, connected } = useSignalR();
  const highlightRef = useRef(null);
  const [highlightIndex, setHighlightIndex] = useState(null);

  useEffect(() => {
    const handleTick = (payload) => {
      const price = payload?.price ?? latestQuote?.price ?? null;
      if (price == null) return;
      setDisplayedCandles((prev) => {
        if (prev.length === 0) return prev;
        const copy = prev.slice();
        const last = { ...copy[copy.length - 1] };
        last.close = price;
        last.high = Math.max(last.high ?? last.close, price);
        last.low = Math.min(last.low ?? last.close, price);
        copy[copy.length - 1] = last;
        return copy;
      });
      // highlight last candle briefly
      setHighlightIndex(displayedCandles.length - 1);
      if (highlightRef.current) clearTimeout(highlightRef.current);
      highlightRef.current = setTimeout(() => setHighlightIndex(null), 350);
    };

    subscribe('MarketUpdate', handleTick);
    // also listen to latestQuote changes when SignalR isn't firing events
    return () => {
      unsubscribe('MarketUpdate', handleTick);
      if (highlightRef.current) clearTimeout(highlightRef.current);
    };
  }, [subscribe, unsubscribe, displayedCandles.length, latestQuote]);

  // indicators
  const calcSMA = (values, period) => {
    const res = new Array(values.length).fill(null);
    if (period <= 0) return res;
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
      sum += values[i];
      if (i >= period) sum -= values[i - period];
      if (i >= period - 1) res[i] = sum / period;
    }
    return res;
  };

  const closes = displayedCandles.map((c) => c.close);
  const sma20 = calcSMA(closes, 20);
  const sma50 = calcSMA(closes, 50);

  // RSI(14)
  const calcRSI = (values, period = 14) => {
    const res = new Array(values.length).fill(null);
    if (values.length < period + 1) return res;
    let gains = 0;
    let losses = 0;
    for (let i = 1; i <= period; i++) {
      const diff = values[i] - values[i - 1];
      if (diff >= 0) gains += diff; else losses -= diff;
    }
    let avgGain = gains / period;
    let avgLoss = losses / period;
    res[period] = 100 - 100 / (1 + avgGain / Math.max(0.00001, avgLoss));
    for (let i = period + 1; i < values.length; i++) {
      const diff = values[i] - values[i - 1];
      const g = diff > 0 ? diff : 0;
      const l = diff < 0 ? -diff : 0;
      avgGain = (avgGain * (period - 1) + g) / period;
      avgLoss = (avgLoss * (period - 1) + l) / period;
      res[i] = 100 - 100 / (1 + avgGain / Math.max(0.00001, avgLoss));
    }
    return res;
  };

  const rsi = calcRSI(closes, 14);

  const effectiveInnerWidth = innerWidth * scale;
  const totalSpan = Math.max(displayedCandles.length - 1, 1);
  const maxOffset = Math.max(0, effectiveInnerWidth - innerWidth);

  const clampOffset = (v) => Math.max(Math.min(v, maxOffset), -maxOffset);

  const indexAtX = (clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const x = clientX - rect.left - padding.left - offset;
    const ratio = x / effectiveInnerWidth;
    const idx = Math.round(ratio * totalSpan);
    return Math.max(0, Math.min(candles.length - 1, idx));
  };

  return (
    <section className="rounded-panel terminal-glow border border-border-hairline bg-bg-surface/90 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-accent">Analyse</p>
          <h2 className="mt-2 text-xl font-semibold text-text-primary">Candlesticks OHLC</h2>
          <p className="mt-1 text-sm text-text-secondary">Évolution du prix sur les 24 dernières bougies</p>
        </div>
        <div className="rounded-panel border border-border-hairline bg-bg-surface-alt px-3 py-1 text-sm text-text-secondary">
          AAPL · OHLC
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-panel border border-border-hairline bg-bg-surface-alt p-4 relative" ref={containerRef}>
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
          {['1m', '5m', '15m', '1h', '1d'].map((tf) => (
            <button key={tf} className={`rounded-panel px-2 py-1 text-xs ${timeframe === tf ? 'bg-accent text-white' : 'bg-bg-surface'}`} onClick={() => setTimeframe(tf)}>{tf}</button>
          ))}
          <div className="h-6 w-px bg-border-hairline mx-1" />
          <button className={`rounded-panel px-2 py-1 text-xs ${showSMA ? 'bg-accent text-white' : 'bg-bg-surface'}`} onClick={() => setShowSMA((s) => !s)}>SMA</button>
          <button className={`rounded-panel px-2 py-1 text-xs ${showRSI ? 'bg-accent text-white' : 'bg-bg-surface'}`} onClick={() => setShowRSI((s) => !s)}>RSI</button>
          <div className="h-6 w-px bg-border-hairline mx-1" />
          <button
            className="rounded-panel px-2 py-1 text-xs bg-bg-surface hover:bg-bg-surface-alt"
            onClick={() => {
              // export CSV of visible candles
              const rows = ['date,open,high,low,close,volume'];
              for (const c of candles) {
                const vol = c.volume ?? '';
                rows.push(`${c.date},${c.open},${c.high},${c.low},${c.close},${vol}`);
              }
              const csv = rows.join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `candles_${timeframe}_${Date.now()}.csv`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            }}
          >
            Export CSV
          </button>
        </div>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-[320px] w-full"
          onWheel={(e) => {
            e.preventDefault();
            const delta = -Math.sign(e.deltaY);
            const factor = delta > 0 ? 1.1 : 0.9;
            const rect = containerRef.current?.getBoundingClientRect();
            const mx = e.clientX - (rect?.left ?? 0) - padding.left;
            const prevScale = scale;
            const nextScale = Math.max(0.5, Math.min(3, prevScale * factor));
            // adjust offset so zoom centers under mouse
            const rel = (mx - offset) / (innerWidth * prevScale || 1);
            const nextOffset = rel * innerWidth * nextScale - mx;
            setScale(nextScale);
            setOffset(clampOffset(nextOffset));
          }}
          onMouseDown={(e) => {
            // begin pan
            setIsPanning(true);
            panStart.current = { x: e.clientX, offset: offset };
          }}
          onMouseMove={(e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
            if (isPanning && panStart.current) {
              const dx = e.clientX - panStart.current.x;
              setOffset((prev) => clampOffset(panStart.current.offset - dx));
            } else {
              const idx = indexAtX(e.clientX);
              setHoverIndex(idx);
            }
          }}
          onMouseUp={() => { setIsPanning(false); panStart.current = null; }}
          onMouseLeave={() => { setIsPanning(false); panStart.current = null; setHoverIndex(null); setMousePos(null); }}
        >
          {[0, 1, 2, 3, 4].map((step) => {
            const y = padding.top + (step / 4) * innerHeight;
            return (
              <g key={step}>
                <line x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                <text x={10} y={y + 4} fontSize="11" fill="#7A8194">
                  {(maxHigh - (step / 4) * range).toFixed(2)}
                </text>
              </g>
            );
          })}

          {displayedCandles.map((candle, index) => {
            const xp = (index / Math.max(displayedCandles.length - 1, 1)) * effectiveInnerWidth;
            const x = padding.left + xp + offset;
            const highY = padding.top + ((maxHigh - candle.high) / range) * innerHeight;
            const lowY = padding.top + ((maxHigh - candle.low) / range) * innerHeight;
            const openY = padding.top + ((maxHigh - candle.open) / range) * innerHeight;
            const closeY = padding.top + ((maxHigh - candle.close) / range) * innerHeight;
            const isUp = candle.close >= candle.open;
            const color = isUp ? '#00C896' : '#F5455C';
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(6, Math.abs(closeY - openY));

            return (
              <g key={`${candle.date}-${index}`}>
                {highlightIndex === index && (
                  <rect x={x - (candleWidth * scale) / 1.2} y={padding.top} width={(candleWidth * scale) * 1.6} height={innerHeight} rx="4" fill="rgba(255,255,255,0.03)" className="animate-pulse" />
                )}
                <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1.6" />
                <rect x={x - (candleWidth * scale) / 2} y={bodyTop} width={candleWidth * scale} height={bodyHeight} rx="2" fill={color} opacity="0.95" />
              </g>
            );
          })}

          {/* SMA lines */}
          {showSMA && ['sma20','sma50'].map((name) => {
            const arr = name === 'sma20' ? sma20 : sma50;
            const points = arr.map((v,i) => {
              if (v == null) return null;
              const xp = (i / Math.max(displayedCandles.length - 1, 1)) * effectiveInnerWidth;
              const x = padding.left + xp + offset;
              const y = padding.top + ((maxHigh - v) / range) * innerHeight;
              return `${x},${y}`;
            }).filter(Boolean).join(' ');
            const stroke = name === 'sma20' ? '#FFD166' : '#74C0FC';
            return <polyline key={name} points={points} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />;
          })}

          <line x1={padding.left} y1={chartHeight - padding.bottom} x2={chartWidth - padding.right} y2={chartHeight - padding.bottom} stroke="rgba(255,255,255,0.16)" />
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={chartHeight - padding.bottom} stroke="rgba(255,255,255,0.16)" />

          {/* crosshair vertical line */}
          {hoverIndex !== null && hoverIndex !== undefined && (
            (() => {
              const xp = (hoverIndex / Math.max(displayedCandles.length - 1, 1)) * effectiveInnerWidth;
              const cx = padding.left + xp + offset;
              return (
                <g>
                  <line x1={cx} x2={cx} y1={padding.top} y2={chartHeight - padding.bottom} stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
                </g>
              );
            })()
          )}
        </svg>

        {/* tooltip */}
        {hoverIndex !== null && hoverIndex !== undefined && mousePos && (
          (() => {
            const c = candles[hoverIndex];
            if (!c) return null;
            const rect = containerRef.current?.getBoundingClientRect();
            const xp = (hoverIndex / Math.max(displayedCandles.length - 1, 1)) * effectiveInnerWidth;
            const cx = padding.left + xp + offset;
            const left = Math.max(8, Math.min((rect?.width ?? chartWidth) - 180, cx));
            return (
              <div style={{ left, top: 8 }} className="absolute z-50 w-44 rounded-panel border border-border-hairline bg-bg-surface-alt p-2 text-sm">
                <div className="font-semibold">{c.date}</div>
                <div className="text-xs text-text-secondary">O: {c.open.toFixed(2)} · H: {c.high.toFixed(2)}</div>
                <div className="text-xs text-text-secondary">L: {c.low.toFixed(2)} · C: {c.close.toFixed(2)}</div>
                <div className="text-xs text-text-secondary mt-1">SMA20: {sma20[hoverIndex]?.toFixed(2) ?? '-' } · SMA50: {sma50[hoverIndex]?.toFixed(2) ?? '-'}</div>
              </div>
            );
          })()
        )}

        {/* RSI panel */}
        {showRSI && (
          <div className="mt-3">
            <div className="rounded-panel border border-border-hairline bg-bg-surface-alt p-2">
              <svg viewBox={`0 0 ${chartWidth} 80`} className="h-20 w-full">
                <line x1={padding.left} y1={10} x2={chartWidth - padding.right} y2={10} stroke="rgba(255,255,255,0.06)" />
                <line x1={padding.left} y1={70} x2={chartWidth - padding.right} y2={70} stroke="rgba(255,255,255,0.06)" />
                <line x1={padding.left} y1={40} x2={chartWidth - padding.right} y2={40} stroke="rgba(255,255,255,0.06)" />
                {/* 30/70 lines */}
                <line x1={padding.left} y1={20} x2={chartWidth - padding.right} y2={20} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1={padding.left} y1={60} x2={chartWidth - padding.right} y2={60} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                {rsi.map((val, idx) => {
                  if (val == null) return null;
                  const xp = (idx / Math.max(displayedCandles.length - 1, 1)) * effectiveInnerWidth;
                  const x = padding.left + xp + offset;
                  const y = 10 + (100 - val) / 100 * 60; // map 0-100 to 10-70
                  return idx === 0 ? null : <circle key={idx} cx={x} cy={y} r={0.6} fill="#FFD166" />;
                })}
                {/* RSI path */}
                {(() => {
                  const points = rsi.map((v,i) => {
                    if (v == null) return null;
                    const xp = (i / Math.max(displayedCandles.length - 1, 1)) * effectiveInnerWidth;
                    const x = padding.left + xp + offset;
                    const y = 10 + (100 - v) / 100 * 60;
                    return `${x},${y}`;
                  }).filter(Boolean).join(' ');
                  return <polyline points={points} fill="none" stroke="#FFC857" strokeWidth="1.2" opacity="0.95" />;
                })()}
              </svg>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-panel border border-border-hairline bg-bg-surface-alt p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-text-disabled">Ouverture</p>
          <p className="mt-1 ticker-font text-text-primary">{lastCandle?.open.toFixed(2)} €</p>
        </div>
        <div className="rounded-panel border border-border-hairline bg-bg-surface-alt p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-text-disabled">Clôture</p>
          <p className="mt-1 ticker-font text-market-bid">{lastCandle?.close.toFixed(2)} €</p>
        </div>
        <div className="rounded-panel border border-border-hairline bg-bg-surface-alt p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-text-disabled">Intervalle</p>
          <p className="mt-1 ticker-font text-text-primary">{minLow.toFixed(2)} → {maxHigh.toFixed(2)} €</p>
        </div>
      </div>
    </section>
  );
}
