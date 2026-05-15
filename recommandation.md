# Kabary Platform — Recommandations Docker & Réseau Local

> Synthèse de toutes les recommandations pour le monorepo Kabary (Next.js + Express + Prisma + PostgreSQL + Redis) en environnement Docker avec accès réseau local.

---

## 1. Sécurité

### 1.1 Ne jamais embarquer `.env` dans l'image Docker

```dockerfile
# ❌ DANGEREUX — les secrets sont visibles dans docker history
COPY apps/backend/.env ./apps/backend/.env

# ✅ Supprimer cette ligne du Dockerfile
# Les variables sont injectées par docker-compose via environment:
```

Ajouter à `.dockerignore` :

```
**/.env
**/.env.*
**/node_modules
**/.next
**/dist
**/*.log
```

---

## 2. Dockerfile Backend (`apps/backend/Dockerfile`)

### 2.1 Version corrigée complète

```dockerfile
FROM node:20-alpine

# OpenSSL requis par Prisma sur Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Monorepo root
COPY package.json package-lock.json turbo.json ./

# Package partagé
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src

# Backend
COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/tsconfig.json ./apps/backend/
COPY apps/backend/nodemon.json ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma
COPY apps/backend/src ./apps/backend/src
# ❌ Supprimé : COPY apps/backend/.env
# ❌ Supprimé : COPY apps/backend/prisma.config.ts (inclure dans prisma/ si nécessaire)

RUN npm install \
  --workspace=@kabary/backend \
  --workspace=@kabary/shared \
  --include-workspace-root

EXPOSE 5000

CMD ["sh", "-c", "cd apps/backend && npx nodemon src/index.ts"]
```

### 2.2 Cibler la bonne plateforme Prisma (Alpine)

Dans `apps/backend/prisma/schema.prisma` :

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}
```

Sans cela, Prisma peut générer le mauvais binaire si `prisma generate` a déjà été exécuté sur macOS ou Windows.

### 2.3 Configurer nodemon pour Docker

Créer `apps/backend/nodemon.json` :

```json
{
  "watch": ["src"],
  "ext": "ts,json",
  "exec": "npx ts-node -r tsconfig-paths/register src/index.ts",
  "legacyWatch": true
}
```

> `legacyWatch: true` active le polling — **indispensable** car les événements filesystem des volumes montés ne se propagent pas toujours correctement dans Docker sur Linux/WSL.

### 2.4 Commande compose corrigée pour le backend

```yaml
command: >
  sh -c "
    cd apps/backend &&
    npx prisma generate &&
    npx prisma db push --skip-generate &&
    npx nodemon --config nodemon.json src/index.ts
  "
```

---

## 3. Dockerfile Frontend (`apps/web/Dockerfile`)

### 3.1 Version corrigée complète

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json turbo.json ./

COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src
COPY packages/ui/package.json ./packages/ui/
COPY packages/ui/src ./packages/ui/src

COPY apps/web/package.json ./apps/web/
COPY apps/web/tsconfig.json ./apps/web/
COPY apps/web/next.config.mjs ./apps/web/   # ← nom cohérent avec docker-compose
COPY apps/web/postcss.config.mjs ./apps/web/
COPY apps/web/eslint.config.mjs ./apps/web/
COPY apps/web/next-env.d.ts ./apps/web/
COPY apps/web/src ./apps/web/src
COPY apps/web/public ./apps/web/public

RUN npm install \
  --workspace=@kabary/web \
  --workspace=@kabary/shared \
  --workspace=@kabary/ui \
  --include-workspace-root

EXPOSE 3000

CMD ["sh", "-c", "cd apps/web && npx next dev --hostname 0.0.0.0"]
```

### 3.2 Incohérence `next.config.ts` vs `next.config.mjs`

Le Dockerfile copiait `next.config.ts` mais docker-compose montait `next.config.mjs`. Choisir **un seul nom** et l'utiliser partout.

---

## 4. `docker-compose.yml`

### 4.1 Ne pas monter `package.json` en volume

```yaml
# ❌ Problématique : écrase le package.json baked dans l'image
# sans relancer npm install → node_modules désynchronisés
- ./apps/web/package.json:/app/apps/web/package.json

# ✅ Supprimer ce volume mount
```

### 4.2 Service `web` corrigé

