# 🚀 ResearchHub Project - Getting Started

## Project Status: ✅ READY FOR DEVELOPMENT

Your ResearchHub project has been set up with:
- ✅ Complete database schema (19 tables)
- ✅ Project structure and directories
- ✅ API server template (Express.js)
- ✅ Environment configuration
- ✅ Database connection module
- ✅ Setup guides and documentation

---

## 📋 Quick Start (5 Steps)

### Step 1: Setup Oracle Database

```bash
cd "/Users/muttakinrahman/Database Project/ResearchHub"
sqlplus researchhub_user/researchhub_secure_password@localhost:1521/XEPDB1 @02_CREATE_TABLES.sql
sqlplus researchhub_user/researchhub_secure_password@localhost:1521/XEPDB1 @project/database/seeds/seed-data.sql
```

### Step 2: Install Node.js Dependencies

```bash
cd project/api
npm install
```

### Step 3: Configure Environment

```bash
# .env file already created from .env.example
# Edit if needed:
nano .env
```

### Step 4: Start the API Server

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

### Step 5: Test the Server

```bash
# In another terminal:
curl http://localhost:3000/health
curl http://localhost:3000/api/v1
```

---

## Deployment

For deployment and launch checks, see [`DEPLOYMENT.md`](./DEPLOYMENT.md).

## 📁 Project Structure

```
ResearchHub/
├── project/                          (Development environment)
│   ├── .env.example                  (Config template)
│   ├── .env                          (Your local config)
│   ├── SETUP_GUIDE.md                (Detailed setup instructions)
│   ├── api/                          (Express.js API)
│   │   ├── package.json              (Dependencies)
│   │   ├── server.js                 (Main server)
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   └── database.js       (Oracle connection)
│   │   │   ├── controllers/          (API handlers)
│   │   │   ├── models/               (Data models)
│   │   │   ├── routes/               (API routes)
│   │   │   └── middleware/           (Auth, validation)
│   │   ├── tests/                    (Unit & integration tests)
│   │   └── node_modules/             (Dependencies)
│   ├── database/
│   │   ├── migrations/               (Schema changes)
│   │   ├── seeds/                    (Sample data)
│   │   └── backups/                  (Database backups)
│   └── docs/                         (API documentation)
│
├── 02_CREATE_TABLES.sql              (Database schema DDL)
├── 01_SCHEMA_DESIGN.md               (Table specifications)
├── 03_NORMALIZATION_ER_DIAGRAM.md    (ER diagram)
├── 04_INDEX_OPTIMIZATION.md          (Index strategy)
├── 05_EXAMPLE_QUERIES.sql            (SQL examples)
├── 06_DATA_DICTIONARY.md             (Field documentation)
├── 07_IMPLEMENTATION_GUIDE.md        (Implementation details)
├── VISUAL_SCHEMA_DIAGRAM_CORRECTED.txt (ASCII diagram)
├── SCHEMA_MERMAID_DIAGRAM_CORRECTED.md (Mermaid diagrams)
├── SCHEMA_VISUALIZER_CORRECTED.html  (Interactive visualizer)
└── ... (and more documentation files)
```

---

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start development server (auto-reload)
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Lint code
npm run lint

# Database migrations (when ready)
npm run migrate

# Seed sample data
npm run seed

