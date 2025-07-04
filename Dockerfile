# ⚒ Build the builder image
FROM node:18 AS builder

# 🤫 Silence npm
ENV NPM_CONFIG_LOGLEVEL=error

# 👇 Create working directory and assign ownership
WORKDIR /code

# 👇 Copy config files and source
COPY package*.json tsconfig.json ./
COPY prisma ./prisma/
COPY src ./src

# 👇 Install deps and build source
RUN npm ci

RUN npm run db:generate
RUN npm run build

FROM builder AS prodbuild
# 👇 Delete dev deps as they are no longer needed
RUN npm prune --production

# 🚀 Build the runner image
FROM node:18-slim AS runner

# Add openssl and tini
RUN apt -qy update && apt -qy install openssl tini

# Tini is now available at /sbin/tini
ENTRYPOINT ["/usr/bin/tini", "--"]

# 👇 Create working directory and assign ownership
WORKDIR /code

# 👇 Copy the built app from the prodbuild image
COPY --from=prodbuild /code ./

# ⚙️ Configure the default command
CMD ["npm", "run", "start:prod"]
