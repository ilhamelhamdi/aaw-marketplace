FROM node:23 AS builder

WORKDIR /marketplace

COPY package.json ./

# Install pnpm
RUN npm install -g pnpm typescript

# Install dependencies
RUN pnpm install

# Copy source
COPY . .

# Build
RUN pnpm run build

# Production image
FROM node:23-alpine

ENV PORT 8000
ENV NODE_ENV production

WORKDIR /marketplace

COPY --from=builder /marketplace/dist ./dist
COPY --from=builder /marketplace/package.json ./package.json
COPY --from=builder /marketplace/drizzle ./drizzle 
COPY --from=builder /marketplace/entrypoint.sh ./entrypoint.sh

RUN npm install -g pnpm
RUN pnpm install --prod

# Make the entrypoint script executable
RUN chmod +x ./entrypoint.sh

EXPOSE 8000

# Use the entrypoint script to run migrations and start the app
ENTRYPOINT ["./entrypoint.sh"]