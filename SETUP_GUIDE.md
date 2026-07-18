# ResearchHub Development Environment Setup Guide

## Overview
This guide sets up ResearchHub with Oracle Database and the Express API.

## Prerequisites
- Node.js 16+ and npm
- Oracle Database 21c XE, Oracle Database Free 23ai, or the Docker service from this project
- SQL*Plus or SQLcl for manual database setup
- Git

## Fastest Setup With Docker
From `ResearchHub/project`:

```bash
docker-compose up --build
```

The API runs on `http://localhost:3000` and Oracle listens on `localhost:1521`.

## Local Oracle Setup
Create the application user from a privileged Oracle account:

```sql
CREATE USER researchhub_user IDENTIFIED BY researchhub_secure_password;
GRANT CONNECT, RESOURCE, CTXAPP TO researchhub_user;
GRANT CREATE VIEW, CREATE SEQUENCE, CREATE TRIGGER, CREATE PROCEDURE TO researchhub_user;
ALTER USER researchhub_user QUOTA UNLIMITED ON USERS;
```

Apply the schema and seed data:

```bash
cd "/Users/muttakinrahman/Database Project/ResearchHub"
sqlplus researchhub_user/researchhub_secure_password@localhost:1521/XEPDB1 @02_CREATE_TABLES.sql
sqlplus researchhub_user/researchhub_secure_password@localhost:1521/XEPDB1 @project/database/seeds/seed-data.sql
```

Verify tables:

```sql
SELECT table_name FROM user_tables ORDER BY table_name;
SELECT COUNT(*) AS table_count FROM user_tables;
```

## API Setup
Install dependencies and start the server:

```bash
cd "/Users/muttakinrahman/Database Project/ResearchHub/project/api"
npm install
npm run dev
```

Use these database environment values:

```env
DB_USER=researchhub_user
DB_PASSWORD=researchhub_secure_password
DB_CONNECT_STRING=localhost:1521/XEPDB1
DB_SCHEMA=RESEARCHHUB_USER
NODE_ENV=development
API_PORT=3000
```

Health checks:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/v1
```

## Database Scripts
Run schema and seed scripts through npm:

```bash
cd "/Users/muttakinrahman/Database Project/ResearchHub/project/api"
npm run migrate
npm run seed
```

## Project Structure

```text
ResearchHub/
├── 02_CREATE_TABLES.sql
├── project/
│   ├── .env.example
│   ├── docker-compose.yml
│   ├── database/
│   │   └── seeds/
│   └── api/
│       ├── server.js
│       ├── scripts/
│       ├── src/
│       │   ├── config/
│       │   ├── controllers/
│       │   ├── models/
│       │   ├── routes/
│       │   └── middleware/
│       └── tests/
```

## Troubleshooting
- `ORA-01017`: verify `DB_USER` and `DB_PASSWORD`.
- `ORA-12154` or `NJS-511`: verify `DB_CONNECT_STRING` and that the listener is reachable.
- `ORA-00942`: run the schema script as `researchhub_user`.
- `ORA-29855` or Oracle Text errors: grant `CTXAPP` to `researchhub_user` or ask the DBA to create the text indexes.
- `MODULE_NOT_FOUND`: run `npm install` in `project/api`.
- `PORT in use`: stop the process using port `3000` or change `API_PORT`.

## Verification Checklist
- [ ] Oracle is running and reachable on port `1521`
- [ ] `researchhub_user` exists and can connect
- [ ] `02_CREATE_TABLES.sql` has been applied
- [ ] Seed data has been loaded if needed
- [ ] `project/api/.env` uses Oracle connection values
- [ ] API dependencies are installed
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] `/health` returns a successful response
