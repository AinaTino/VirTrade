import OrderForm from '../components/trading/OrderForm.jsx';
import OrderList from '../components/trading/OrderList.jsx';
import MarketFeed from '../components/trading/MarketFeed.jsx';
import TradeTape from '../components/trading/TradeTape.jsx';

export default function TradingPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <MarketFeed />
        <OrderList />
        <TradeTape />
      </div>
      <OrderForm />
    </div>
  );
}
