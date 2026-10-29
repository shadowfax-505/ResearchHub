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
const SCHEMA_FILE = path.join(__dirname, '..', '..', 'database', 'schema.sql');

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

    const existing = await connection.execute("SELECT table_name FROM user_tables WHERE table_name <> 'RH_SCHEMA_MIGRATIONS'");
    if (existing.rows.length && (!hasUsers || !hasAuthors)) {
      throw new Error('The schema is incomplete. Migration stopped without deleting tables. Back up and repair it explicitly.');
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

    await connection.execute(`BEGIN
      EXECUTE IMMEDIATE 'CREATE TABLE RH_SCHEMA_MIGRATIONS (filename VARCHAR2(200) PRIMARY KEY, applied_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL)';
      EXCEPTION WHEN OTHERS THEN IF SQLCODE != -955 THEN RAISE; END IF;
    END;`);
    const files = fs.readdirSync(MIGRATIONS_DIR).filter(file => file.endsWith('.sql')).sort();

    for (const file of files) {
      const applied = await connection.execute('SELECT filename FROM RH_SCHEMA_MIGRATIONS WHERE filename = :filename', { filename: file });
      if (applied.rows.length) { console.log(`Already applied: ${file}`); continue; }
      console.log(`Running migration: ${file}`);
      await executeFile(connection, path.join(MIGRATIONS_DIR, file));
      await connection.execute('INSERT INTO RH_SCHEMA_MIGRATIONS (filename) VALUES (:filename)', { filename: file });
      await connection.commit();
    }

    const invalid = await connection.execute("SELECT name, type, line, text FROM user_errors WHERE attribute = 'ERROR' ORDER BY name, sequence");
    if (invalid.rows.length) throw new Error('Stored program compilation failed: ' + JSON.stringify(invalid.rows));
    await connection.commit();
  } finally {
    await connection.close();
  }
}

runMigrations().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
