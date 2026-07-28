# --- Build stage -----------------------------------------------------------
FROM node:20-bookworm-slim AS build
WORKDIR /app

# Coolify injecte souvent NODE_ENV=production au build : il faut vite/tsc (devDependencies).
ENV NODE_ENV=development
ENV NPM_CONFIG_PRODUCTION=false

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --include=dev

COPY tsconfig.json tsconfig.server.json vite.config.ts postcss.config.js tailwind.config.js ./
COPY src ./src

RUN npx prisma generate
RUN npm run build

# --- Runtime stage ---------------------------------------------------------
FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production

# openssl: moteur Prisma | wget: HEALTHCHECK Coolify
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl wget ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate

COPY --from=build /app/dist ./dist

EXPOSE 3000

# La vitrine reste disponible même pendant une indisponibilité temporaire de la base.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/api/live || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy || echo 'Database migration deferred'; exec node dist/server/index.js"]
