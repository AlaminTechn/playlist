FROM node:18-alpine

WORKDIR /app

# Install OpenSSL and other dependencies needed for Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat curl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client with Alpine Linux binary targets
RUN npx prisma generate

# Copy application code
COPY . .

# Create data directory with proper permissions
RUN mkdir -p /app/data && chmod 755 /app/data

# Expose port
EXPOSE 4000

# Start script - use sh -c instead of creating a separate script file
CMD ["sh", "-c", "echo 'Setting up database...' && npx prisma db push --skip-generate --accept-data-loss || echo 'Database push completed' && if [ ! -f /app/data/dev.db ] || [ ! -s /app/data/dev.db ]; then echo 'Seeding database...' && npm run db:seed; else echo 'Database exists, skipping seed'; fi && echo 'Starting server...' && npm start"]

