import api from './axiosClient.js';

export async function fetchPortfolio() {
  if (import.meta.env.DEV) {
    return {
      valueTotal: 25834.12,
      positions: [
        { id: 1, symbole: 'AAPL', quantite: 15, prixMoyen: 165.4, valeurActuelle: 173.2, pnl: 116.7 },
        { id: 2, symbole: 'MSFT', quantite: 20, prixMoyen: 310.1, valeurActuelle: 326.1, pnl: 319.8 }
      ]
    };
  }

  const response = await api.get('/portfolio');
  return response.data;
}
