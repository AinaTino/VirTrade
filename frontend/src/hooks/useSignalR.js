import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useEffect, useRef, useState } from 'react';

const API_URL = 'https://localhost:5001/bourse';

export function useSignalR() {
  const connectionRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [marketEvents, setMarketEvents] = useState([]);
  const [latestQuote, setLatestQuote] = useState(null);
  const listenersRef = useRef({});

  useEffect(() => {
    if (import.meta.env.DEV) {
      setConnected(true);
      const interval = setInterval(() => {
        const synthetic = {
          symbol: 'AAPL',
          price: Number((172 + Math.random() * 4).toFixed(2))
        };
        setLatestQuote(synthetic);
        setMarketEvents((prev) => [{
          id: `dev-${Date.now()}`,
          type: 'price-update',
          message: `${synthetic.symbol} ${synthetic.price}€`,
          time: new Date().toLocaleTimeString('fr-FR')
        }, ...prev].slice(0, 8));

        (listenersRef.current['MarketUpdate'] ?? []).forEach((fn) => fn(synthetic));
        (listenersRef.current['OrderBookUpdated'] ?? []).forEach((fn) => fn({ symbol: synthetic.symbol }));
      }, 3000);

      return () => clearInterval(interval);
    }

    const connection = new HubConnectionBuilder()
      .withUrl(API_URL)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    connectionRef.current = connection;

    const handleMarketUpdate = (payload) => {
      setLatestQuote(payload);
      setMarketEvents((prev) => [{
        id: `${payload?.symbol ?? 'market'}-${Date.now()}`,
        type: 'price-update',
        message: `${payload?.symbol ?? 'Marché'} ${payload?.price ?? 0}€`,
        time: new Date().toLocaleTimeString('fr-FR')
      }, ...prev].slice(0, 8));
    };

    const handleOrderBookUpdate = (payload) => {
      setMarketEvents((prev) => [{
        id: `orderbook-${Date.now()}`,
        type: 'orderbook',
        message: `OrderBook mis à jour pour ${payload?.symbol ?? 'le marché'}`,
        time: new Date().toLocaleTimeString('fr-FR')
      }, ...prev].slice(0, 8));
    };

    connection.start()
      .then(() => {
        setConnected(true);
        connection.on('MarketUpdate', handleMarketUpdate);
        connection.on('OrderBookUpdated', handleOrderBookUpdate);
      })
      .catch(() => setConnected(false));

    connection.onreconnected(() => setConnected(true));
    connection.onclose(() => setConnected(false));

    return () => {
      if (connectionRef.current) {
        connection.off('MarketUpdate', handleMarketUpdate);
        connection.off('OrderBookUpdated', handleOrderBookUpdate);
        connectionRef.current.stop();
      }
    };
  }, []);

  const subscribe = (eventName, callback) => {
    if (import.meta.env.DEV) {
      listenersRef.current[eventName] = [...(listenersRef.current[eventName] ?? []), callback];
      return;
    }
    if (!connectionRef.current) return;
    connectionRef.current.on(eventName, callback);
  };

  const unsubscribe = (eventName, callback) => {
    if (import.meta.env.DEV) {
      listenersRef.current[eventName] = (listenersRef.current[eventName] ?? []).filter((fn) => fn !== callback);
      return;
    }
    if (!connectionRef.current) return;
    connectionRef.current.off(eventName, callback);
  };

  const invoke = async (method, payload) => {
    if (import.meta.env.DEV) return;
    if (!connectionRef.current) return;
    await connectionRef.current.invoke(method, payload);
  };

  return { connected, marketEvents, latestQuote, subscribe, unsubscribe, invoke };
}
