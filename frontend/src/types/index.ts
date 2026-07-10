// Types miroir des entités backend (voir section 8.2 — Diagramme de Classes)
// Ces types constituent le contrat attendu du futur backend ASP.NET Core.
// Dès que Membre 1/2/3 livrent les DTOs réels, seuls les fichiers de /api
// et /mocks devraient changer — ces types restent la source de vérité UI.

export type Role = 'TRADER' | 'ADMIN'

export interface Utilisateur {
  id: number
  nom: string
  email: string
  role: Role
  createdAt: string
}

export interface Stock {
  id: number
  symbole: string
  nomComplet: string
  prixActuel: number
  volatilite: number
  variation24h: number // % — dérivé côté front pour l'affichage watchlist
}

export interface HistoriquePrix {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type TypeOrdre = 'MARKET' | 'LIMIT'
export type SensOrdre = 'BUY' | 'SELL'
export type StatutOrdre = 'OPEN' | 'PARTIAL' | 'FILLED' | 'CANCELLED'

export interface Ordre {
  id: number
  type: TypeOrdre
  sens: SensOrdre
  symbole: string
  quantite: number
  quantiteExecutee: number
  prixLimite: number | null
  statut: StatutOrdre
  createdAt: string
  expiresAt: string | null
}

export interface Trade {
  id: number
  symbole: string
  quantite: number
  prixExecution: number
  executedAt: string
  sens: SensOrdre
}

export interface Position {
  stockId: number
  symbole: string
  nomComplet: string
  quantiteDetenue: number
  prixMoyenAchat: number
  prixActuel: number
  pnl: number
  pnlPct: number
  valeurMarche: number
}

export interface Portefeuille {
  soldeCash: number
  valeurTotale: number
  capitalInitial: number
  pnl: number
  pnlPct: number
  positions: Position[]
}

export interface OrderBookNiveau {
  prix: number
  quantite: number
}

export interface OrderBookSnapshot {
  symbole: string
  bids: OrderBookNiveau[]
  asks: OrderBookNiveau[]
  spread: number
  timestamp: string
}

export interface LeaderboardEntry {
  rang: number
  userId: number
  nom: string
  valeurTotale: number
  pnl: number
  pnlPct: number
}

// --- Events SignalR (section 11) ---
export interface OrderBookUpdateEvent extends OrderBookSnapshot {}
export interface PrixUpdateEvent {
  symbole: string
  prix: number
  timestamp: string
}
export interface NouveauTradeEvent extends Trade {}
export interface PortefeuilleUpdateEvent extends Portefeuille {}
export interface LeaderboardUpdateEvent {
  entries: LeaderboardEntry[]
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected'
