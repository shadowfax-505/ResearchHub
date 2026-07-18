const { pool } = require('../config/database');

class Collection {
  static async findByUser(userId) {
    const [rows] = await pool.query(`
      SELECT c.collection_id, c.user_id, c.name, c.description, c.created_at, c.updated_at,
             COUNT(sp.saved_id) AS paper_count
      FROM COLLECTIONS c
      LEFT JOIN SAVED_PAPERS sp ON c.user_id = sp.user_id AND c.name = sp.collection_name
      WHERE c.user_id = ?
      GROUP BY c.collection_id, c.user_id, c.name, c.description, c.created_at, c.updated_at
      ORDER BY c.updated_at DESC
    `, [userId]);
    return rows;
  }

  static async create(userId, name, description) {
    const [result] = await pool.query(
      'INSERT INTO COLLECTIONS (user_id, name, description, created_at, updated_at) VALUES (?, ?, ?, SYSTIMESTAMP, SYSTIMESTAMP)',
      [userId, name, description]
    );
    return result;
  }
}

module.exports = Collection;
