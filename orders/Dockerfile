FROM node:23-alpine AS builder

WORKDIR /marketplace

# Add Alpine build dependencies
RUN apk add --no-cache python3 make g++

# Install pnpm
RUN npm install -g pnpm

# Copy only lockfile and package info first (better layer caching)
COPY package.json pnpm-lock.yaml ./

# Install all dependencies
RUN pnpm install

# Copy source
COPY . .

# Build
RUN pnpm run build

# Production stage
FROM node:23-alpine

ENV NODE_ENV production
ENV PORT 8000

WORKDIR /marketplace

# Install pnpm
RUN npm install -g pnpm

# Copy only needed files from builder
COPY --from=builder /marketplace/dist ./dist
COPY --from=builder /marketplace/package.json ./package.json
COPY --from=builder /marketplace/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /marketplace/drizzle ./drizzle
COPY --from=builder /marketplace/entrypoint.sh ./entrypoint.sh

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile \
  && pnpm store prune \
  && rm -rf ~/.cache ~/.npm

# Make the entrypoint script executable
RUN chmod +x ./entrypoint.sh

EXPOSE 8000

# Use the entrypoint script to run migrations and start the app
ENTRYPOINT ["./entrypoint.sh"]