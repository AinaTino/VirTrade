
## 1. Contexte du projet

Tu développes le frontend React de **VirTrade**, une bourse virtuelle académique (ASP.NET Core 8 + SignalR + matching engine order-book en temps réel). Le cœur fonctionnel du produit est **l'Order Book** : bid/ask, spread, matching price-time priority, exécution de trades en direct via SignalR, portefeuille et P&L en temps réel, candlesticks OHLC, leaderboard.

Ce n'est pas un site vitrine. C'est un **outil de travail dense en données**, utilisé par quelqu'un qui va y passer du temps à surveiller des prix et placer des ordres. Chaque choix de design doit servir la lisibilité des chiffres et la rapidité de lecture, pas la décoration.

**Références directes à étudier et dont il faut s'inspirer (citées dans la doc du projet) :** TradingView (candlesticks, densité d'info), Coinbase Advanced Trade (order book + depth chart), Bitstamp (order book live épuré), Investopedia Simulator / MarketWatch Virtual (order form, portefeuille, leaderboard). N'imite pas un "dashboard SaaS" générique : imite un **terminal de trading**.

---

## 2. Concept directeur : "Terminal de marché"

Direction unique et non négociable : **interface sombre, dense, orientée données**, avec une hiérarchie typographique stricte entre texte d'interface et données numériques. Le signe visuel qu'on est sur une vraie bourse doit être immédiat : chiffres alignés en tableau, couleurs fonctionnelles rouge/vert, mise à jour live visible à l'œil nu.

**Élément signature de l'app** : dans l'Order Book, chaque niveau de prix a une barre de profondeur (depth bar) en arrière-plan de la ligne, proportionnelle au volume cumulé — comme sur Coinbase/Bitstamp. Quand un nouveau prix arrive par SignalR, la ligne concernée flashe brièvement (150ms) en vert ou rouge avant de revenir à l'état neutre. C'est le détail qui doit rendre le book "vivant" et convaincre que c'est une vraie plateforme.

---

## 3. Palette de couleurs (tokens exacts — à respecter au pixel)

```css
:root {
  /* Fond */
  --bg-base:        #0B0E14;  /* fond principal, presque noir */
  --bg-surface:      #10141C;  /* cartes, panneaux (order book, chart, formulaires) */
  --bg-surface-alt:  #161B26;  /* lignes alternées de tableaux, hover */
  --border-hairline: #1E2530;  /* toutes les bordures, 1px, jamais plus */

  /* Texte */
  --text-primary:    #D6DAE3;  /* texte principal */
  --text-secondary:  #7A8194;  /* labels, métadonnées, timestamps */
  --text-disabled:   #454B58;

  /* Fonctionnel — marché */
  --bid-buy:         #00C896;  /* achat / positif / gain — vert teal, PAS vert pomme */
  --bid-buy-bg:      rgba(0, 200, 150, 0.08);   /* fond des lignes BID */
  --ask-sell:        #F5455C;  /* vente / négatif / perte — rouge */
  --ask-sell-bg:     rgba(245, 69, 92, 0.08);   /* fond des lignes ASK */

  /* Accent interactif */
  --accent:          #3E7CFF;  /* liens, focus, boutons secondaires, sélection */
  --accent-warn:     #F5A623;  /* alertes, ordres en attente (OPEN), expiration proche */

  /* Boutons d'action de marché */
  --btn-buy:         #00A87E;  /* bouton "Acheter" */
  --btn-buy-hover:   #00C896;
  --btn-sell:        #E6394F;  /* bouton "Vendre" */
  --btn-sell-hover:  #F5455C;
}
```

