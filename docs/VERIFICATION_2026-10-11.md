# ResearchHub verified improvement — 11 October 2026

The application was exercised locally against Oracle Free 23 in a fresh, isolated `RH_QA_20261011` schema. This is a verified development build; the portfolio is a static showcase, not a public deployment of the Oracle backend.

## Results

| Check | Result |
|---|---|
| Real Oracle integration | 65 tests passed, 3 suites |
| API unit checks | 27 tests passed, 5 suites |
| Desktop and mobile browser journeys | 8 Playwright tests passed |
| WCAG A/AA automated checks | No Axe violations on loaded landing, login, feed and search, desktop and mobile |
| Web production build | Passed on Node 24.19.0 / Next.js 15.5.27 |
| API and web production dependency audits | Zero known vulnerabilities reported by npm audit |
| Responsive layouts | 24 checks passed across eight routes at 360, 768 and 1440 pixels; zero overflow or page errors |
| Compose configuration | Parsed successfully; new container builds not exercised |

Integration scenarios verify registration, duplicate identities and rollback, current account status/roles, private draft ownership, PDF byte round trips, save/move isolation and counts, unique recommendations/votes, answer acceptance, follows, message consent/blocking/privacy, recipient-controlled requests, project progress and status, interest deduplication, feed cursors/dismissal, private profile editing, profile records, notification ownership, jobs, review changes/visibility, citations, moderation and audit triggers, password reset and session revocation. Endpoint compatibility checks exercise 34 live reads. No test silently passes when Oracle is unavailable.

Browser journeys use real API calls and the real database. They cover sign-in, loaded search, saving and reading the library after reload, downloading real JSON, a publication wizard with a real PDF upload and byte-identical download, and persistent project progress/completion. Test accounts and their records are scoped to the isolated QA schema and cleaned up.

## Changes

The frontend now uses an original reading-room design, local Manrope/Instrument Serif fonts, responsive navigation, a publication reader, visible loading/error/empty states, functional save/cite/report controls and a project notebook. Simulated analytics, placeholder PDF content and unrelated demonstration widgets were removed from primary routes. Screenshots in `verification/` show seeded development records, not real users or research impact.

The backend no longer authenticates offline demo accounts or fabricates successful writes after database errors. It uses explicit ownership, current database authorization, transactional writes, private-data filters and safe migration history. Migration reruns preserve data; partial schemas and PL/SQL compilation errors fail visibly.

## Reproduce

Install Node 22.12+ and dependencies with `npm run install:all`. Configure `api/.env` for an isolated database user whose name starts `RH_QA_`; leave `SMTP_HOST` unset for tests. Run `npm --prefix api run migrate`, then optionally `npm --prefix api run seed` for development records. Run API and web at ports 3000 and 3001. Use a production web build for the browser checks.

```sh
npm --prefix api test -- --runInBand
npm --prefix api run test:integration
npm --prefix web run build
npm --prefix web start
# In another terminal, while the API is also running:
npm --prefix web run test:e2e
npm --prefix api audit --omit=dev
npm --prefix web audit --omit=dev
```

## Deployment prerequisites and limits

This evidence does not establish literal 100% correctness, production load capacity, independent security review or universal accessibility. Production needs a reachable persistent Oracle database, private credentials, HTTPS/CORS configuration, durable file storage and backups, and configured SMTP delivery. Email was verified as queued without SMTP; inbox delivery was not tested. Existing public hosting was not configured for this app. The published portfolio will link to the source and review branch rather than pretend a local server is a public demo.

Full lint emits pre-existing unused-code, hook and image warnings; build succeeds. New Docker definitions fix schema initialization and missing database files but were only configuration-validated. Optional legacy source components remain outside the verified primary flows; they are not evidence of completed product features.

An existing unrelated `project_db_data` volume failed Oracle integrity checks and was preserved. Verification used a separate task-owned fresh volume. No production database was reset, repaired or deleted.