```yaml
web:
  build:
    context: .
    dockerfile: apps/web/Dockerfile
  container_name: kabary-web
  restart: unless-stopped
  ports:
    - "3000:3000"
  environment:
    NODE_ENV: development
    NEXT_PUBLIC_API_URL: /api           # ← relatif, fonctionne depuis n'importe quel appareil
    NEXT_PUBLIC_APP_NAME: Kabary Platform
  volumes:
    - ./apps/web/src:/app/apps/web/src
    - ./apps/web/public:/app/apps/web/public
    - ./apps/web/next.config.mjs:/app/apps/web/next.config.mjs
    # ❌ Supprimé : package.json
    - ./packages/shared/src:/app/packages/shared/src
    - ./packages/ui/src:/app/packages/ui/src
  depends_on:
    - backend
```

---

## 5. Accès depuis le réseau local (autres appareils)

### 5.1 Problème de l'IP hardcodée

```yaml
# ❌ IP codée en dur — casse si l'IP change ou sur un autre poste
NEXT_PUBLIC_API_URL: http://192.168.43.55:5000/api
```

`NEXT_PUBLIC_*` est **inliné au moment du build** par Next.js. Une URL absolue avec une IP de hotspot mobile sera embarquée dans le bundle JS et ne fonctionnera plus dès que l'IP change.

### 5.2 Solution : URL relative + Rewrite Next.js

**`docker-compose.yml`** :
```yaml
NEXT_PUBLIC_API_URL: /api
```

**`apps/web/next.config.mjs`** :
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:5000/api/:path*',
      },
    ]
  },
}

export default nextConfig
```

Ainsi, tous les appels API partent vers `<host>:3000/api/...` et Next.js les redirige en interne vers le backend — **transparent pour tout appareil du réseau local**.

### 5.3 Architecture réseau résultante

```
Appareil distant (téléphone, autre PC)
        │
        │ HTTP :3000
        ▼
[192.168.43.55]
  ┌──────────────────────────────────────┐
  │ Docker network interne               │
  │                                      │
  │  kabary-web:3000  ← sert le JS/HTML  │
  │       │ rewrite /api/*               │
  │       ▼                              │
  │  kabary-backend:5000                 │
  │       │                              │
  │       ▼                              │
  │  kabary-postgres:5432                │
  │  kabary-redis:6379                   │
  └──────────────────────────────────────┘
```

### 5.4 CORS côté backend Express

Sans CORS configuré, le navigateur de l'appareil distant bloquera toutes les requêtes.

```ts
// apps/backend/src/index.ts
import cors from 'cors'

app.use(cors({
  origin: [
    'http://localhost:3000',
    /^http:\/\/192\.168\.\d+\.\d+:3000$/,  // tout le sous-réseau 192.168.x.x
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))
```

### 5.5 URLs de test depuis un autre appareil

```bash
# Interface web complète
http://192.168.43.55:3000

# API via le proxy Next.js (recommandé)
GET    http://192.168.43.55:3000/api/users
POST   http://192.168.43.55:3000/api/users
PUT    http://192.168.43.55:3000/api/users/1
PATCH  http://192.168.43.55:3000/api/users/1
DELETE http://192.168.43.55:3000/api/users/1

# API directe pour debug uniquement
curl http://192.168.43.55:5000/api/health
```

---

## 6. Résumé des actions prioritaires

| Priorité | Problème | Action |
|----------|----------|--------|
| 🔴 Critique | `.env` embarqué dans l'image | Supprimer le `COPY .env` + ajouter au `.dockerignore` |
| 🔴 Critique | IP hardcodée dans `NEXT_PUBLIC_API_URL` | Passer à `/api` + ajouter `rewrites()` dans Next.js |
| 🟠 Important | CORS bloquant les appareils distants | Configurer `cors()` avec regex `192.168.*` |
| 🟠 Important | `package.json` monté en volume | Supprimer ce volume mount |
| 🟡 Moyen | Binaire Prisma incorrect sur Alpine | Ajouter `binaryTargets` dans `schema.prisma` |
| 🟡 Moyen | Hot-reload inactif dans Docker | Ajouter `legacyWatch: true` dans `nodemon.json` |
| 🟢 Mineur | Incohérence `next.config.ts` vs `.mjs` | Uniformiser le nom partout |