# Stage 1: Build
FROM node:20.15.0-alpine3.19 AS builder

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml into the container
COPY package.json pnpm-lock.yaml ./

# Install pnpm to install dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy the rest of the source code
COPY . .

# Generate the migrations
RUN pnpm run migration:initial
RUN pnpm run migration:run

# Build the project
RUN pnpm build

# Stage 2: Production
FROM node:20.15.0-alpine3.19 as production

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
