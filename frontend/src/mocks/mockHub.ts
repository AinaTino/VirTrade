import { SEED_STOCKS, CAPITAL_INITIAL, genererLeaderboard } from './seedData'
import { prochainPrix, impactMarche } from './brownianEngine'
import { genererOrderBook } from './orderBookEngine'
import type {
  Stock,
  Position,
  Portefeuille,
  OrderBookUpdateEvent,
  PrixUpdateEvent,
  NouveauTradeEvent,
  PortefeuilleUpdateEvent,
  LeaderboardUpdateEvent,
  ConnectionStatus,
  SensOrdre,
} from '../types'

// -----------------------------------------------------------------------------
// MockHub — simule le contrat de BourseHub (SignalR) décrit section 11.
// Même surface d'API que HubConnection (.on / .off / .invoke / .start / .state)
// afin que useSignalR.js n'ait qu'à changer d'implémentation, pas de contrat,
// une fois le vrai backend + @microsoft/signalr branchés (semaine 3).
// -----------------------------------------------------------------------------

type EventName =
  | 'OrderBookUpdate'
  | 'PrixUpdate'
  | 'NouveauTrade'
  | 'PortefeuilleUpdate'
  | 'LeaderboardUpdate'

type Handler = (payload: unknown) => void

class MockHubConnection {
  private handlers: Record<EventName, Set<Handler>> = {
    OrderBookUpdate: new Set(),
    PrixUpdate: new Set(),
    NouveauTrade: new Set(),
    PortefeuilleUpdate: new Set(),
    LeaderboardUpdate: new Set(),
  }

  private stocks = new Map<string, Stock>(SEED_STOCKS.map((s) => [s.symbole, { ...s }]))
  private subscriptions = new Set<string>()
  private tickTimer: ReturnType<typeof setInterval> | null = null
  private portfolioTimer: ReturnType<typeof setInterval> | null = null
  private leaderboardTimer: ReturnType<typeof setInterval> | null = null

  private positions = new Map<string, Position>() // symbole -> position simulée
  private soldeCash = CAPITAL_INITIAL

  state: ConnectionStatus = 'disconnected'

  on(event: EventName, callback: Handler) {
    this.handlers[event].add(callback)
  }

  off(event: EventName, callback: Handler) {
    this.handlers[event].delete(callback)
  }

  private emit(event: EventName, payload: unknown) {
    this.handlers[event].forEach((cb) => cb(payload))
  }

  async invoke(method: 'AbonnerStock' | 'SeDesabonner', symbole: string) {
    if (method === 'AbonnerStock') this.subscriptions.add(symbole)
    if (method === 'SeDesabonner') this.subscriptions.delete(symbole)
    return Promise.resolve()
  }

  async start() {
    this.state = 'connecting'
    await new Promise((r) => setTimeout(r, 350)) // simule la latence de handshake
    this.state = 'connected'

    this.tickTimer = setInterval(() => this.tick(), 1400)
    this.portfolioTimer = setInterval(() => this.emitPortefeuille(), 4000)
    this.leaderboardTimer = setInterval(() => this.emitLeaderboard(), 6000)
  }

  stop() {
    this.state = 'disconnected'
    if (this.tickTimer) clearInterval(this.tickTimer)
    if (this.portfolioTimer) clearInterval(this.portfolioTimer)
    if (this.leaderboardTimer) clearInterval(this.leaderboardTimer)
  }

  getStock(symbole: string): Stock | undefined {
    return this.stocks.get(symbole)
  }

  getAllStocks(): Stock[] {
    return Array.from(this.stocks.values())
  }

  /** Permet à la page Trading d'ouvrir/simuler une position après un ordre exécuté */
  appliquerOrdreExecute(symbole: string, sens: SensOrdre, quantite: number, prixExecution: number) {
    const stock = this.stocks.get(symbole)
    if (!stock) return

    // Impact marché — le trade déplace le prix (section 14)
    const nouveauPrix = impactMarche(stock.prixActuel, quantite, sens)
    this.stocks.set(symbole, { ...stock, prixActuel: nouveauPrix })

    const existante = this.positions.get(symbole)
    if (sens === 'BUY') {
      this.soldeCash -= quantite * prixExecution
      if (existante) {
        const qte = existante.quantiteDetenue + quantite
        const prixMoyen =
          (existante.quantiteDetenue * existante.prixMoyenAchat + quantite * prixExecution) / qte
        this.positions.set(symbole, { ...existante, quantiteDetenue: qte, prixMoyenAchat: prixMoyen })
      } else {
        this.positions.set(symbole, {
          stockId: stock.id,
          symbole,
          nomComplet: stock.nomComplet,
          quantiteDetenue: quantite,
          prixMoyenAchat: prixExecution,
          prixActuel: nouveauPrix,
          pnl: 0,
          pnlPct: 0,
          valeurMarche: 0,
        })
      }
    } else if (existante) {
      this.soldeCash += quantite * prixExecution
      const qte = Math.max(0, existante.quantiteDetenue - quantite)
      if (qte === 0) this.positions.delete(symbole)
      else this.positions.set(symbole, { ...existante, quantiteDetenue: qte })
    }

    const trade: NouveauTradeEvent = {
      id: Math.floor(Math.random() * 1_000_000),
      symbole,
      quantite,
      prixExecution,
      executedAt: new Date().toISOString(),
      sens,
    }
    this.emit('NouveauTrade', trade)
    this.emit('PrixUpdate', { symbole, prix: nouveauPrix, timestamp: trade.executedAt } as PrixUpdateEvent)
    if (this.subscriptions.has(symbole)) {
      this.emit('OrderBookUpdate', genererOrderBook(symbole, nouveauPrix) as OrderBookUpdateEvent)
    }
    this.emitPortefeuille()
  }

