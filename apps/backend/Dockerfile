FROM node:20-alpine

# OpenSSL requis par Prisma sur Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Copier les fichiers de configuration du monorepo
COPY package.json package-lock.json turbo.json ./

# Copier les packages partagés
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src

# Copier le backend
COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/tsconfig.json ./apps/backend/
COPY apps/backend/nodemon.json ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma
COPY apps/backend/prisma.config.ts ./apps/backend/prisma.config.ts
COPY apps/backend/src ./apps/backend/src

# Installer les dépendances
RUN npm install --workspace=@kabary/backend --workspace=@kabary/shared --include-workspace-root

EXPOSE 5000

CMD ["sh", "-c", "cd apps/backend && npx nodemon src/index.ts"]
