import Portfolio from '../components/portfolio/Portfolio.jsx';
import PortfolioSummary from '../components/portfolio/PortfolioSummary.jsx';
import { usePortfolio } from '../hooks/usePortfolio.js';
import CandlestickChart from '../components/market/CandlestickChart.jsx';
import { useEffect, useState } from 'react';
import { fetchStockHistory } from '../api/stocks.js';

export default function PortfolioPage() {
  const { portfolio, loading, error } = usePortfolio();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await fetchStockHistory('AAPL');
      setHistory(data);
    }

    load();
  }, []);

  if (loading) return <div className="rounded-panel border border-border-hairline bg-bg-surface/90 p-6 text-text-secondary">Chargement du portefeuille...</div>;
  if (error) return <div className="rounded-panel border border-ask-sell/30 bg-ask-sell-bg p-4 text-ask-sell">{error}</div>;

  return (
    <div className="space-y-6">
      <PortfolioSummary portfolio={portfolio} />
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Portfolio portfolio={portfolio} />
        <CandlestickChart data={history} />
      </div>
    </div>
  );
}
