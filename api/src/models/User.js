

const { pool } = require('../config/database');

class User {
  static async findAll(limit = 20, offset = 0) {
    const [rows] = await pool.query(
      'SELECT user_id, username, email, full_name, role, affiliation, country, is_active, is_verified, created_at FROM USERS ORDER BY user_id OFFSET ? ROWS FETCH NEXT ? ROWS ONLY',
      [offset, limit]
    );
    return rows;
  }

  static async findById(userId) {
    const [rows] = await pool.query(
      'SELECT user_id, username, email, full_name, role, affiliation, country, bio, profile_picture_url, email_verified_at, researcher_verified_at, is_active, is_verified, last_login, created_at, updated_at FROM USERS WHERE user_id = ?',
      [userId]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM USERS WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))',
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

  static async findByIdentifier(identifier) {
    const [rows] = await pool.query(
      'SELECT * FROM USERS WHERE LOWER(username) = LOWER(?) OR LOWER(TRIM(email)) = LOWER(TRIM(?))',
      [identifier, identifier]
    );
    return rows[0];
  }

  static async create(userData) {
    const { username, email, password_hash, full_name, role = 'researcher', affiliation, country, bio } = userData;
    try {
      await pool.query(
        'INSERT INTO EMAIL_IDENTITIES (normalized_email, original_email) VALUES (LOWER(TRIM(?)), ?)',
        [email, email]
      );
    } catch (error) {
      if (!/ORA-00001|unique constraint/i.test(String(error.message))) throw error;
      const duplicate = new Error('Email already exists');
      duplicate.code = 'EMAIL_ALREADY_RESERVED';
      throw duplicate;
    }
    const [result] = await pool.query(
      'INSERT INTO USERS (username, email, password_hash, full_name, role, affiliation, country, bio, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, SYSTIMESTAMP)',
      [username, email, password_hash, full_name, role, affiliation, country, bio],
      { returnColumn: 'user_id' }
    );
    return result.insertId;
  }

  static async update(userId, userData) {
    const fields = [];
    const params = [];

    if (userData.full_name !== undefined) {
      fields.push('full_name = ?');
      params.push(userData.full_name);
    }
    if (userData.affiliation !== undefined) {
      fields.push('affiliation = ?');
      params.push(userData.affiliation);
    }
    if (userData.country !== undefined) {
      fields.push('country = ?');
      params.push(userData.country);
    }
    if (userData.bio !== undefined) {
      fields.push('bio = ?');
      params.push(userData.bio);
    }
    if (userData.is_active !== undefined) {
      fields.push('is_active = ?');
      params.push(userData.is_active);
    }

    if (fields.length === 0) return 0;

    fields.push('updated_at = SYSTIMESTAMP');
    params.push(userId);

    const sql = `UPDATE USERS SET ${fields.join(', ')} WHERE user_id = ?`;
    const [result] = await pool.query(sql, params);
    return result.affectedRows;
  }

  static async verifyUser(userId) {
    const [result] = await pool.query(
      'UPDATE USERS SET is_verified = 1, updated_at = SYSTIMESTAMP WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows;
  }

  static async getUnverifiedUsers() {
    const [rows] = await pool.query(
      'SELECT user_id, username, email, full_name, role, affiliation, country, is_active, is_verified, created_at FROM USERS WHERE is_verified = 0 ORDER BY created_at DESC'
    );
    return rows;
  }

  static async updateLastLogin(userId) {
    const [result] = await pool.query(
      'UPDATE USERS SET last_login = SYSTIMESTAMP WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows;
  }

  static async markEmailVerified(userId) {
    const [result] = await pool.query(
      'UPDATE USERS SET email_verified_at = SYSTIMESTAMP, updated_at = SYSTIMESTAMP WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows;
  }

  static async updateAvatar(userId, url) {
    const [result] = await pool.query('UPDATE USERS SET profile_picture_url = ?, updated_at = SYSTIMESTAMP WHERE user_id = ?', [url, userId]);
    return result.affectedRows;
  }

  static async updatePassword(userId, passwordHash) {
    const [result] = await pool.query(
      'UPDATE USERS SET password_hash = ?, updated_at = SYSTIMESTAMP WHERE user_id = ?',
      [passwordHash, userId]
    );
    return result.affectedRows;
  }

  static async delete(userId) {
    const [result] = await pool.query(
      `UPDATE USERS SET is_active = 0, account_status = 'closed', updated_at = SYSTIMESTAMP
       WHERE user_id = ?`,
      [userId]
    );
    return result.affectedRows;
  }

  static async getStats() {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as total, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active FROM USERS'
    );
    return rows[0];
  }

  static async getUserStats(userId) {
    const [rows] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM SAVED_PAPERS WHERE user_id = ?) AS saved_papers,
        (SELECT COUNT(*) FROM FOLLOWED_AUTHORS WHERE user_id = ?) AS following,
        (SELECT COUNT(DISTINCT fa2.user_id) FROM FOLLOWED_AUTHORS fa1
          JOIN FOLLOWED_AUTHORS fa2 ON fa1.author_id = fa2.author_id AND fa2.user_id != ?
          WHERE fa1.user_id = ?
        ) AS followers,
        (SELECT COUNT(*) FROM REVIEWS WHERE user_id = ?) AS reviews
      FROM dual
    `, [userId, userId, userId, userId, userId]);
    return rows[0];
  }
}

module.exports = User;
