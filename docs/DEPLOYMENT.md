# ResearchHub deployment handoff

The redesigned app was verified locally with a production Next.js build and a real Oracle Free 23 database. A hosted Oracle-backed app has not been deployed. The public portfolio is a static case study, not an API host or live ResearchHub service. Exact checks are in [VERIFICATION_2026-10-11.md](VERIFICATION_2026-10-11.md).

For the directly verified local setup, follow [SETUP_GUIDE.md](SETUP_GUIDE.md). It covers the dedicated schema, private configuration, migration runner and both servers.

## Prepare a hosted environment

Use Node.js 22.12 or later. Provide a persistent, reachable Oracle database and a dedicated application user with the schema privileges described in the setup guide. Keep production credentials outside Git and source archives.

Configure the API using `api/.env.example` as the variable reference:

- `DB_USER`, `DB_PASSWORD`, `DB_CONNECT_STRING` and `DB_SCHEMA` for the intended application schema.
- A unique, stable `JWT_SECRET` with at least 32 characters; production startup rejects a missing or undersized secret.
- `NODE_ENV=production`, `API_PORT`, and the public API `API_URL`.
- The web origin in `APP_URL` and the allowed browser origins in `CORS_ORIGINS`.
- SMTP credentials and sender configuration if inbox delivery is required. Without SMTP, email requests queue; delivery has not been tested.

Set `NEXT_PUBLIC_API_BASE_URL` to the public API origin in the web build environment. It is embedded in browser code, so use no secret values there. Configure HTTPS, durable storage for `api/storage/uploads`, database/file backups, and process supervision appropriate to the host.

## Build and start

Run from the repository root, after the private environment and database user are configured:

```sh
npm run install:all
npm --prefix api run migrate
npm --prefix web run build
```

Do not seed fictional development accounts in a public production environment. Do not replay the raw base schema over existing data. The migration runner preserves existing tables, tracks applied files and checks stored-program compilation; take the intended database backup before a production migration.

Start the services under the host's process supervisor, equivalent to these two separate foreground commands:

```sh
npm --prefix api start
```

```sh
npm --prefix web start
```

The API defaults to port 3000; the web start script uses port 3001. Route the public HTTPS origins to those services and ensure the database remains reachable from the API.

## Acceptance after hosting

Check `/health`, registration/sign-in, publication reads, a private draft, a real PDF upload/download, save/reload, project persistence and privacy across two separate accounts. Verify SMTP inbox delivery separately. Run write-based automated suites only in a dedicated `RH_QA_*` environment with outbound test email disabled, following the setup guide.

The local record includes 65 live Oracle integration tests, 27 API unit tests, 8 browser journeys and production dependency audits with zero known vulnerabilities at the time checked. Those results do not establish hosted behavior, production capacity or literal 100% correctness.

## Docker status

`docker-compose.yml` uses the separate project name `researchhub-development`, loopback ports, a health-checked Oracle service, and distinct database/upload volumes. Its configuration was parsed, but new images and a full container startup were not exercised. Treat it as an unverified development option rather than a verified production deployment path. In particular, pass private environment values explicitly; `.env` files are excluded from Docker build contexts. Existing unrelated database volumes were preserved.
