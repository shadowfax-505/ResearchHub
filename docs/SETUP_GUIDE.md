# ResearchHub local setup

Run shell commands from the repository root. This is the host-run path used for verification: Node API and Next.js web, connected to a dedicated Oracle schema. See [the verification record](VERIFICATION_2026-10-11.md) for measured results and limits.

## Prerequisites

- Node.js 22.12 or later and npm.
- A reachable Oracle Database Free 23 instance. Verification used Oracle Free 23 Slim; other editions were not independently exercised.
- An Oracle administrator able to create a separate application user in the intended pluggable database.
- Google Chrome for the configured Playwright browser journeys.

## 1. Prepare a dedicated database user

For local reproduction, use a fresh schema such as `RH_QA_LOCAL`. Integration and browser tests require the `RH_QA_` prefix and write records in that schema. Keep it separate from existing application data.

Connect as an administrator to the intended PDB, for example `FREEPDB1`, and replace the password placeholder before running:

```sql
CREATE USER RH_QA_LOCAL IDENTIFIED BY "replace-with-a-unique-database-password";
GRANT CREATE SESSION, CREATE TABLE, CREATE VIEW, CREATE SEQUENCE,
      CREATE TRIGGER, CREATE PROCEDURE TO RH_QA_LOCAL;
ALTER USER RH_QA_LOCAL QUOTA UNLIMITED ON USERS;
```

If Oracle Text is installed, have the administrator grant `CTXAPP` to this user for the optional text indexes. The verified Slim configuration uses the application's substring search path.

## 2. Install and configure

```sh
npm run install:all
cp api/.env.example api/.env
```

Edit the private, gitignored `api/.env`:

```dotenv
DB_USER=RH_QA_LOCAL
DB_PASSWORD=your-unique-database-password
DB_CONNECT_STRING=127.0.0.1:1521/FREEPDB1
DB_SCHEMA=RH_QA_LOCAL
JWT_SECRET=your-unique-random-secret-of-at-least-32-characters
NODE_ENV=development
API_PORT=3000
API_URL=http://localhost:3000
APP_URL=http://localhost:3001
CORS_ORIGINS=http://localhost:3001,http://127.0.0.1:3001
```

Use your actual listener port and service name. Set a stable, private JWT secret; the placeholder is not a secret. Leave `SMTP_HOST` unset for local QA. Email requests then queue without inbox delivery.

The web defaults to `http://localhost:3000`. To change it, create private `web/.env.local` containing `NEXT_PUBLIC_API_BASE_URL=https://your-api-origin` before building. This is public browser configuration and must contain no credentials.

## 3. Migrate and run

```sh
npm --prefix api run migrate
# Optional for browsing; required for the seeded-paper browser tests below:
npm --prefix api run seed
npm --prefix web run build
```

The migration runner creates the base schema only when empty, records applied migrations and stops on incomplete schemas or stored-program compilation errors. Use this runner instead of replaying `database/schema.sql` on existing data.

Start the API in one terminal:

```sh
npm --prefix api start
```

Start the production web build in another terminal:

```sh
npm --prefix web start
```

Open `http://localhost:3001`; API health is at `http://localhost:3000/health`. `npm run dev` and `npm run dev:web` are the separate API/web development commands. Stop foreground servers with Ctrl+C.

Seed papers and accounts are fictional development data. Create your own account through registration to browse the app. An optional additional demo-network seed and its account details are documented in [api/DEMO_ACCOUNTS.md](../api/DEMO_ACCOUNTS.md). Do not load development seeds into a public production database.

## 4. Reproduce checks

Keep Oracle and both servers running against the same isolated `RH_QA_*` schema, with SMTP unset. Seed the fresh schema before browser tests so expected search papers exist. Start the production web server first; Playwright reuses it, otherwise its configuration starts a development server.

```sh
npm --prefix api test -- --runInBand
npm --prefix api run test:integration
npm --prefix web run test:e2e
npm --prefix api audit --omit=dev
npm --prefix web audit --omit=dev
```

The recorded run passed 65 Oracle integration tests, 27 API unit tests and 8 desktop/mobile browser journeys. Production builds passed. Full lint still reports legacy warnings; it is not recorded as clean.

## Docker status

The repository's Compose configuration parsed successfully. New Docker images and the all-container startup path were not built or verified during this work. Use the host-run instructions above to reproduce the tested setup. The Compose project is separately named `researchhub-development`; existing user database volumes were preserved.

## Connection troubleshooting

- `ORA-01017`: match the configured user and password to the selected PDB.
- `NJS-511` or listener errors: check the host, mapped port and service name in `DB_CONNECT_STRING`.
- Missing tables or migration failure: confirm this is the intended schema and inspect the reported migration; do not reset an existing database.
- Browser API/CORS errors: match the web's API origin, API `APP_URL`/`CORS_ORIGINS`, and actual browser origin; rebuild after changing web environment values.
- Occupied ports: stop the conflicting server or configure a different API port and matching web API URL.
