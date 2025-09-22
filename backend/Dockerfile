# Multi-stage build for optimized production image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Create database directory
RUN mkdir -p database

# Production stage
FROM node:18-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code from builder stage
COPY --from=builder --chown=nodejs:nodejs /app .

# Create database directory with proper permissions
RUN mkdir -p database && chown nodejs:nodejs database

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["npm", "start"]
