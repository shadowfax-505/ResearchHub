const fs = require('fs');
const path = require('path');
const config = require('../src/config');
require('dotenv').config();

let oracledb;

try {
  oracledb = require('oracledb');
} catch (_error) {
  console.error('Oracle database driver unavailable. Install the oracledb package.');
  process.exit(1);
}

const MIGRATIONS_DIR = path.join(__dirname, '..', '..', 'database', 'migrations');
const SCHEMA_FILE = path.join(__dirname, '..', '..', '..', '02_CREATE_TABLES.sql');

function splitStatements(sql) {
  return sql
    .split(/^\s*\/\s*$/m)
    .flatMap(chunk => {
      const trimmed = chunk.trim();
      if (!trimmed) return [];

      // Strip leading comments to correctly identify PL/SQL blocks
      const clean = trimmed.replace(/^(?:\s*--.*\r?\n)+/, '').trim();

      // Oracle anonymous blocks and stored-program units contain internal
      // semicolons, so they must be sent as one statement after SQL*Plus '/'.
      if (/^(BEGIN|DECLARE|CREATE\s+(OR\s+REPLACE\s+)?(?:PROCEDURE|FUNCTION|PACKAGE|TRIGGER|TYPE))\b/i.test(clean)) {
        return [trimmed];
      }

      return trimmed.split(/;\s*(?:\n|$)/).map(statement => statement.trim()).filter(Boolean);
    });
}

async function dropAllUserTables(connection) {
  // Query all tables in the current user's schema
  const res = await connection.execute('SELECT table_name FROM user_tables');
  for (const row of res.rows) {
    const tableName = row[0] || row.TABLE_NAME;
    try {
      await connection.execute(`DROP TABLE "${tableName}" CASCADE CONSTRAINTS PURGE`);
      console.log(`Dropped table: ${tableName}`);
    } catch (e) {
      console.warn(`Error dropping table ${tableName}:`, e.message);
    }
  }
}

async function executeFile(connection, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  for (const statement of splitStatements(sql)) {
    try {
      await connection.execute(statement);
    } catch (err) {
      // Ignore safe errors like index already exists (955), column already indexed (1408),
      // constraints already existing (2260, 2261), or missing indextypes (29833)
      const isSafeError = [955, 1408, 2260, 2261, 29833].some(code =>
        err.message.includes(`ORA-0${code}`) || err.message.includes(`ORA-${code}`)
      );
      if (isSafeError) {
        console.warn(`[Warning] Ignored safe error in ${path.basename(filePath)}: ${err.message.split('\n')[0]}`);
      } else {
        throw err;
      }
    }
  }
}

async function runMigrations() {
  const connection = await oracledb.getConnection({
    user: config.db.user,
    password: config.db.password,
    connectString: config.db.connectString
  });

  try {
    let hasUsers = false;
    let hasAuthors = false;
    try {
      await connection.execute('SELECT 1 FROM USERS WHERE ROWNUM = 1');
      hasUsers = true;
    } catch (_e) {
      hasUsers = false;
    }
    try {
      await connection.execute('SELECT 1 FROM AUTHORS WHERE ROWNUM = 1');
      hasAuthors = true;
    } catch (_e) {
      hasAuthors = false;
    }

    // If schema is partial (e.g. USERS exists but other core tables like AUTHORS do not), clean up first
    if (hasUsers && !hasAuthors) {
      console.log('Detected partial schema state. Dropping all user schema tables for a clean rebuild...');
      await dropAllUserTables(connection);
      hasUsers = false;
    }

    if (!hasUsers && fs.existsSync(SCHEMA_FILE)) {
      console.log('Creating base schema tables...');
      await executeFile(connection, SCHEMA_FILE);
    } else {
      console.log('Base schema tables already exist. Skipping base schema creation.');
    }

    if (!fs.existsSync(MIGRATIONS_DIR)) {
      await connection.commit();
      return;
    }

    const files = fs.readdirSync(MIGRATIONS_DIR).filter(file => file.endsWith('.sql')).sort();

    for (const file of files) {
      console.log(`Running migration: ${file}`);
      await executeFile(connection, path.join(MIGRATIONS_DIR, file));
    }

    await connection.commit();
  } finally {
    await connection.close();
  }
}

runMigrations().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
