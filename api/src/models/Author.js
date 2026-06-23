/**
 * Author Model
 * Handles author-related database operations
 */

const pool = require('../config/database');

class Author {
  static async findAll(limit = 20, offset = 0) {
    const [rows] = await pool.query(
      'SELECT author_id, full_name, affiliation, country, h_index, email, researcher_url, biography, created_at FROM AUTHORS LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows;
  }

  static async findById(authorId) {
    const [rows] = await pool.query(
      'SELECT * FROM AUTHORS WHERE author_id = ?',
      [authorId]
    );
    if (rows.length === 0) return null;

    const author = rows[0];
    
    // Get papers by this author
    const [papers] = await pool.query(`
      SELECT p.* FROM RESEARCH_PAPERS p
      JOIN PAPER_AUTHORS pa ON p.paper_id = pa.paper_id
      WHERE pa.author_id = ?
      ORDER BY p.publication_date DESC
    `, [authorId]);
    author.papers = papers;

    return author;
  }

  static async search(query, limit = 20, offset = 0) {
    const [rows] = await pool.query(
      'SELECT * FROM AUTHORS WHERE full_name LIKE ? OR affiliation LIKE ? LIMIT ? OFFSET ?',
      [`%${query}%`, `%${query}%`, limit, offset]
    );
    return rows;
  }

  static async getTopAuthors(limit = 10) {
    const [rows] = await pool.query(`
      SELECT a.*, COUNT(pa.paper_id) as paper_count
      FROM AUTHORS a
      LEFT JOIN PAPER_AUTHORS pa ON a.author_id = pa.author_id
      GROUP BY a.author_id
      ORDER BY a.h_index DESC, paper_count DESC
      LIMIT ?
    `, [limit]);
    return rows;
  }

  static async create(authorData) {
    const { full_name, affiliation, country, h_index = 0, email, researcher_url, biography } = authorData;
    const [result] = await pool.query(
      'INSERT INTO AUTHORS (full_name, affiliation, country, h_index, email, researcher_url, biography, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [full_name, affiliation, country, h_index, email, researcher_url, biography]
    );
    return result.insertId;
  }

  static async getStats() {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) as total_authors,
        AVG(h_index) as avg_h_index,
        MAX(h_index) as max_h_index
      FROM AUTHORS
    `);
    return rows[0];
  }
}

module.exports = Author;
