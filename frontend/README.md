# VirTrade — Frontend (Membre 4)

Frontend React de la bourse virtuelle VirTrade. Construit avec **React 18 + Vite +
TypeScript + Tailwind CSS v4**, en **mode 100 % mocké** : aucune dépendance au
backend n'est requise pour lancer, démontrer ou continuer à développer l'interface.

## Démarrer

```bash
npm install
npm run dev
```

Ouvre `http://localhost:5173`. Connexion de démo pré-remplie : n'importe quel
e-mail + mot de passe (4 caractères min.) — tout est simulé.

## Ce qui est simulé

Comme le backend n'est pas encore prêt, `src/mocks/mockHub.ts` reproduit fidèlement
le contrat SignalR décrit dans la doc (section 11 — events `OrderBookUpdate`,
`PrixUpdate`, `NouveauTrade`, `PortefeuilleUpdate`, `LeaderboardUpdate`) :

- **Prix** : mouvement brownien géométrique (`src/mocks/brownianEngine.ts`), identique
  à la formule C# de la section 1.5/14 de la doc.
- **Carnet d'ordres** : 10 niveaux bid/ask générés autour du prix courant
  (`src/mocks/orderBookEngine.ts`), avec barres de profondeur visuelles.
- **Ordres** : `src/api/orders.ts` reproduit la logique de validation du
  `Validator` backend (solde/positions insuffisants) avant d'exécuter un ordre
  Market immédiatement ou de le laisser `OPEN` pour un Limit non atteint.
- **Portefeuille & Leaderboard** : recalculés en direct à chaque tick.

## Brancher le vrai backend

Toute la logique mock est isolée dans `src/mocks/` et derrière un flag unique :

```ts
// src/api/client.ts
export const MODE_MOCK = true // ← passer à false
```

Une fois `MODE_MOCK = false` :
1. Renseigner `VITE_API_URL` dans `.env` (copier `.env.example`).
2. Remplacer le contenu de `src/hooks/useSignalR.ts` par une vraie connexion
   `@microsoft/signalr` (le code exact à coller est en commentaire dans le fichier).
3. Chaque fonction de `src/api/*.ts` a déjà son appel `apiClient.*` réel écrit
   juste à côté de la branche mock — rien à réécrire, juste à activer.

Aucun composant ni page n'a besoin d'être modifié : ils consomment uniquement
les hooks (`useSignalR`, `useOrderBook`, `usePortfolio`) et les fonctions de
`src/api/`, jamais directement les mocks.

## Structure

```
src/
├── api/          ← contrat REST (auth, stocks, orders, portfolio, leaderboard)
├── mocks/        ← simulateur (brownien, order book, hub temps réel) — à retirer en prod
├── hooks/        ← useSignalR, useOrderBook, usePortfolio
├── context/      ← AuthContext
├── components/   ← auth/ market/ trading/ portfolio/ leaderboard/ layout/
├── pages/        ← HomePage, LoginPage, RegisterPage, MarketPage, TradingPage,
│                   PortfolioPage, LeaderboardPage
├── types/        ← types miroir des entités backend (section 8.2)
└── lib/          ← formatage (devise, %, dates)
```

## Design

Thème clair volontairement dense en données (inspiré TradingView / Coinbase
Advanced) : `Space Grotesk` pour les titres, `JetBrains Mono` pour tous les
chiffres (prix, quantités, P&L — alignement tabulaire), palette indigo/émeraude/rose
définie dans `src/index.css` via les tokens `@theme` de Tailwind v4.
