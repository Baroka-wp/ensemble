# Influence Resto — MVP

Plateforme web légère pour campagnes d'influence restaurants.
Un restaurant crée des codes promo personnels pour ses influenceurs ; les clients scannent un QR en salle, saisissent un code et reçoivent un ticket de réduction. Chaque scan crédite un montant fixe (€) à l'influenceur, avec blocage du device 24 h.

Voir [`CAHIER_DES_CHARGES.md`](./CAHIER_DES_CHARGES.md) pour la spec complète.

## Stack

**Backend** Express 4 + Socket.io v4 + Prisma + PostgreSQL — **Frontend** React 18 + Vite + TanStack Query + Tailwind + FingerprintJS — **Tests** Playwright.
Un seul processus Node sert API, SPA et WebSocket en prod (§6.1 — pas de Redis, pas de S3, 1 réplique).

## État du projet

Tous les sprints S0–S7 sont livrés. Critères §13 du cahier des charges validés en E2E.

| Sprint | Livrable | État |
|--------|----------|------|
| S0 | Repo, Docker, schema Prisma, `/api/health` | ✅ |
| S1 | Auth restaurant (JWT 7 j, bcrypt 12) | ✅ |
| S2 | CRUD influenceurs + révocation code | ✅ |
| S3 | Scan public + ticket (transaction atomique) | ✅ |
| S4 | Dashboard influenceur public | ✅ |
| S5 | Stats admin + historique paginé + QR | ✅ |
| S6 | Socket.io + son de notif (admin & influenceur) | ✅ |
| S7 | Tests E2E Playwright + polish mobile | ✅ |

## Pré-requis

- Node 20+
- PostgreSQL local accessible (créer une base, ex. `influence_resto`)

## Démarrage local

```bash
cp .env.example .env
# Éditer DATABASE_URL et JWT_SECRET (≥ 32 caractères)

npm install
npm run prisma:migrate          # crée les tables
npm run seed                    # 1 resto + 2 influenceurs + 5 scans
npm run dev                     # API :3000 + Vite :5173
```

Ouvrir http://localhost:5173 — Vite proxy `/api` et `/socket.io` vers `:3000`.

**Identifiants seed :**

- Admin restaurant : `demo@resto.fr` / `demo1234`
- Login Marie (influenceuse) : `marie@demo.fr` / `demo1234` → http://localhost:5173/i/login
- Login Paul (influenceur) : `paul@demo.fr` / `demo1234`
- Page scan : http://localhost:5173/s/chez-martin

## Build & prod locale

```bash
npm run build
NODE_ENV=production npm start   # tout sur :3000
```

Le serveur Express sert l'API sous `/api/*`, Socket.io sur `/socket.io`, et la SPA sur tout le reste avec un fallback `index.html` (§6.4). Refresh sur n'importe quelle route SPA fonctionne.

## Tests E2E

```bash
npm run test:e2e                # build + lance prod + Chromium headless
npm run test:e2e:ui             # mode interactif Playwright
```

6 specs couvrant les critères §13 :

- Page scan : ticket, blocage 24 h, code invalide, slug inconnu
- Auth : register → dashboard → création influenceur, login mauvais mot de passe

Les tests réinitialisent l'état du restaurant seed (scans + device_blocks) entre chaque run et utilisent un fingerprint déterministe (`window.__TEST_FINGERPRINT`).

## Endpoints API (§7)

**Auth** (sans préfixe `/api/auth/`)

- `POST /register` `{ email, password, restaurantName }`
- `POST /login` `{ email, password }`
- `GET /me` *(Bearer)*

**Admin** *(Bearer JWT, scoped au restaurant)*

- `GET /admin/stats` — agrégats jour/7j/30j/total + top 5 influenceurs
- `GET|POST /admin/influencers` — liste / créer
- `GET|PATCH /admin/influencers/:id` — lire / modifier (nom, %, gain €, actif)
- `POST /admin/influencers/:id/revoke-code` — désactive l'ancien code, en génère un nouveau
- `GET /admin/scans?page=&limit=&from=&to=&influencerId=` — historique paginé filtrable
- `GET /admin/qr` — `{ url, pngBase64, svg }` à imprimer en salle

**Public** (sans auth)

