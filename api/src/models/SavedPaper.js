const { pool } = require('../config/database');

class SavedPaper {
  static async findByUser(userId) {
    const [rows] = await pool.query(`
      SELECT sp.saved_id, sp.user_id, sp.paper_id, sp.collection_name, sp.saved_at,
             p.title, p.abstract, p.publication_date, p.citation_count, p.view_count,
             j.name AS journal_name
      FROM SAVED_PAPERS sp
      JOIN RESEARCH_PAPERS p ON sp.paper_id = p.paper_id
      LEFT JOIN JOURNALS j ON p.journal_id = j.journal_id
      WHERE sp.user_id = ?
      ORDER BY sp.saved_at DESC
    `, [userId]);
    return rows;
  }

  static async findByCollection(userId, collectionName) {
    const [rows] = await pool.query(`
      SELECT sp.saved_id, sp.user_id, sp.paper_id, sp.collection_name, sp.saved_at,
             p.title, p.abstract, p.publication_date, p.citation_count, p.view_count,
             j.name AS journal_name
      FROM SAVED_PAPERS sp
      JOIN RESEARCH_PAPERS p ON sp.paper_id = p.paper_id
      LEFT JOIN JOURNALS j ON p.journal_id = j.journal_id
      WHERE sp.user_id = ? AND sp.collection_name = ?
      ORDER BY sp.saved_at DESC
    `, [userId, collectionName]);
    return rows;
  }

  static async create(userId, paperId, collectionName) {
    const [result] = await pool.query(
      'INSERT INTO SAVED_PAPERS (user_id, paper_id, collection_name, saved_at) VALUES (?, ?, ?, SYSTIMESTAMP)',
      [userId, paperId, collectionName]
    );
    return result;
  }

  static async delete(userId, paperId) {
    const [result] = await pool.query(
      'DELETE FROM SAVED_PAPERS WHERE user_id = ? AND paper_id = ?',
      [userId, paperId]
    );
    return result.affectedRows;
  }
}

module.exports = SavedPaper;
