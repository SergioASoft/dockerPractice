# ── Stage 1: dependencias ────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

# ── Stage 2: imagen final ────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Copiar solo lo necesario del stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY src/ ./src/
COPY package.json ./

EXPOSE 3000
CMD ["node", "src/index.js"]