- `GET /public/restaurants/:slug` — infos page scan
- `POST /public/scan` `{ slug, influencerCode, fingerprint }` — transaction atomique (§7.4), 10 req/min/IP

**Influenceur** (login email + mot de passe, JWT séparé)

- `POST /influencer-auth/login` `{ email, password }`
- `GET /influencer-auth/me` *(Bearer)*
- `GET /influencer-auth/stats` *(Bearer)* — dashboard de l'influenceur connecté

**Health**

- `GET /api/health` — `{ status, db }`

## Socket.io (§8)

2 namespaces, tous deux authentifiés par JWT (`type: 'restaurant'` ou `'influencer'`) :

- `/admin` — auth `{ token: <JWT restaurant> }` → join room `restaurant:{id}`
- `/influencer` — auth `{ token: <JWT influenceur> }` → join room `influencer:{id}`

Évènement `scan:created` émis dans les deux rooms après chaque scan validé. Côté client, le hook `useScanSocket` joue un carillon doux (Web Audio API, pas de fichier asset) et invalide les queries TanStack pour refresh live.

## Déploiement Coolify

1. Pousser le repo sur Git.
2. Coolify → nouveau service Docker depuis le `Dockerfile`.
3. Service Postgres séparé → renseigner `DATABASE_URL`.
4. Variables d'env :
   - `JWT_SECRET` (≥ 32 caractères)
   - `APP_DOMAIN` (URL publique HTTPS, ex. `https://scan.monresto.fr`)
   - `NODE_ENV=production`
5. Healthcheck déjà câblé sur `/api/health`.
6. Au démarrage, `prisma migrate deploy` applique les migrations.

Backup Postgres : `pg_dump` hebdo via cron VPS — voir [`docs/RUNBOOK.md`](./docs/RUNBOOK.md).

## Scripts

| Script | Effet |
|---|---|
| `npm run dev` | API + Vite en parallèle |
| `npm run build` | Build client (Vite) + serveur (tsc) |
| `npm start` | Lance le bundle prod |
| `npm run prisma:migrate` | Crée/maj migrations dev |
| `npm run prisma:deploy` | Applique les migrations en prod |
| `npm run prisma:studio` | UI Prisma |
| `npm run seed` | Données de démo |
| `npm run typecheck` | tsc --noEmit (client + serveur) |
| `npm run test:e2e` | Playwright (build + prod + Chromium) |
| `npm run test:e2e:ui` | Playwright en mode interactif |

## Structure

```
src/
├── server/        Express + Socket.io
│   ├── index.ts
│   ├── routes/    auth · admin.influencers · admin.stats · public · health
│   ├── middleware/
│   ├── socket/    namespaces /admin et /influencer
│   └── lib/       prisma · jwt · slug · promoCode · ticketCode · fingerprint · logger
├── client/        React SPA (Vite)
│   ├── pages/
│   │   ├── auth/        Login · Register · AuthLayout
│   │   ├── dashboard/   Home · Layout · ScansPage · QrPage
│   │   │   └── influencers/  List · New · Edit · Form
│   │   └── public/      ScanPage · TicketScreen · InfluencerDashboardPage
│   ├── components/      LiveScanToast (badge + toast)
│   └── lib/             api · auth · fingerprint · clipboard · useScanSocket · notificationSound
└── shared/        Zod schemas + types partagés client/serveur
    ├── env.ts
    └── schemas/   auth · influencer · scan · stats · admin

prisma/            schema.prisma + seed.ts
tests/e2e/         specs Playwright + helpers DB
```

## Décisions clés (§18)

- **1 seul serveur Express** sert API + SPA + Socket.io
- **Gain influenceur = montant fixe absolu en FCFA** par scan, jamais un %
- **Totaux** = `SUM(scans.reward_xof)` calculé à la demande (pas de colonne maintenue)
- **Snapshot** sur chaque scan : `reward_xof` + `discount_percent` figés au moment T
- **Anti-double-scan** : SHA-256 du visitorId FingerprintJS, blocage 24 h par `(restaurant, device)`
- **Auth influenceur** : email + mot de passe créés par l'admin du restaurant, JWT séparé (`type: 'influencer'`)
- **Validation caisse** : visuelle uniquement (le ticket est la preuve)
