FROM node:22-bookworm-slim AS builder
WORKDIR /app

# bcrypt has native bindings that need to be compiled at install time.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# .npmrc (legacy-peer-deps=true) must be present before npm ci, or install
# fails on the @nestjs/schematics vs ts-jest TypeScript peer conflict.
COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Same base image as the builder stage (glibc) so bcrypt's compiled native
# binding is compatible — do not switch this stage to an alpine/musl image.
COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# src/ + tsconfig.json are also copied (not just dist/) so `npm run seed`
# (ts-node src/database/seed.ts) works the same way it does locally.
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 3000
CMD ["node", "dist/main.js"]
