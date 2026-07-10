import { useEffect, useState } from 'react';
import { fetchStocks } from '../api/stocks.js';
import { useSignalR } from './useSignalR.js';

export function useOrderBook() {
  const [stocks, setStocks] = useState([]);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { latestQuote, subscribe, unsubscribe } = useSignalR();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchStocks();
        setStocks(data);
        setOrderBook({ bids: [], asks: [] });
      } catch (err) {
        setError(err.message ?? 'Erreur chargement');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (!latestQuote) return;
    setStocks((prev) => prev.map((s) => s.symbole === latestQuote.symbol ? { ...s, prixActuel: latestQuote.price } : s));
  }, [latestQuote]);

  useEffect(() => {
    const handleOrderBook = (payload) => {
      if (!payload) return;
      setOrderBook({ bids: payload.Bids ?? [], asks: payload.Asks ?? [] });
    };

    subscribe('OrderBookUpdated', handleOrderBook);
    return () => unsubscribe('OrderBookUpdated', handleOrderBook);
  }, [subscribe, unsubscribe]);

  return { stocks, orderBook, setOrderBook, loading, error };
}
