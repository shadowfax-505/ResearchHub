/**
 * Database Connection Module
 * Manages MySQL connection pool
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'researchhub_user',
  password: process.env.DB_PASSWORD || 'researchhub_secure_password',
  database: process.env.DB_NAME || 'researchhub',
  charset: process.env.DB_CHARSET || 'utf8mb4',
  collation: process.env.DB_COLLATION || 'utf8mb4_unicode_ci',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ Database connection pool created successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

module.exports = pool;
