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

const SEED_FILE = path.join(__dirname, '..', '..', 'database', 'seeds', 'seed-data.sql');

function splitStatements(sql) {
  return sql
    .split(/\n\/\s*(?:\n|$)/)
    .flatMap(chunk => chunk.split(/;\s*(?:\n|$)/))
    .map(statement => statement.trim())
    .filter(Boolean);
}

async function runSeed() {
  const connection = await oracledb.getConnection({
    user: config.db.user,
    password: config.db.password,
    connectString: config.db.connectString
  });

  try {
    const result = await connection.execute('SELECT COUNT(*) AS USER_COUNT FROM USERS');
    const row = result.rows?.[0];
    const userCount = Number(row?.USER_COUNT ?? row?.[0] ?? 0);
    if (userCount > 0 && process.env.FORCE_SEED !== 'true') {
      console.log('Seed skipped: database already contains users. Set FORCE_SEED=true to replay seed data.');
      return;
    }

    const seedSql = fs.readFileSync(SEED_FILE, 'utf8');
    for (const statement of splitStatements(seedSql)) {
      try {
        await connection.execute(statement);
      } catch (error) {
        if (!/ORA-00001|unique constraint/i.test(String(error.message))) throw error;
        console.warn('Skipped existing seed row:', error.message.split('\n')[0]);
      }
    }
    await connection.commit();
  } finally {
    await connection.close();
  }
}

runSeed().catch(err => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
