/**
 * User Model
 * Handles user-related database operations
 */

const pool = require('../config/database');

class User {
  static async findAll(limit = 20, offset = 0) {
    const [rows] = await pool.query(
      'SELECT user_id, username, email, full_name, role, affiliation, country, is_active, created_at FROM USERS LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows;
  }

  static async findById(userId) {
    const [rows] = await pool.query(
      'SELECT user_id, username, email, full_name, role, affiliation, country, bio, is_active, last_login, created_at, updated_at FROM USERS WHERE user_id = ?',
      [userId]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM USERS WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findByUsername(username) {
    const [rows] = await pool.query(
      'SELECT * FROM USERS WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  static async create(userData) {
    const { username, email, password_hash, full_name, role = 'researcher', affiliation, country, bio } = userData;
    const [result] = await pool.query(
      'INSERT INTO USERS (username, email, password_hash, full_name, role, affiliation, country, bio, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, NOW())',
      [username, email, password_hash, full_name, role, affiliation, country, bio]
    );
    return result.insertId;
  }

  static async update(userId, userData) {
    const { full_name, affiliation, country, bio, is_active } = userData;
    const [result] = await pool.query(
      'UPDATE USERS SET full_name = ?, affiliation = ?, country = ?, bio = ?, is_active = ?, updated_at = NOW() WHERE user_id = ?',
      [full_name, affiliation, country, bio, is_active, userId]
    );
    return result.affectedRows;
  }

  static async updateLastLogin(userId) {
    const [result] = await pool.query(
      'UPDATE USERS SET last_login = NOW() WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows;
  }

  static async delete(userId) {
    const [result] = await pool.query(
      'DELETE FROM USERS WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows;
  }

  static async getStats() {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active FROM USERS'
    );
    return rows[0];
  }
}

module.exports = User;
