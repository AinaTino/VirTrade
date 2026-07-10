// Reproduit côté client la logique du MarketSimulator (section 1.5 / 14 de la doc)
// pour que la démo "vive" sans backend. À supprimer dès que /api/stocks + SignalR
// sont branchés — le vrai prix viendra du serveur.

/** Transformée de Box-Muller — choc gaussien aléatoire */
function chocGaussien(): number {
  const u1 = 1.0 - Math.random()
  const u2 = 1.0 - Math.random()
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2)
}

/** dS = S * (mu*dt + sigma*sqrt(dt)*epsilon) — mouvement brownien géométrique */
export function prochainPrix(prixActuel: number, volatilite: number, driftBias = 0): number {
  const dt = 1 / (252 * 390) // 1 tick parmi les minutes de trading annuelles
  const choc = volatilite * Math.sqrt(dt) * chocGaussien() + driftBias * dt
  const nouveau = prixActuel * Math.exp(choc)
  return Math.round(nouveau * 100) / 100
}

/** Génère un historique OHLC plausible pour amorcer un graphique candlestick */
export function genererHistorique(
  prixDepart: number,
  volatilite: number,
  nbBougies = 90
): { timestamp: string; open: number; high: number; low: number; close: number; volume: number }[] {
  const bougies = []
  let prix = prixDepart * 0.85
  const maintenant = Date.now()
  const intervalleMs = 15 * 60 * 1000 // bougies 15 min

  for (let i = nbBougies; i > 0; i--) {
    const open = prix
    let high = open
    let low = open
    // simule ~26 ticks intra-bougie pour un high/low réaliste
    for (let t = 0; t < 26; t++) {
      prix = prochainPrix(prix, volatilite, 0.15)
      if (prix > high) high = prix
      if (prix < low) low = prix
    }
    const close = prix
    bougies.push({
      timestamp: new Date(maintenant - i * intervalleMs).toISOString(),
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.floor(5000 + Math.random() * 45000),
    })
  }
  return bougies
}

/** Impact marché — un trade déplace légèrement le prix (section 14) */
export function impactMarche(prixActuel: number, quantite: number, sens: 'BUY' | 'SELL'): number {
  const impact = Math.min(quantite / 50000, 0.004) // plafonné à 0.4%
  const direction = sens === 'BUY' ? 1 : -1
  return Math.round(prixActuel * (1 + direction * impact) * 100) / 100
}
