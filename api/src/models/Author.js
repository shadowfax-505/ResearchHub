

const { pool } = require('../config/database');

class Author {
  static async findAll(limit = 20, offset = 0) {
    const [rows] = await pool.query(
      'SELECT author_id, full_name, affiliation, country, h_index, email, researcher_url, biography, created_at FROM AUTHORS ORDER BY author_id OFFSET ? ROWS FETCH NEXT ? ROWS ONLY',
      [offset, limit]
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
      'SELECT * FROM AUTHORS WHERE LOWER(full_name) LIKE LOWER(?) OR LOWER(affiliation) LIKE LOWER(?) ORDER BY author_id OFFSET ? ROWS FETCH NEXT ? ROWS ONLY',
      [`%${query}%`, `%${query}%`, offset, limit]
    );
    return rows;
  }

  static async getTopAuthors(limit = 10) {
    const [rows] = await pool.query(`
      SELECT a.*, COUNT(pa.paper_id) as paper_count
      FROM AUTHORS a
      LEFT JOIN PAPER_AUTHORS pa ON a.author_id = pa.author_id
      GROUP BY a.author_id, a.full_name, a.affiliation, a.country, a.email, a.h_index, a.biography, a.researcher_url, a.orcid, a.created_at, a.updated_at
      ORDER BY a.h_index DESC, paper_count DESC
      FETCH NEXT ? ROWS ONLY
    `, [limit]);
    return rows;
  }

  static async create(authorData) {
    const { full_name, affiliation, country, h_index = 0, email, researcher_url, biography, orcid } = authorData;
    const [result] = await pool.query(
      'INSERT INTO AUTHORS (full_name, affiliation, country, h_index, email, researcher_url, biography, orcid, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, SYSTIMESTAMP)',
      [full_name, affiliation, country, h_index, email, researcher_url, biography, orcid],
      { returnColumn: 'author_id' }
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

  static async requestClaim(userId, authorId) {
    const [result] = await pool.query(
      `INSERT INTO USER_AUTHOR_CLAIMS (user_id, author_id, status, created_at)
       VALUES (?, ?, 'pending', SYSTIMESTAMP)`,
      [userId, authorId],
      { returnColumn: 'claim_id' }
    );
    return result.insertId;
  }

  static async reviewClaim(claimId, reviewerId, status) {
    const [result] = await pool.query(
      `UPDATE USER_AUTHOR_CLAIMS
       SET status = ?, reviewed_by_user_id = ?, reviewed_at = SYSTIMESTAMP
       WHERE claim_id = ? AND status = 'pending'`,
      [status, reviewerId, claimId]
    );
    return result.affectedRows;
  }

  static async getClaims(limit = 20, offset = 0) {
    const [rows] = await pool.query(
      `SELECT c.claim_id, c.user_id, c.author_id, c.status, c.created_at,
              u.username, u.full_name AS user_full_name, a.full_name AS author_full_name
       FROM USER_AUTHOR_CLAIMS c
       JOIN USERS u ON u.user_id = c.user_id
       JOIN AUTHORS a ON a.author_id = c.author_id
       ORDER BY c.created_at DESC
       OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`,
      [offset, limit]
    );
    return rows;
  }
}

module.exports = Author;
