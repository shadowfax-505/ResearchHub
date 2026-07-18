# ResearchHub Deployment Guide

## Overview
This document explains how to deploy ResearchHub with Oracle Database locally, through Docker, or in a production-ready environment.

## Prerequisites
- Node.js 16+ and npm
- Oracle Database 21c XE, Oracle Database Free 23ai, or a managed Oracle-compatible service
- Docker and Docker Compose for containerized deployment
- Git

## Environment
Copy the example environment file and set deployment values.

```bash
cd project/api
cp .env.example .env
```

Required values:
- `DB_CONNECT_STRING`
- `DB_USER`
- `DB_PASSWORD`
- `DB_SCHEMA`
- `JWT_SECRET`
- `NODE_ENV=production`
- `API_PORT`

## Local Deployment
Install dependencies:

```bash
cd project/api
npm install
```

Apply schema and seed data:

```bash
sqlplus researchhub_user/researchhub_secure_password@localhost:1521/XEPDB1 @../../02_CREATE_TABLES.sql
sqlplus researchhub_user/researchhub_secure_password@localhost:1521/XEPDB1 @../database/seeds/seed-data.sql
```

Start the server:

```bash
npm start
```

Verify:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/v1
```

## Docker Deployment
From `ResearchHub/project`:

```bash
docker-compose up --build
```

The API is exposed on port `3000`, and Oracle is exposed on port `1521`.

Stop containers:

```bash
docker-compose down
```

## Production Deployment Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use a strong `JWT_SECRET`
- [ ] Use secure Oracle credentials
- [ ] Use `npm ci` for clean installs
- [ ] Configure a process manager such as PM2 or systemd
- [ ] Enable HTTPS/TLS at the reverse proxy layer
- [ ] Keep `.env` out of version control
- [ ] Monitor logs and set up alerts
- [ ] Schedule database exports or RMAN backups

## Recommended Production Architecture
1. Oracle database server separate from the API server
2. Reverse proxy such as NGINX or Traefik
3. TLS certificate management
4. Centralized logging
5. Regular database backups

## Backup and Restore
Use Oracle Data Pump in production environments:

```bash
expdp researchhub_user/researchhub_secure_password@localhost:1521/XEPDB1 schemas=RESEARCHHUB_USER directory=DATA_PUMP_DIR dumpfile=researchhub.dmp logfile=researchhub_export.log
impdp researchhub_user/researchhub_secure_password@localhost:1521/XEPDB1 schemas=RESEARCHHUB_USER directory=DATA_PUMP_DIR dumpfile=researchhub.dmp logfile=researchhub_import.log
```

## Troubleshooting
- `ORA-01017`: verify database credentials.
- `ORA-12154`: verify the connection string and listener name.
- `NJS-511`: verify the Oracle listener is reachable from the API host.
- `ORA-00942`: run the schema as the same user configured in `DB_USER`.
- `MODULE_NOT_FOUND`: run `npm install`.
- `PORT in use`: free port `3000` or update `API_PORT`.

## Launch Notes
- Verify `/health` returns a successful response.
- Confirm `GET /api/v1` returns endpoint metadata.
- Confirm authentication, search, save-paper, and paper detail flows work after deployment.
- Keep `docker-compose.yml` updated for container lifecycle management.
