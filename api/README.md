# ResearchHub API

This is the backend API for ResearchHub.

## Quick Start

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Start the API:

```bash
npm run dev
```

## Available Scripts

- `npm start` - start the server in production mode
- `npm run dev` - start the server with nodemon
- `npm run lint` - run ESLint
- `npm test` - run Jest tests
- `npm run migrate` - apply SQL migrations from `../database/migrations`
- `npm run seed` - apply sample seed data from `../database/seeds/seed-data.sql`
- `npm run backup` - run the backup script

## Environment Variables

See `.env.example` for required settings.

## Deployment

Use Docker or a cloud provider of your choice. The project includes a top-level `Dockerfile` and `docker-compose.yml` for local containerized development.
