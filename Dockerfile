# ⚒ Build the builder image
FROM node:18-alpine AS builder

# 🤫 Silence npm
ENV NPM_CONFIG_LOGLEVEL=error

# 👇 Create working directory and assign ownership
WORKDIR /code

# 👇 Copy package files first for better layer caching
COPY package*.json tsconfig.json tsconfig.build.json nest-cli.json ./
COPY prisma ./prisma/

# 👇 Install deps
RUN npm ci

# 👇 Generate Prisma client
RUN npm run db:generate

# 👇 Copy source and build
COPY src ./src
RUN npm run build

FROM builder AS prodbuild
# 👇 Delete dev deps as they are no longer needed
RUN npm prune --production

# 🚀 Build the runner image
FROM node:18-alpine AS runner

# Add openssl and tini
RUN apk add --no-cache openssl tini

# Tini is now available at /sbin/tini
ENTRYPOINT ["/sbin/tini", "--"]

# 👇 Create working directory and assign ownership
WORKDIR /code

# 👇 Copy only what's needed for production
COPY --from=prodbuild /code/dist ./dist
COPY --from=prodbuild /code/node_modules ./node_modules
COPY --from=prodbuild /code/package.json ./
COPY --from=prodbuild /code/prisma ./prisma

# ⚙️ Configure the default command
CMD ["node", "dist/main"]
