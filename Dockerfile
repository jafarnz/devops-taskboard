# ==============================================================================
# Dockerfile for DevOps Taskboard Application
# Multi-stage build with Jest & Playwright Testing
# ==============================================================================

# ==============================================================================
# Stage 1: Dependencies Stage
# ==============================================================================
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for testing)
RUN npm ci

# ==============================================================================
# Stage 2: Jest Unit Testing Stage
# ==============================================================================
FROM node:20-alpine AS test-unit

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy all source code for testing
COPY package*.json ./
COPY index.js ./
COPY utils/ ./utils/
COPY models/ ./models/
COPY public/ ./public/
COPY tests/ ./tests/
COPY jest.config.js ./

# Set environment for testing
ENV NODE_ENV=test

# Run Jest unit tests with coverage
RUN npm run test:coverage

# ==============================================================================
# Stage 3: Playwright E2E Testing Stage (separate image for CI)
# This stage is NOT part of the default build - used separately in CI
# ==============================================================================
FROM mcr.microsoft.com/playwright:v1.40.0-jammy AS test-e2e

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source
COPY index.js ./
COPY utils/ ./utils/
COPY models/ ./models/
COPY public/ ./public/
COPY e2e/ ./e2e/
COPY playwright.config.ts ./
COPY generate-coverage.js ./

# Set environment
ENV NODE_ENV=test
ENV CI=true

# Browsers are pre-installed in the playwright image
# Run Playwright tests (uncomment to run during build)
# RUN npx playwright test --reporter=list

# ==============================================================================
# Stage 4: Production Dependencies
# ==============================================================================
FROM node:20-alpine AS prod-dependencies

WORKDIR /app

COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# ==============================================================================
# Stage 5: Production Stage
# ==============================================================================
FROM node:20-alpine AS production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

WORKDIR /app

# Copy production dependencies
COPY --from=prod-dependencies /app/node_modules ./node_modules

# Copy application source code
COPY --chown=nodeuser:nodejs package*.json ./
COPY --chown=nodeuser:nodejs index.js ./
COPY --chown=nodeuser:nodejs logger.js ./
COPY --chown=nodeuser:nodejs utils/ ./utils/
COPY --chown=nodeuser:nodejs models/ ./models/
COPY --chown=nodeuser:nodejs public/ ./public/

# Switch to non-root user
USER nodeuser

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/tasks || exit 1

# Start the application
CMD ["node", "index.js"]
