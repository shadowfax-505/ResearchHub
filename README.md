# ResearchHub

A research discovery and academic networking platform backed by Oracle
Database. Researchers publish and search papers, follow authors, track
citations, build collections, ask and answer questions, request full texts,
post jobs and projects, and message each other. Moderators get an admin
dashboard, reports and analytics.

## Verified improvement

The reading-room redesign is paired with real Oracle persistence and explicit ownership checks. The current verification record is [docs/VERIFICATION_2026-10-11.md](docs/VERIFICATION_2026-10-11.md). It distinguishes tested workflows from deployment and email prerequisites. Screenshots use seeded development records; they are not adoption or scholarly-impact claims.

## Stack

| Layer | Technology |
|---|---|
| Database | Oracle Database (23ai Free / 21c XE) — schema, migrations, PL/SQL packages and triggers |
| API | Node.js, Express, `oracledb`, JWT auth |
| Web | Next.js 15, React 19, Tailwind CSS |
| Tests | Jest (API), Playwright (web) |

## Repository layout

```
api/            Express REST API (routes, controllers, models, scripts, tests)
web/            Next.js front end
database/
  schema.sql    base schema (tables, indexes, views)
  migrations/   dated incremental migrations
  seeds/        sample data
docs/           API reference, setup and deployment guides, project report
```

## Getting started

Use Node.js 22.12 or later. Follow [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) to create a dedicated Oracle user and configure private credentials. The verified local path runs the API and web on the host against Oracle Free 23; all commands below run from the repository root.

```sh
npm run install:all
cp api/.env.example api/.env
# Edit api/.env: DB_* values, a unique JWT_SECRET (at least 32 characters),
# APP_URL and CORS_ORIGINS. Leave SMTP_HOST unset for local QA.
npm --prefix api run migrate
# Optional for browsing; required for the seeded-paper browser checks:
npm --prefix api run seed
npm --prefix web run build
```

Start `npm --prefix api start` in one terminal and `npm --prefix web start` in another. Open `http://localhost:3001`; the API listens at `http://localhost:3000`. For development, use separate terminals with `npm run dev` and `npm run dev:web` instead.

The web reads `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:3000`). Change it in private `web/.env.local` before building when using another API origin. Use no secrets in browser environment variables.

Migrate with the npm runner instead of replaying `database/schema.sql` over existing data. Seeds are fictional development records; register your own account to browse. For the optional additional demo network, see [api/DEMO_ACCOUNTS.md](api/DEMO_ACCOUNTS.md). Keep private `.env` files out of source delivery.

Compose configuration was parsed, but new container images and the all-container startup were not exercised. It is not the verified setup path. A public Oracle-backed app deployment and SMTP inbox delivery remain follow-through; see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Tests

Use the same isolated `RH_QA_*` Oracle schema in `api/.env` and the running API. Leave SMTP unset and seed the fresh schema before browser checks. Google Chrome is the configured browser. Start the production web build first so Playwright reuses it rather than starting a development server.

```sh
npm test                         # API unit tests, no database required
npm --prefix api run test:integration  # Requires isolated RH_QA_* Oracle schema
npm run test:web:e2e              # API + production web running, isolated RH_QA_* schema
npm --prefix api audit --omit=dev
npm --prefix web audit --omit=dev
```

## API

All endpoints live under `/api/v1` — users, papers, authors, journals, fields,
keywords, citations, reviews, collections, saved papers, questions, research
requests, researchers, network, messages, feed, jobs, projects, notifications,
settings, search, analytics, reports and admin. `GET /health` reports server
status.

Full reference: [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md).

## Documentation

- [Setup guide](docs/SETUP_GUIDE.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Project report](docs/ResearchHub_Project_Report.md)
