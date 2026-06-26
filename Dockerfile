# Stage 1: Build
FROM node:22-slim AS builder

WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm@11

COPY --chown=node:node package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

COPY --chown=node:node . .

RUN chown -R node:node /usr/src/app && chmod -R +x .

USER node

RUN pnpm build

# Stage 2: Production
FROM node:22-slim AS production

ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copy only the necessary files from the builder stage
COPY --chown=node:node --from=builder /usr/src/app/package.json \
  /usr/src/app/pnpm-lock.yaml \
  /usr/src/app/tsconfig.json ./
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist

# Install pnpm globally and install production dependencies
RUN npm install -g pnpm@11 && pnpm install --prod

EXPOSE 8080

CMD ["node", "dist/main.js"]
