# ResearchHub Development Environment Setup Guide

## Overview
This guide will help you set up the ResearchHub project locally with MySQL database.

---

## Prerequisites

### System Requirements
- macOS, Linux, or Windows with WSL2
- MySQL 8.0+ (already installed: MySQL 9.6.0)
- Node.js 16+ (for API development)
- Git

### Verify Installation
```bash
mysql --version
node --version
npm --version
```

---

## Step 1: Database Setup

### 1.1 Create Database User

```sql
-- Login to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE researchhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'researchhub_user'@'localhost' IDENTIFIED BY 'researchhub_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON researchhub.* TO 'researchhub_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify
SHOW GRANTS FOR 'researchhub_user'@'localhost';
```

### 1.2 Deploy Schema

```bash
# Navigate to project directory
cd "/Users/muttakinrahman/Database Project/ResearchHub"

# Deploy SQL schema
mysql -u researchhub_user -p researchhub < 02_CREATE_TABLES.sql

# Verify tables were created
mysql -u researchhub_user -p researchhub -e "SHOW TABLES;"
```

---

## Step 2: Project Structure

Create the following directory structure:

```
ResearchHub/
├── project/
│   ├── .env.example          (configuration template)
│   ├── .env                  (your local config - DON'T commit)
│   ├── SETUP_GUIDE.md        (this file)
│   ├── database/
│   │   ├── migrations/       (future schema changes)
│   │   ├── seeds/            (sample data)
│   │   └── backups/          (database backups)
│   ├── api/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   └── middleware/
│   │   ├── package.json
│   │   └── server.js
│   ├── tests/
│   │   ├── integration/
│   │   ├── unit/
│   │   └── fixtures/
│   └── docs/
│       └── API.md
└── [original schema files...]
```

---

## Step 3: Create .env File

```bash
# Copy the example file
cp project/.env.example project/.env

# Edit .env with your settings (if different from defaults)
nano project/.env
```

**Content:**
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=researchhub
DB_USER=researchhub_user
DB_PASSWORD=researchhub_secure_password
DB_CHARSET=utf8mb4
DB_COLLATION=utf8mb4_unicode_ci
NODE_ENV=development
API_PORT=3000
```

---

## Step 4: Verify Database Connection

### Using MySQL CLI
```bash
mysql -h localhost -u researchhub_user -p researchhub

# In MySQL console:
SHOW TABLES;
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'researchhub';
```

### Using Node.js Script

Create `project/test-connection.js`:
```javascript
const mysql = require('mysql2/promise');

async function testConnection() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'researchhub_user',
        password: process.env.DB_PASSWORD || 'researchhub_secure_password',
        database: process.env.DB_NAME || 'researchhub'
    });
    
    try {
        const [tables] = await connection.execute('SHOW TABLES;');
        console.log('✅ Connected to ResearchHub database');
        console.log(`📊 Tables found: ${tables.length}`);
        console.table(tables);
    } finally {
        await connection.end();
    }
}

testConnection().catch(console.error);
```

Run it:
```bash
node test-connection.js
```

---

## Step 5: Create Database Backup Script

Create `project/database/backup.sh`:
```bash
#!/bin/bash

BACKUP_DIR="$(dirname "$0")/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/researchhub_backup_$TIMESTAMP.sql"

mkdir -p "$BACKUP_DIR"

echo "🔄 Creating backup..."
mysqldump -u researchhub_user -p researchhub > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created: $BACKUP_FILE"
    ls -lh "$BACKUP_FILE"
else
    echo "❌ Backup failed"
    exit 1
fi
```

Make executable:
```bash
chmod +x project/database/backup.sh
```

---

## Step 6: Sample Data (Optional)

Create `project/database/seeds/seed-data.sql` with sample data:

```sql
USE researchhub;

-- Sample Users
INSERT INTO USERS (username, email, password_hash, full_name, role, created_at)
VALUES 
('john_researcher', 'john@university.edu', 'hashed_pw_1', 'John Smith', 'researcher', NOW()),
('jane_admin', 'jane@university.edu', 'hashed_pw_2', 'Jane Doe', 'admin', NOW());

-- Sample Authors
INSERT INTO AUTHORS (full_name, affiliation, country, h_index, biography)
VALUES
('Dr. Albert Einstein', 'MIT', 'USA', 85, 'Physics researcher'),
('Dr. Marie Curie', 'University of Paris', 'France', 72, 'Chemistry researcher');

-- Sample Journals
INSERT INTO JOURNALS (name, issn, publisher, impact_factor)
VALUES
('Nature', '0028-0836', 'Springer Nature', 49.96),
('Science', '0036-8075', 'American Association for the Advancement of Science', 41.86);

