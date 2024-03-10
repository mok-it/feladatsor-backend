# ⚒ Build the builder image
FROM node:20-bullseye as builder

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

FROM builder as prodbuild
# 👇 Delete dev deps as they are no longer needed
RUN npm prune --production

# 🚀 Build the runner image
FROM node:20-bullseye-slim as runner

# Add openssl and tini
RUN apt-get -qy update && apt-get -qy install openssl tini

RUN apk --no-cache add ca-certificates wget
RUN wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub
RUN wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.30-r0/glibc-2.30-r0.apk
RUN apk add glibc-2.30-r0.apk

# Tini is now available at /sbin/tini
ENTRYPOINT ["/usr/bin/tini", "--"]

# 👇 Create working directory and assign ownership
WORKDIR /code

# 👇 Copy the built app from the prodbuild image
COPY --from=prodbuild /code ./

# ⚙️ Configure the default command
CMD ["npm", "run", "start:prod"]
