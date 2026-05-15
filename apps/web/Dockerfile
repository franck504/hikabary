FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de configuration du monorepo
COPY package.json package-lock.json turbo.json ./

# Copier les packages partagés
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src
COPY packages/ui/package.json ./packages/ui/
COPY packages/ui/src ./packages/ui/src

# Copier le frontend
COPY apps/web/package.json ./apps/web/
COPY apps/web/tsconfig.json ./apps/web/
COPY apps/web/next.config.mjs ./apps/web/
COPY apps/web/postcss.config.mjs ./apps/web/
COPY apps/web/eslint.config.mjs ./apps/web/
COPY apps/web/next-env.d.ts ./apps/web/
COPY apps/web/src ./apps/web/src
COPY apps/web/public ./apps/web/public

# Installer les dépendances
RUN npm install --workspace=@kabary/web --workspace=@kabary/shared --workspace=@kabary/ui --include-workspace-root

EXPOSE 3000

CMD ["sh", "-c", "cd apps/web && npx next dev --hostname 0.0.0.0"]
