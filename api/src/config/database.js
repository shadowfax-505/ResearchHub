/**
 * Database Connection Module
 * Manages MySQL connection pool
 */

const mysql = require('mysql2/promise');
const config = require('./index');

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  charset: config.db.charset,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
});

async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    console.log('✅ Database connection pool is healthy');
  } finally {
    connection.release();
  }
}

module.exports = { pool, testConnection };