-- More data as needed...
```

Load sample data:
```bash
mysql -u researchhub_user -p researchhub < project/database/seeds/seed-data.sql
```

---

## Step 7: Verify Complete Setup

### Check Database
```bash
# Connect and verify
mysql -u researchhub_user -p researchhub << 'VERIFY'
SHOW TABLES;
SELECT TABLE_NAME, TABLE_ROWS 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'researchhub';
VERIFY
```

### Check Indexes
```bash
mysql -u researchhub_user -p researchhub << 'CHECK_IDX'
SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME 
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'researchhub'
LIMIT 20;
CHECK_IDX
```

### Check Views
```bash
mysql -u researchhub_user -p researchhub -e "SHOW VIEWS;"
```

---

## Step 8: Common Operations

### Export Data
```bash
mysqldump -u researchhub_user -p researchhub > researchhub_export.sql
```

### Import Data
```bash
mysql -u researchhub_user -p researchhub < researchhub_export.sql
```

### Clear Database (Development Only!)
```bash
mysql -u researchhub_user -p researchhub << 'CLEAR'
SET FOREIGN_KEY_CHECKS=0;
DROP DATABASE researchhub;
CREATE DATABASE researchhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SET FOREIGN_KEY_CHECKS=1;
CLEAR
```

### Check Database Size
```bash
mysql -u researchhub_user -p researchhub << 'SIZE'
SELECT 
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS Size_MB
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'researchhub';
SIZE
```

---

## Step 9: Security Considerations

### Change Default Password
```sql
ALTER USER 'researchhub_user'@'localhost' IDENTIFIED BY 'your_strong_password';
```

### Limit User Permissions (Production)
```sql
-- Restrict to specific operations
REVOKE ALL PRIVILEGES ON researchhub.* FROM 'researchhub_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON researchhub.* TO 'researchhub_user'@'localhost';
FLUSH PRIVILEGES;
```

### Restrict to Localhost Only
```sql
-- Current: 'researchhub_user'@'localhost'
-- ✅ Already restricted to localhost
-- For production, never use '%' host wildcard
```

---

## Step 10: Troubleshooting

### Connection Refused
```bash
# Check if MySQL is running
ps aux | grep mysql

# Start MySQL (macOS with Homebrew)
brew services start mysql

# Check MySQL status
mysql -u root -e "SELECT 1;"
```

### Access Denied
```bash
# Verify user exists
mysql -u root -e "SELECT User, Host FROM mysql.user WHERE User='researchhub_user';"

# Reset password
mysql -u root -p << 'RESET'
SET PASSWORD FOR 'researchhub_user'@'localhost' = 'researchhub_secure_password';
FLUSH PRIVILEGES;
RESET
```

### Tables Not Found
```bash
# Verify database exists
mysql -u root -e "SHOW DATABASES;"

# Verify tables
mysql -u root researchhub -e "SHOW TABLES;"

# Redeploy schema if needed
mysql -u researchhub_user -p researchhub < 02_CREATE_TABLES.sql
```

### Foreign Key Constraint Errors
```sql
-- Check foreign key settings
SHOW VARIABLES LIKE 'foreign_key%';

-- Enable foreign keys
SET FOREIGN_KEY_CHECKS=1;

-- Verify constraints
SELECT CONSTRAINT_NAME, TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'researchhub'
AND REFERENCED_TABLE_NAME IS NOT NULL;
```

---

## Deployment Checklist

- [ ] MySQL 8.0+ installed and running
- [ ] Database `researchhub` created
- [ ] User `researchhub_user` created with correct privileges
- [ ] Schema deployed (02_CREATE_TABLES.sql executed)
- [ ] 19 tables created
- [ ] 40+ indexes created
- [ ] 5 views created
- [ ] Test connection successful
- [ ] .env file configured
- [ ] Backup script working
- [ ] Sample data loaded (if desired)

---

## Next Steps

1. **Set up API**: Build REST API with Node.js/Express
2. **Add Authentication**: Implement JWT authentication
3. **Build Frontend**: Create React/Vue.js UI
4. **Add Tests**: Write unit and integration tests
5. **Deploy**: Move to production environment

---

## Support Resources

- **Schema Documentation**: `01_SCHEMA_DESIGN.md`
- **Example Queries**: `05_EXAMPLE_QUERIES.sql`
- **Implementation Guide**: `07_IMPLEMENTATION_GUIDE.md`
- **MySQL Docs**: https://dev.mysql.com/doc/

---

## Quick Start (All-in-One)

```bash
# 1. Create database and user
mysql -u root -p << 'SETUP'
CREATE DATABASE researchhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'researchhub_user'@'localhost' IDENTIFIED BY 'researchhub_secure_password';
GRANT ALL PRIVILEGES ON researchhub.* TO 'researchhub_user'@'localhost';
FLUSH PRIVILEGES;
SETUP

# 2. Deploy schema
mysql -u researchhub_user -p researchhub < 02_CREATE_TABLES.sql

# 3. Verify
mysql -u researchhub_user -p researchhub -e "SHOW TABLES; SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA='researchhub';"

# 4. Create backup directory
mkdir -p project/database/backups

# 5. Test connection
mysql -u researchhub_user -p researchhub -e "SELECT 'Connected!' as status;"
```

---

**Setup Status**: ✅ Ready for Development
**Last Updated**: Current Date
**Version**: 1.0

