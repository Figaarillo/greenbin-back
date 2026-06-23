# Stage 1: Build
FROM node:20.15.0-alpine3.19 AS builder

# Set the working directory
WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm@11

# Copy package.json and pnpm-lock.yaml into the container
COPY --chown=node:node package.json pnpm-lock.yaml ./

# Cache pnpm store for faster rebuilds
RUN --mount=type=cache,target=/root/.pnpm-store pnpm install

# Copy the rest of the source code
COPY --chown=node:node . .

# Set executable permissions
RUN chown -R node:node /usr/src/app && chmod -R +x .

# Set the user
USER node

# Build the project
RUN pnpm build

# Stage 2: Production
FROM node:20.16-slim AS production

# Set environment
ENV NODE_ENV=production

# Set the working directory
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
