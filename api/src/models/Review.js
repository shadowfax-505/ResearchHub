const { pool } = require('../config/database');

class Review {
  static async findByPaper(paperId) {
    const [rows] = await pool.query(`
      SELECT r.review_id, r.user_id, r.paper_id, r.rating, r.review_text, r.is_helpful,
             r.created_at, r.updated_at, u.username, u.full_name
      FROM REVIEWS r
      JOIN USERS u ON r.user_id = u.user_id
      WHERE r.paper_id = ?
      ORDER BY r.created_at DESC
    `, [paperId]);
    return rows;
  }

  static async findByUser(userId) {
    const [rows] = await pool.query(`
      SELECT r.*, p.title AS paper_title
      FROM REVIEWS r
      JOIN RESEARCH_PAPERS p ON r.paper_id = p.paper_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [userId]);
    return rows;
  }

  static async create(userId, paperId, rating, reviewText) {
    const [result] = await pool.query(
      `INSERT INTO REVIEWS (user_id, paper_id, rating, review_text, created_at, updated_at)
       VALUES (?, ?, ?, ?, SYSTIMESTAMP, SYSTIMESTAMP)`,
      [userId, paperId, rating, reviewText],
      { returnColumn: 'review_id' }
    );
    return result.insertId;
  }

  static async update(reviewId, userId, rating, reviewText) {
    const [result] = await pool.query(
      `UPDATE REVIEWS SET rating = ?, review_text = ?, updated_at = SYSTIMESTAMP
       WHERE review_id = ? AND user_id = ?`,
      [rating, reviewText, reviewId, userId]
    );
    return result.affectedRows;
  }

  static async delete(reviewId, userId) {
    const [result] = await pool.query(
      'DELETE FROM REVIEWS WHERE review_id = ? AND user_id = ?',
      [reviewId, userId]
    );
    return result.affectedRows;
  }

  static async getAverageRating(paperId) {
    const [rows] = await pool.query(
      'SELECT AVG(rating) AS avg_rating, COUNT(*) AS review_count FROM REVIEWS WHERE paper_id = ?',
      [paperId]
    );
    return rows[0] || { avg_rating: null, review_count: 0 };
  }
}

module.exports = Review;
