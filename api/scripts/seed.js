const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const SEED_FILE = path.join(__dirname, '..', '..', 'database', 'seeds', 'seed-data.sql');

async function runSeed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'researchhub_user',
    password: process.env.DB_PASSWORD || 'researchhub_secure_password',
    database: process.env.DB_NAME || 'researchhub',
    multipleStatements: true
  });

  try {
    const seedSql = fs.readFileSync(SEED_FILE, 'utf8');
    await connection.query(seedSql);
    console.log('✅ Seed data applied successfully.');
  } finally {
    await connection.end();
  }
}

runSeed().catch(err => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
