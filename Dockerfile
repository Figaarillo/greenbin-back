# Stage 1: Build
FROM node:20.15.0-alpine3.19 AS builder

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml into the container
COPY --chown=node:node package.json pnpm-lock.yaml ./

# Run pnpm to install all dependencies (including dev dependencies)
RUN npm install -g pnpm && pnpm install

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
COPY --chown=node:node --from=builder /usr/src/app/.env \
  /usr/src/app/package.json \
  /usr/src/app/pnpm-lock.yaml \
  /usr/src/app/tsconfig.json ./
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist

# Install only production dependencies
RUN npm install -g pnpm && pnpm install --prod

EXPOSE 8080

CMD ["node", "dist/main.js"]
