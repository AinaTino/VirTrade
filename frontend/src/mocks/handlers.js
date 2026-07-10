import { rest } from 'msw';

const apiUrl = 'https://localhost:5001/api';

export const handlers = [
  rest.post(`${apiUrl}/auth/login`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ token: 'mock-token', user: { id: 1, email: 'membre4@virtrade.local' } }));
  }),

  rest.post(`${apiUrl}/auth/register`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ token: 'mock-token', user: { id: 1, email: 'membre4@virtrade.local' } }));
  }),

  rest.get(`${apiUrl}/stocks`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([
      { id: 1, symbole: 'AAPL', nom: 'Apple', prixActuel: 173.22 },
      { id: 2, symbole: 'MSFT', nom: 'Microsoft', prixActuel: 326.11 }
    ]));
  }),

  rest.get(`${apiUrl}/stocks/:symbole/history`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([
      { date: '2026-07-01T00:00:00Z', open: 171.2, high: 174.5, low: 170.8, close: 173.2 },
      { date: '2026-07-02T00:00:00Z', open: 173.4, high: 176.0, low: 172.1, close: 175.9 }
    ]));
  }),

  rest.get(`${apiUrl}/portfolio`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({
      valueTotal: 25834.12,
      positions: [
        { id: 1, symbole: 'AAPL', quantite: 15, prixMoyen: 165.4, valeurActuelle: 173.2, pnl: 116.7 },
        { id: 2, symbole: 'MSFT', quantite: 20, prixMoyen: 310.1, valeurActuelle: 326.1, pnl: 319.8 }
      ]
    }));
  }),

  rest.get(`${apiUrl}/orders`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([
      { id: 1, symbole: 'AAPL', quantite: 10, sensOrdre: 'Buy', prixLimite: 173.0, statut: 'Open' }
    ]));
  }),

  rest.get(`${apiUrl}/trades`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([
      { id: 101, symbole: 'AAPL', quantite: 50, prix: 172.5, sens: 'Buy', heure: '09:31:12' },
      { id: 102, symbole: 'MSFT', quantite: 25, prix: 324.2, sens: 'Sell', heure: '09:31:45' },
      { id: 103, symbole: 'GOOGL', quantite: 15, prix: 134.1, sens: 'Buy', heure: '09:32:05' }
    ]));
  }),

  rest.post(`${apiUrl}/orders`, (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({ id: Math.floor(Math.random() * 1000), statut: 'Open', tradesExecutes: 0 }));
  }),

  rest.delete(`${apiUrl}/orders/:id`, (req, res, ctx) => {
    return res(ctx.status(204));
  })
];
