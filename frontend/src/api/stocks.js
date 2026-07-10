import api from './axiosClient.js';

export async function fetchStocks() {
  if (import.meta.env.DEV) {
    return [
      { id: 1, symbole: 'AAPL', nom: 'Apple', prixActuel: 173.22 },
      { id: 2, symbole: 'MSFT', nom: 'Microsoft', prixActuel: 326.11 }
    ];
  }

  const response = await api.get('/stocks');
  return response.data;
}

export async function fetchStockHistory(symbole) {
  if (import.meta.env.DEV) {
    return [
      { date: '2026-07-01T00:00:00Z', open: 171.2, high: 174.5, low: 170.8, close: 173.2 },
      { date: '2026-07-02T00:00:00Z', open: 173.4, high: 176.0, low: 172.1, close: 175.9 }
    ];
  }

  const response = await api.get(`/stocks/${symbole}/history`);
  return response.data;
}
