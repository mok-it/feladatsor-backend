
## Description

This is the backend repository for the <a href="https://medvematek.hu/">Medve Matek</a> voluntary organization.
It is responsible for managing exercises.

## Deployments

### Development

A development version is automatically built and deployed from the main and is available at the following url: 

https://be-feladatsor-dev-1029503388169.europe-west3.run.app

### Production

When a new version tag is created a corresponding image is built and publised to Dockerhub. From there it's manually deployed to Google Cloud Run. 
This version is available at the following url:

https://be-feladatsor-prod-1029503388169.europe-west3.run.app

## Backend paths

For the majority of the functionality the backend uses Graphql as a commincation layer, and that is awailable at `/graphql` url for any deployment.
For example: https://be-feladatsor-dev-1029503388169.europe-west3.run.app/graphql for the **DEV** environment.

However the image upload functionality, and loading the old Excel file the backend provides two regular REST routes.

{/image/{:id}}: Retrieving images \
{/image/upload, POST}: Uploading images \
{/health}: Health check \
{/load-old-excel/load, POST}: Loading the old excel file


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

## Apollo Studio

Apollo Studio is the perfect tool to run queries and migrations against the database.

It starts to run when you start the backend. It runs on `http://localhost:3000/graphql`, or whatever port you specified in the `.env` file. When running the backend, the url should also displayed in the console, e.g. `Graphql running on http://localhost:3000/graphql`