**Règles d'usage strictes :**
- Le vert et le rouge sont **réservés exclusivement** au sens du marché (achat/hausse vs vente/baisse). Ne jamais les utiliser pour autre chose (pas de bouton "succès" vert générique, pas d'erreur rouge générique — utilise `--accent-warn` ou un gris pour les messages système neutres).
- Le fond n'est jamais un noir pur (`#000000`) : toujours `--bg-base` (#0B0E14), qui garde une teinte bleu-nuit chaude sous la lumière d'écran — c'est ce qui distingue un vrai terminal financier d'un simple "dark mode" bootstrap.
- Contraste : `--text-primary` sur `--bg-base` doit rester ≥ 7:1. Vérifie `--bid-buy` et `--ask-sell` sur fond `--bg-surface` : ils doivent passer AA (4.5:1) pour le texte, sinon épaissis le poids de police plutôt que d'éclaircir la couleur (qui casserait la cohérence rouge/vert entre les écrans).
- Ne jamais utiliser seulement la couleur pour indiquer un sens : accompagne toujours BID/ASK d'un signe `▲`/`▼` ou `+`/`−` textuel (accessibilité daltonisme — un trader daltonien doit pouvoir lire le book).

---

## 4. Typographie

**Deux familles, rôles stricts, jamais interchangeables :**

| Rôle | Police | Usage |
|---|---|---|
| **Interface** | `Inter` (400/500/600/700) | Titres, labels, boutons, navigation, texte courant |
| **Données numériques** | `JetBrains Mono` (400/500/700) | TOUS les chiffres : prix, quantités, %, timestamps, P&L, order book, tableaux de trades |

**Pourquoi le monospace pour les chiffres** : sur un vrai terminal de trading, les colonnes de prix doivent s'aligner verticalement au chiffre près pour un scan visuel instantané. Un chiffre en Inter (proportionnelle) qui bouge en live "saute" visuellement — en JetBrains Mono, il reste stable. C'est un détail non négociable pour l'authenticité.

**Échelle type :**
```
Prix hero (ex: cours actuel AAPL sur TradingPage) : 32px / 700 / JetBrains Mono
Chiffres de tableau (order book, positions)        : 13-14px / 500 / JetBrains Mono, tabular-nums
Titres de section                                  : 15px / 600 / Inter, uppercase, letter-spacing 0.04em
Labels/métadonnées                                 : 11-12px / 500 / Inter, --text-secondary, uppercase
Corps de texte (formulaires, messages)              : 14px / 400 / Inter
```

Active la feature CSS `font-variant-numeric: tabular-nums` partout où des chiffres changent en live (Portfolio, OrderBook, Leaderboard) pour empêcher tout micro-déplacement de layout au tick.

---

## 5. Layout général de l'application

```
┌────────────────────────────────────────────────────────────────┐
│ TOPBAR : logo VirTrade | recherche stock | solde cash | PnL | ⚙ │
├───────────┬──────────────────────────────────────────┬─────────┤
│           │                                          │         │
│  SIDEBAR  │           ZONE DE CONTENU PRINCIPALE       │ (selon  │
│  (icônes  │        (Market / Trading / Portfolio /     │  page)  │
│  + labels)│         Leaderboard / Admin)                │         │
│           │                                          │         │
│ Marché    │                                          │         │
│ Trading   │                                          │         │
│ Portefeuil│                                          │         │
│ Classement│                                          │         │
│ Admin     │                                          │         │
└───────────┴──────────────────────────────────────────┴─────────┘
```

- Sidebar fixe, sombre, largeur ~72px repliée / 220px dépliée, icônes line-art fines (pas d'icônes remplies façon app mobile).
- Le solde cash + le P&L global sont **toujours visibles dans la topbar**, jamais enterrés dans une sous-page — c'est l'info que le trader vérifie en premier, à chaque instant (comme Robinhood/Coinbase).
- Zéro `border-radius` supérieur à 6px. Les cartes de terminal ont des coins presque droits, pas arrondis façon app grand public.
- Espacement dense mais respirant : padding interne des cartes 16px, gap entre sections 24px. On privilégie la densité d'info (comme un vrai terminal) sans jamais tasser au point de rendre illisible.

### Page Trading (l'écran le plus important — 3 colonnes)

```
┌───────────────────┬─────────────────┬───────────────────┐
│                   │                 │                   │
│  CANDLESTICK CHART │   ORDER BOOK    │    ORDER FORM     │
│  (OHLC + volume)   │  BID | ASK      │  Market / Limit   │
│                   │  + depth bars   │  Buy / Sell        │
│                   │  + spread       │  Qty / Prix        │
│                   │                 │                   │
├───────────────────┴─────────────────┴───────────────────┤
│         MES ORDRES EN COURS (tableau, annulables)        │
└───────────────────────────────────────────────────────────┘
```

Le Chart occupe ~50% de la largeur, l'Order Book ~25%, l'Order Form ~25% — ratios TradingView/Coinbase, pas un formulaire pleine largeur façon page web classique.

---

## 6. Spécifications composant par composant

**`OrderBook.jsx`** — le composant signature :
- Deux colonnes BID (gauche, vert) / ASK (droite, rouge), prix au centre.
- Chaque ligne a une barre horizontale en arrière-plan (`--bid-buy-bg` / `--ask-sell-bg`) dont la largeur = volume cumulé à ce niveau / volume max visible. C'est la depth bar.
- Le spread s'affiche en bandeau horizontal entre les deux colonnes, en `--text-secondary`, format : `Spread 0.50 (0.33%)`.
- À chaque `OrderBookUpdate` SignalR, la ligne qui change flashe 150ms (fond qui passe à une version plus saturée de sa couleur puis retour), via une classe CSS transitoire, pas un re-render brutal.

**`CandlestickChart.jsx`** :
- ApexCharts ou Chart.js en thème sombre custom (jamais le thème clair par défaut). Bougies haussières `--bid-buy`, baissières `--ask-sell`, mèches fines.
- Volume en barres semi-transparentes sous le chart, même logique de couleur.
- Grille de fond très discrète (`--border-hairline` à 30% d'opacité), axes en `--text-secondary`.

**`OrderForm.jsx`** :
- Toggle Market/Limit en segmented control (pas des radio buttons classiques).
- Deux boutons d'action clairement différenciés : "Acheter" (`--btn-buy`) et "Vendre" (`--btn-sell`) — jamais un bouton neutre unique avec un select à côté.
- Affiche en direct sous le formulaire : coût estimé, solde disponible après ordre, fonds déjà réservés (cohérent avec la validation métier du backend).

**`StockList.jsx`** :
- Tableau dense, une ligne par stock : symbole (Inter bold) + nom (text-secondary) | prix (JetBrains Mono) | variation 24h (couleur fonctionnelle + flèche) | mini-sparkline (30px de haut, sans axes).
- Ligne cliquable entière → navigue vers TradingPage du stock.

**`Portfolio.jsx` / `Positions.jsx`** :
- Card résumé en haut : Valeur totale, Solde cash, P&L global (chiffre + %, couleur fonctionnelle), avec un mini-graphe d'évolution du capital si possible.
- Tableau positions : symbole | qté détenue | prix moyen d'achat | prix actuel | P&L latent (coloré) | P&L % .

**`Leaderboard.jsx`** :
- Classement en tableau, rang | pseudo | valeur portefeuille | P&L %. Le rang de l'utilisateur courant est mis en évidence (fond `rgba(62,124,255,0.08)`, bordure gauche `--accent`).
- Top 3 : légère médaille/couleur distinctive (or/argent/bronze discrets), sans emoji enfantin.

**Auth (`LoginForm.jsx` / `RegisterForm.jsx`)** :
- Écran centré, fond `--bg-base`, carte `--bg-surface` étroite (max 400px). Pas de dégradé coloré ni d'illustration décorative — juste le logo VirTrade (typographie monospace, esprit "ticker") et le formulaire. Sobriété = crédibilité pour un outil financier.

**`AdminPage.jsx`** :
- Même langage visuel, tableau de gestion des stocks (CRUD) + formulaire de configuration marché. Pas d'esthétique "admin panel" différente — même terminal, juste des droits différents.

---

## 7. Micro-interactions et animation

Le mouvement doit **toujours signifier une donnée qui change**, jamais de la décoration gratuite :
- Flash 150ms vert/rouge sur mise à jour de prix ou de ligne d'order book.
- Transition de nombre : quand un chiffre change (P&L, solde), fais un léger fade + shift vertical de 2px (100ms), jamais un compteur qui défile façon slot machine.
- Un point pastille pulsant discret (`--bid-buy` ou `--accent`) à côté du statut de connexion SignalR ("live" / "reconnexion...").
- Aucune animation d'entrée de page élaborée, aucun hover 3D, aucun glassmorphism — ça casserait immédiatement la crédibilité "terminal pro".

---

## 8. Ton du contenu (copy)

Registre : direct, factuel, jamais familier ni ludique. Vocabulaire aligné avec les termes métier du projet (Ordre, Portefeuille, Solde, Position) — en français partout dans l'UI, cohérent avec la doc du projet.

- Erreurs : précises et actionnables. "Solde insuffisant pour cet ordre" plutôt que "Une erreur est survenue".
- États vides : orientés action. Ex. Positions vides → "Aucune position ouverte. Passez votre premier ordre depuis la page Marché."
- Jamais de point d'exclamation, jamais de ton "amical app grand public" — un trader ne veut pas qu'on lui souhaite la bienvenue avec des confettis.

---

## 9. Accessibilité et responsive

- Focus clavier visible partout : contour 2px `--accent`, jamais supprimé.
- Contrastes vérifiés indépendamment en mode sombre (pas d'inversion naïve d'une palette claire).
- Le sens BID/ASK ne repose jamais uniquement sur la couleur (voir §3).
- Responsive : en dessous de 1024px, la page Trading passe en empilement vertical (Chart → Order Form → Order Book), la sidebar se réduit à une barre d'icônes en bas d'écran façon app mobile de trading.

---

## 10. Stack et implémentation

- Tailwind CSS avec tokens custom (`tailwind.config.js` : mapper toutes les couleurs de la section 3 en variables, ne jamais utiliser les couleurs Tailwind par défaut `green-500`/`red-500`).
- ApexCharts pour les candlesticks (thème sombre custom, pas le thème par défaut).
- Toutes les couleurs, espacements et rayons de bordure doivent venir des tokens définis ici — aucune valeur codée en dur dans les composants.

---

## Checklist avant de considérer une page "terminée"

- [ ] Aucune couleur autre que celles de la section 3 n'est utilisée
- [ ] Tous les chiffres sont en JetBrains Mono avec `tabular-nums`
- [ ] Le sens BID/ASK est lisible même en niveaux de gris (test daltonisme)
- [ ] Aucun `border-radius` > 6px
- [ ] Order Book a ses depth bars et son flash de mise à jour
- [ ] Solde + P&L visibles dans la topbar sur toutes les pages authentifiées
- [ ] Aucune animation qui ne représente pas un changement de donnée réel
