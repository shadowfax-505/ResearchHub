

const { pool } = require('../config/database');

class Journal {
  static async findAll(limit = 20, offset = 0) {
    const [rows] = await pool.query(
      'SELECT * FROM JOURNALS ORDER BY journal_id OFFSET ? ROWS FETCH NEXT ? ROWS ONLY',
      [offset, limit]
    );
    return rows;
  }

  static async findById(journalId) {
    const [rows] = await pool.query(
      'SELECT * FROM JOURNALS WHERE journal_id = ?',
      [journalId]
    );
    if (rows.length === 0) return null;

    const journal = rows[0];
    const [papers] = await pool.query(
      'SELECT * FROM RESEARCH_PAPERS WHERE journal_id = ? ORDER BY publication_date DESC FETCH NEXT 100 ROWS ONLY',
      [journalId]
    );
    journal.papers = papers;

    return journal;
  }

  static async search(query, limit = 20, offset = 0) {
    const [rows] = await pool.query(
      'SELECT * FROM JOURNALS WHERE LOWER(name) LIKE LOWER(?) OR LOWER(publisher) LIKE LOWER(?) ORDER BY journal_id OFFSET ? ROWS FETCH NEXT ? ROWS ONLY',
      [`%${query}%`, `%${query}%`, offset, limit]
    );
    return rows;
  }

  static async getTopJournals(limit = 10) {
    const [rows] = await pool.query(`
      SELECT j.*, COUNT(p.paper_id) as paper_count
      FROM JOURNALS j
      LEFT JOIN RESEARCH_PAPERS p ON j.journal_id = p.journal_id
      GROUP BY j.journal_id, j.name, j.issn, j.publisher, j.impact_factor, j.h_index, j.quartile, j.website, j.description, j.created_at, j.updated_at
      ORDER BY j.impact_factor DESC
      FETCH NEXT ? ROWS ONLY
    `, [limit]);
    return rows;
  }

  static async getStats() {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) as total_journals,
        AVG(impact_factor) as avg_impact_factor,
        MAX(impact_factor) as max_impact_factor
      FROM JOURNALS
    `);
    return rows[0];
  }
}

module.exports = Journal;
