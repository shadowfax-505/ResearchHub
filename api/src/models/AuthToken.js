const crypto = require('crypto');
const { pool } = require('../config/database');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

class AuthToken {
  static async issue(userId, tokenType, ttlMinutes) {
    const token = crypto.randomBytes(32).toString('hex');
    await pool.query(
      'DELETE FROM AUTH_TOKENS WHERE user_id = ? AND token_type = ? AND used_at IS NULL',
      [userId, tokenType]
    );
    await pool.query(
      `INSERT INTO AUTH_TOKENS (user_id, token_hash, token_type, expires_at)
       VALUES (?, ?, ?, SYSTIMESTAMP + NUMTODSINTERVAL(?, 'MINUTE'))`,
      [userId, hashToken(token), tokenType, ttlMinutes]
    );
    return token;
  }

  static async consume(token, tokenType) {
    const [rows] = await pool.query(
      `SELECT token_id, user_id FROM AUTH_TOKENS
       WHERE token_hash = ? AND token_type = ? AND used_at IS NULL AND expires_at > SYSTIMESTAMP`,
      [hashToken(token), tokenType]
    );
    if (!rows[0]) return null;
    await pool.query('UPDATE AUTH_TOKENS SET used_at = SYSTIMESTAMP WHERE token_id = ?', [rows[0].token_id]);
    return rows[0];
  }
}

module.exports = AuthToken;
