## Description

This is the backend repository for the <a href="https://medvematek.hu/">Medve Matek</a> voluntary organization.
It is responsible for managing exercises.

## Architecture

The backend uses Nest JS, Prisma, and GraphQL

## Initialization

First of all, duplicate the `.env.example` file to a `.env` file.

For running the app you will need to have a Postgre database running.

You can do this with docker

```bash
docker compose -f docker-compose.db.yml up
```

This will start a postgresql db

## Installation

```bash
npm install
```

Migrate the DB schema

```bash
npm run db:migrate:dev
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
