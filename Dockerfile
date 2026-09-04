# ========================================================
# CivicFix - Production Multi-Stage Dockerfile
# Optimized for high security, minimal attack surface, and fast startup
# ========================================================

# Stage 1: Build Frontend and Application Bundle
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build assets
COPY . .
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root system user for container security hardening
RUN addgroup -g 1001 -S civicfix && \
    adduser -S -u 1001 -G civicfix civicfix

# Copy compiled production artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Set file permissions
RUN chown -R civicfix:civicfix /app

USER civicfix

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["npm", "start"]