  private tick() {
    // fait vivre un stock aléatoire à chaque tick
    const symboles = Array.from(this.stocks.keys())
    const symbole = symboles[Math.floor(Math.random() * symboles.length)]
    const stock = this.stocks.get(symbole)
    if (!stock) return

    const nouveauPrix = prochainPrix(stock.prixActuel, stock.volatilite)
    const variation24h = stock.variation24h + (nouveauPrix - stock.prixActuel) / stock.prixActuel * 100 * 0.4
    this.stocks.set(symbole, { ...stock, prixActuel: nouveauPrix, variation24h })

    this.emit('PrixUpdate', { symbole, prix: nouveauPrix, timestamp: new Date().toISOString() } as PrixUpdateEvent)

    if (this.subscriptions.has(symbole)) {
      this.emit('OrderBookUpdate', genererOrderBook(symbole, nouveauPrix) as OrderBookUpdateEvent)
    }

    // ~18% de chance qu'un "trade" d'autres traders simulés s'affiche en live
    if (this.subscriptions.has(symbole) && Math.random() < 0.18) {
      const sens: SensOrdre = Math.random() > 0.5 ? 'BUY' : 'SELL'
      this.emit('NouveauTrade', {
        id: Math.floor(Math.random() * 1_000_000),
        symbole,
        quantite: Math.floor(5 + Math.random() * 120),
        prixExecution: nouveauPrix,
        executedAt: new Date().toISOString(),
        sens,
      } as NouveauTradeEvent)
    }
  }

  private emitPortefeuille() {
    const positions = Array.from(this.positions.values()).map((p) => {
      const prixActuel = this.stocks.get(p.symbole)?.prixActuel ?? p.prixActuel
      const valeurMarche = Math.round(prixActuel * p.quantiteDetenue * 100) / 100
      const pnl = Math.round((prixActuel - p.prixMoyenAchat) * p.quantiteDetenue * 100) / 100
      const pnlPct = p.prixMoyenAchat > 0 ? Math.round((pnl / (p.prixMoyenAchat * p.quantiteDetenue)) * 10000) / 100 : 0
      return { ...p, prixActuel, valeurMarche, pnl, pnlPct }
    })
    const valeurPositions = positions.reduce((acc, p) => acc + p.valeurMarche, 0)
    const valeurTotale = Math.round((this.soldeCash + valeurPositions) * 100) / 100
    const pnl = Math.round((valeurTotale - CAPITAL_INITIAL) * 100) / 100

    const portefeuille: PortefeuilleUpdateEvent = {
      soldeCash: Math.round(this.soldeCash * 100) / 100,
      valeurTotale,
      capitalInitial: CAPITAL_INITIAL,
      pnl,
      pnlPct: Math.round((pnl / CAPITAL_INITIAL) * 10000) / 100,
      positions,
    }
    this.emit('PortefeuilleUpdate', portefeuille)
  }

  private emitLeaderboard() {
    const payload: LeaderboardUpdateEvent = { entries: genererLeaderboard() }
    this.emit('LeaderboardUpdate', payload)
  }

  getPortefeuilleSnapshot(): Portefeuille {
    const positions = Array.from(this.positions.values())
    const valeurPositions = positions.reduce((acc, p) => acc + p.prixActuel * p.quantiteDetenue, 0)
    const valeurTotale = Math.round((this.soldeCash + valeurPositions) * 100) / 100
    const pnl = Math.round((valeurTotale - CAPITAL_INITIAL) * 100) / 100
    return {
      soldeCash: Math.round(this.soldeCash * 100) / 100,
      valeurTotale,
      capitalInitial: CAPITAL_INITIAL,
      pnl,
      pnlPct: Math.round((pnl / CAPITAL_INITIAL) * 10000) / 100,
      positions,
    }
  }
}

// Singleton — un seul hub partagé par toute l'app (comme une vraie connexion SignalR)
export const mockHub = new MockHubConnection()
