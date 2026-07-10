import api from './axiosClient.js';

export async function placeOrder(payload) {
  if (import.meta.env.DEV) {
    return { id: Math.floor(Math.random() * 1000), statut: 'Open', tradesExecutes: 0 };
  }

  const response = await api.post('/orders', payload);
  return response.data;
}

export async function fetchOrders() {
  if (import.meta.env.DEV) {
    return [
      { id: 1, symbole: 'AAPL', quantite: 10, sensOrdre: 'Buy', prixLimite: 173.0, statut: 'Open' }
    ];
  }

  const response = await api.get('/orders');
  return response.data;
}

export async function cancelOrder(id) {
  if (import.meta.env.DEV) {
    return true;
  }

  await api.delete(`/orders/${id}`);
  return true;
}

export async function modifyOrder(id, updates) {
  if (import.meta.env.DEV) {
    // simulate modification
    return { ...updates, id, statut: 'Open' };
  }

  const response = await api.put(`/orders/${id}`, updates);
  return response.data;
}

export async function fetchTrades() {
  if (import.meta.env.DEV) {
    return [
      { id: 101, symbole: 'AAPL', quantite: 50, prix: 172.5, sens: 'Buy', heure: '09:31:12' },
      { id: 102, symbole: 'MSFT', quantite: 25, prix: 324.2, sens: 'Sell', heure: '09:31:45' },
      { id: 103, symbole: 'GOOGL', quantite: 15, prix: 134.1, sens: 'Buy', heure: '09:32:05' }
    ];
  }

  const response = await api.get('/trades');
  return response.data;
}
