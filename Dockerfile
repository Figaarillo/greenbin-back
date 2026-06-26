# Stage 1: Build
FROM node:22-slim AS builder

WORKDIR /usr/src/app

RUN npm install -g pnpm@11

COPY --chown=node:node package.json pnpm-lock.yaml ./

RUN pnpm install

COPY --chown=node:node . .

RUN chown -R node:node /usr/src/app && chmod -R +x .

USER node

RUN pnpm build

# Stage 2: Production
FROM node:22-slim AS production

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY --chown=node:node --from=builder /usr/src/app/package.json \
  /usr/src/app/pnpm-lock.yaml \
  /usr/src/app/tsconfig.json ./
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist

RUN npm install -g pnpm@11 && pnpm install --prod

EXPOSE 8080

CMD ["node", "dist/main.js"]
