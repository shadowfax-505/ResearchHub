const { pool } = require('../config/database');

class FollowedAuthor {
  static async findByUser(userId) {
    const [rows] = await pool.query(`
      SELECT fa.follow_id, fa.author_id, fa.followed_at,
             a.full_name, a.affiliation, a.h_index
      FROM FOLLOWED_AUTHORS fa
      JOIN AUTHORS a ON fa.author_id = a.author_id
      WHERE fa.user_id = ?
      ORDER BY fa.followed_at DESC
    `, [userId]);
    return rows;
  }

  static async isFollowing(userId, authorId) {
    const [rows] = await pool.query(
      'SELECT follow_id FROM FOLLOWED_AUTHORS WHERE user_id = ? AND author_id = ?',
      [userId, authorId]
    );
    return rows.length > 0;
  }

  static async follow(userId, authorId) {
    const [result] = await pool.query(
      'INSERT INTO FOLLOWED_AUTHORS (user_id, author_id, followed_at) VALUES (?, ?, SYSTIMESTAMP)',
      [userId, authorId],
      { returnColumn: 'follow_id' }
    );
    return result.insertId;
  }

  static async unfollow(userId, authorId) {
    const [result] = await pool.query(
      'DELETE FROM FOLLOWED_AUTHORS WHERE user_id = ? AND author_id = ?',
      [userId, authorId]
    );
    return result.affectedRows;
  }

  static async getFollowerCount(authorId) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM FOLLOWED_AUTHORS WHERE author_id = ?',
      [authorId]
    );
    return rows[0]?.count || 0;
  }

  static async getFollowingCount(userId) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM FOLLOWED_AUTHORS WHERE user_id = ?',
      [userId]
    );
    return rows[0]?.count || 0;
  }
}

module.exports = FollowedAuthor;
