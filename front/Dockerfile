# ── Stage 1: build de la app React ──────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# ── Stage 2: imagen final con Nginx ─────────────────────
FROM nginx:1.25-alpine AS runner

# Eliminar config default de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar nuestra config de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar el build de React al directorio que sirve Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]