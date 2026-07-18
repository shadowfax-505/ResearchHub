const { pool } = require('../config/database');

class Interest {
  static async list(userId) {
    const [rows] = await pool.query(`
      SELECT user_id, interest_type, interest_id, source, weight, created_at, updated_at
      FROM USER_INTERESTS
      WHERE user_id = ?
      ORDER BY interest_type, interest_id
    `, [userId]);
    return rows;
  }

  static async replace(userId, interests) {
    await pool.query('DELETE FROM USER_INTERESTS WHERE user_id = ?', [userId]);
    for (const interest of interests) {
      await pool.query(`
        INSERT INTO USER_INTERESTS (user_id, interest_type, interest_id, source, weight, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, SYSTIMESTAMP, SYSTIMESTAMP)
      `, [userId, interest.interest_type, interest.interest_id, interest.source || 'explicit', interest.weight || 1]);
    }
    return this.list(userId);
  }

  static async remove(userId, interestType, interestId) {
    const [result] = await pool.query(
      'DELETE FROM USER_INTERESTS WHERE user_id = ? AND interest_type = ? AND interest_id = ?',
      [userId, interestType, interestId]
    );
    return result.affectedRows;
  }
}

module.exports = Interest;
