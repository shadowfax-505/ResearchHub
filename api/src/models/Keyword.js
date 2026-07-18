

const { pool } = require('../config/database');

class Keyword {
  static async findAll(limit = 20, offset = 0) {
    const [rows] = await pool.query(
      'SELECT * FROM KEYWORDS ORDER BY keyword_id OFFSET ? ROWS FETCH NEXT ? ROWS ONLY',
      [offset, limit]
    );
    return rows;
  }

  static async findById(keywordId) {
    const [rows] = await pool.query(
      'SELECT * FROM KEYWORDS WHERE keyword_id = ?',
      [keywordId]
    );
    if (rows.length === 0) return null;

    const keyword = rows[0];
    const [papers] = await pool.query(
      'SELECT p.* FROM RESEARCH_PAPERS p JOIN PAPER_KEYWORDS pk ON p.paper_id = pk.paper_id WHERE pk.keyword_id = ? FETCH NEXT 100 ROWS ONLY',
      [keywordId]
    );
    keyword.papers = papers;

    return keyword;
  }

  static async search(query, limit = 20, offset = 0) {
    const [rows] = await pool.query(
      'SELECT * FROM KEYWORDS WHERE LOWER(keyword) LIKE LOWER(?) ORDER BY keyword_id OFFSET ? ROWS FETCH NEXT ? ROWS ONLY',
      [`%${query}%`, offset, limit]
    );
    return rows;
  }

  static async getTopKeywords(limit = 20) {
    const [rows] = await pool.query(`
      SELECT k.*, COUNT(pk.paper_id) as usage_count
      FROM KEYWORDS k
      LEFT JOIN PAPER_KEYWORDS pk ON k.keyword_id = pk.keyword_id
      GROUP BY k.keyword_id, k.keyword, k.frequency, k.created_at
      ORDER BY usage_count DESC
      FETCH NEXT ? ROWS ONLY
    `, [limit]);
    return rows;
  }

  static async create(keyword) {
    const [result] = await pool.query(
      'INSERT INTO KEYWORDS (keyword, created_at) VALUES (?, SYSTIMESTAMP)',
      [keyword],
      { returnColumn: 'keyword_id' }
    );
    return result.insertId;
  }

  static async getStats() {
    const [rows] = await pool.query(`
      SELECT COUNT(*) as total_keywords FROM KEYWORDS
    `);
    return rows[0];
  }
}

module.exports = Keyword;
