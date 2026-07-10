import type { OrderBookSnapshot, OrderBookNiveau } from '../types'

/** Génère un carnet d'ordres plausible (10 niveaux bid/ask) autour du prix courant */
export function genererOrderBook(symbole: string, prixMarche: number): OrderBookSnapshot {
  const bids: OrderBookNiveau[] = []
  const asks: OrderBookNiveau[] = []
  const tick = Math.max(prixMarche * 0.0006, 0.01)

  for (let i = 0; i < 10; i++) {
    const prixBid = Math.round((prixMarche - tick * (i + 1)) * 100) / 100
    const prixAsk = Math.round((prixMarche + tick * (i + 1)) * 100) / 100
    // la profondeur diminue en s'éloignant du meilleur prix, avec du bruit
    const baseQty = 400 * Math.exp(-i * 0.22)
    bids.push({ prix: prixBid, quantite: Math.max(1, Math.round(baseQty * (0.5 + Math.random()))) })
    asks.push({ prix: prixAsk, quantite: Math.max(1, Math.round(baseQty * (0.5 + Math.random()))) })
  }

  return {
    symbole,
    bids,
    asks,
    spread: Math.round((asks[0].prix - bids[0].prix) * 100) / 100,
    timestamp: new Date().toISOString(),
  }
}
