# ==============================================================================
# Multi-Stage Production Dockerfile for AR Lab Platform
# ==============================================================================

FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy application source code
COPY . .

# Generate 3D assets and build client and server
RUN npm run generate:models && npm run build

# Runner stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy package manifests and production dependencies
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Copy built artifacts and static models
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/server/db/seed.ts ./src/server/db/seed.ts

# Ensure data directory exists with volume mounting
RUN mkdir -p /app/data
VOLUME ["/app/data"]

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

CMD ["npm", "start"]
