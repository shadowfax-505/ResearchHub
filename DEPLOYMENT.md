# ResearchHub Deployment Guide

## Overview
This document explains how to deploy ResearchHub locally, with Docker, and in a production-ready environment.

## Prerequisites
- Node.js 16+ and npm
- MySQL 8.0+
- Docker and Docker Compose (optional but recommended for containerized deployment)
- Git
- A local copy of the repository

## Environment
Copy the example environment file and set production values.

```bash
cd project/api
cp .env.example .env
```

Required values:
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `NODE_ENV=production`
- `API_PORT`

## Local Deployment
1. Install dependencies:
   ```bash
   cd project/api
   npm install
   ```
2. Create the database and apply schema:
   ```bash
   mysql -u root -p < ../02_CREATE_TABLES.sql
   ```
3. Run migrations and seed data if needed:
   ```bash
   npm run migrate
   npm run seed
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Verify:
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/api/v1
   ```

## Docker Deployment
### Build and run
From the repository root:

```bash
docker-compose up --build
```

### Notes
- The API is exposed on port `3000`
- MySQL is exposed on port `3306`
- The database is initialized from `project/database` files mounted into the container

### Stop containers

```bash
docker-compose down
```

## Production Deployment Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use a strong `JWT_SECRET`
- [ ] Use secure MySQL credentials
- [ ] Use `npm ci` for clean installs
- [ ] Configure process manager (PM2, systemd, etc.)
- [ ] Enable HTTPS / TLS at the reverse proxy layer
- [ ] Remove `.env` from version control
- [ ] Monitor logs and set up alerts

## Recommended Production Architecture
1. Database server separate from API server
2. Reverse proxy (NGINX / Traefik)
3. TLS certificate management
4. Centralized logging
5. Regular database backups

## Backup and Restore
### Backup
```bash
cd project/database
bash backup.sh
```

### Restore
```bash
mysql -u researchhub_user -p researchhub < path/to/backup.sql
```

## Troubleshooting
- `ECONNREFUSED` -> verify MySQL is running and env values match
- `ER_BAD_DB_ERROR` -> verify database exists
- `MODULE_NOT_FOUND` -> run `npm install`
- `PORT in use` -> free port `3000` or update `API_PORT`

## Launch Notes
- Verify `/health` returns `OK`
- Confirm `GET /api/v1` returns endpoint metadata
- Ensure sample authentication and search routes work after deployment
- Keep `docker-compose.yml` updated for container lifecycle management
