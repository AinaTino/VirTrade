import StockList from '../components/market/StockList.jsx';
import MarketOverview from '../components/market/MarketOverview.jsx';
import OrderBook from '../components/market/OrderBook.jsx';
import { useOrderBook } from '../hooks/useOrderBook.js';

export default function MarketPage() {
  const { orderBook, stocks } = useOrderBook();

  return (
    <div className="space-y-6">
      <MarketOverview stocks={stocks} />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <StockList />
        <OrderBook bids={orderBook.bids} asks={orderBook.asks} />
      </div>
    </div>
  );
}
