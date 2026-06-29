# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Generate Prisma client
RUN npx prisma generate

# ---- Runtime stage ----
FROM node:20-alpine
WORKDIR /app

# Chỉ copy những gì cần thiết
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

CMD ["npm", "run", "start"]
