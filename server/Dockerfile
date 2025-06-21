# Dockerfile

FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --force

# Copy Prisma schema and other source files
COPY prisma ./prisma
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the NestJS app
RUN pnpm build

# Start the app
CMD ["node", "dist/main"]
