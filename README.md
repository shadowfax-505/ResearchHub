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

### 1. Database

Start the development Oracle service. The API migration runner applies the schema; seeding is explicit:

```bash
docker compose up -d db
```

For an existing instance, create the application user, set `api/.env`, and use `npm --prefix api run migrate`. The low-level initial schema can also be applied with SQL*Plus; do not reapply it to a populated schema:

```bash
sqlplus researchhub_user/<password>@localhost:1521/XEPDB1 @database/schema.sql
sqlplus researchhub_user/<password>@localhost:1521/XEPDB1 @database/seeds/seed-data.sql
```

See [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) for creating the database user.

### 2. Configure

```bash
cp api/.env.example api/.env   # set DB_* values and JWT_SECRET
```

### 3. Install and run

```bash
npm run install:all
npm --prefix api run migrate
# Optional, local development sample records only:
npm --prefix api run seed
npm run dev        # API on http://localhost:3000
npm run dev:web    # web on http://localhost:3001
```

The web app reads the API address from `NEXT_PUBLIC_API_BASE_URL`
(default `http://localhost:3000`).

For a populated demo network run `npm run seed:demo-network` in `api/`;
the accounts are listed in [api/DEMO_ACCOUNTS.md](api/DEMO_ACCOUNTS.md).

## Tests

```bash
npm test                         # API unit tests, no database required
npm --prefix api run test:integration  # Requires isolated RH_QA_* Oracle schema
npm run test:web:e2e              # API + production web running, isolated RH_QA_* schema
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
