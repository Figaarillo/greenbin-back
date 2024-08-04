# Stage 1: Build
FROM node:20.15.0-alpine3.19 AS builder

# Set the working directory
WORKDIR /usr/app

# Copy package.json and pnpm-lock.yaml into the container
COPY --chown=node:node package.json ./
COPY --chown=node:node pnpm-lock.yaml ./

# Install pnpm to install dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy the rest of the source code
COPY --chown=node:node . .

# Set the user
USER node

# Generate the migrations
RUN pnpm run migration:create
RUN pnpm run migration:up

# Build the project
RUN pnpm build

# Stage 2: Production
FROM node:20.16-slim as production

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml into the container
COPY package.json pnpm-lock.yaml ./

# Install pnpm to install production dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy the built code and necessary files from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/migrations ./migrations
COPY --from=builder /usr/src/app/.env ./

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "dist/main.js"]