# Create database backup
npm run backup
```

---

## 📊 Database Overview

### Tables (24 Total)
- **Core**: USERS, AUTHORS, JOURNALS, RESEARCH_PAPERS, RESEARCH_FIELDS, KEYWORDS
- **Junctions**: PAPER_AUTHORS, PAPER_FIELDS, PAPER_KEYWORDS, SAVED_PAPERS, FOLLOWED_AUTHORS, REVIEWS, CITATIONS, COLLECTIONS, RESEARCH_REQUESTS
- **App/Analytics**: NOTIFICATIONS, USER_SETTINGS, SEARCH_HISTORY, AUDIT_LOGS, USER_ACTIVITY, QUESTIONS, ANSWERS, EMAIL_QUEUE, RESEARCHER_STATS

### Features
- ✅ Full-text search indexes on paper titles/abstracts
- ✅ Citation tracking (self-referencing)
- ✅ User activity logging
- ✅ Q&A, full-text request queue, and cached researcher stats
- ✅ Materialized views for reporting
- ✅ 40+ optimized indexes
- ✅ 3NF normalized schema

### Connection Details
- **Connect String**: localhost:1521/XEPDB1
- **Schema**: RESEARCHHUB_USER
- **User**: researchhub_user

---

## 🔍 API Endpoints (Implemented in API)

### Root
- `GET /health` - Server health check
- `GET /api/v1` - API overview

### Resources
- `GET /api/v1/users` - List users (admin only)
- `GET /api/v1/papers/search` - Search papers
- `POST /api/v1/papers/:paperId/request-fulltext` - Queue full-text requests
- `GET /api/v1/questions` - Browse Q&A
- `GET /api/v1/admin/dashboard` - Admin dashboard
- `GET /api/v1/authors` - List authors
- `GET /api/v1/journals` - List journals
- `GET /api/v1/fields` - Research fields
- `GET /api/v1/keywords` - Keywords

---

## 📚 Documentation

Each file provides specific guidance:

| File | Purpose |
|------|---------|
| `SETUP_GUIDE.md` | Detailed setup and troubleshooting |
| `01_SCHEMA_DESIGN.md` | Complete table specifications |
| `05_EXAMPLE_QUERIES.sql` | 40+ SQL query examples |
| `06_DATA_DICTIONARY.md` | Field documentation |
| `07_IMPLEMENTATION_GUIDE.md` | Implementation details |
| `PROJECT_ROADMAP.md` | Current implementation checkpoint and next-session handoff |
| `VISUAL_SCHEMA_DIAGRAM_CORRECTED.txt` | ASCII ER diagram |

---

## ✅ Verification Checklist

- [ ] Oracle Database installed and running
- [ ] User created (`researchhub_user`)
- [ ] Schema deployed (24 tables created)
- [ ] Node.js and npm installed (`node --version`, `npm --version`)
- [ ] Dependencies installed (`npm install`)
- [ ] .env file configured
- [ ] API server starts (`npm run dev`)
- [ ] Health check works (`curl http://localhost:3000/health`)

---

## 🚀 Next Steps

1. **Verify Setup** - Run through verification checklist above
2. **Review Schema** - Read `01_SCHEMA_DESIGN.md`
3. **Start Building API** - Create controllers and routes in `api/src/`
4. **Add Authentication** - Implement JWT in middleware
5. **Build Frontend** - Create React/Vue.js UI
6. **Add Tests** - Write test cases in `api/tests/`

---

## 🐛 Troubleshooting

### Server Won't Start
```bash
# Check Oracle listener status
lsnrctl status

# Check port 3000 is available
lsof -i :3000
```

### Database Connection Failed
```bash
# Test Oracle connection
sqlplus researchhub_user/researchhub_secure_password@localhost:1521/XEPDB1

# Check tables
SELECT table_name FROM user_tables ORDER BY table_name;
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Help & Resources

- **Database**: `/02_CREATE_TABLES.sql` (source of truth)
- **Examples**: `05_EXAMPLE_QUERIES.sql` (40+ queries)
- **Setup**: `SETUP_GUIDE.md` (step-by-step)
- **Diagrams**: `SCHEMA_VISUALIZER_CORRECTED.html` (interactive)

---

## 🎓 Project Specifications

- **Schema**: 3NF normalized relational database
- **Tables**: 19 (6 core + 7 junctions + 3 analytics)
- **Fields**: 119+
- **Indexes**: 40+ (including full-text search)
- **Views**: 5 materialized views
- **Capacity**: Designed for 1M+ papers
- **API**: RESTful with Express.js
- **Standards**: Production-ready, university-grade

---

## 📝 Version Info

- **Project**: ResearchHub v1.0.0
- **Status**: Development Ready
- **Last Updated**: Current Date
- **API Version**: v1.0.0
- **Database Charset**: utf8mb4
- **Node.js**: >=16.0.0

---

## 🎉 You're All Set!

Everything is ready for development. Start with Step 1 above and follow the quick start guide.

**Happy coding! 🚀**
