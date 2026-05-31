# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace manifests first (layer cache)
COPY package*.json ./
COPY packages/player/package.json ./packages/player/

RUN npm install

# Copy sources
COPY . .

# PUBLIC_ vars are baked into the static build by SvelteKit ($env/static/public)
ARG PUBLIC_DISTRIBUTION_URL=http://localhost:8082
ARG PUBLIC_API_KEY=pk_dev

ENV PUBLIC_DISTRIBUTION_URL=$PUBLIC_DISTRIBUTION_URL
ENV PUBLIC_API_KEY=$PUBLIC_API_KEY

RUN npm run build

# ── Serve stage ─────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
