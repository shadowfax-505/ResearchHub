# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY api/package.json api/package-lock.json ./
RUN npm ci --only=production

# Copy application source code
COPY api ./api

# Copy environment example
COPY .env.example ./

# Expose port
EXPOSE 3000

# Start API
WORKDIR /app/api
CMD ["node", "server.js"]
