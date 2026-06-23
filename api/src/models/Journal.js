/**
 * Journal Model
 * Handles journal-related database operations
 */

const pool = require('../config/database');

class Journal {
  static async findAll(limit = 20, offset = 0) {
    const [rows] = await pool.query(
      'SELECT * FROM JOURNALS LIMIT ? OFFSET ?',
      [limit, offset]
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
    
    // Get papers published in this journal
    const [papers] = await pool.query(
      'SELECT * FROM RESEARCH_PAPERS WHERE journal_id = ? ORDER BY publication_date DESC LIMIT 100',
      [journalId]
    );
    journal.papers = papers;

    return journal;
  }

  static async search(query, limit = 20, offset = 0) {
    const [rows] = await pool.query(
      'SELECT * FROM JOURNALS WHERE name LIKE ? OR publisher LIKE ? LIMIT ? OFFSET ?',
      [`%${query}%`, `%${query}%`, limit, offset]
    );
    return rows;
  }

  static async getTopJournals(limit = 10) {
    const [rows] = await pool.query(`
      SELECT j.*, COUNT(p.paper_id) as paper_count
      FROM JOURNALS j
      LEFT JOIN RESEARCH_PAPERS p ON j.journal_id = p.journal_id
      GROUP BY j.journal_id
      ORDER BY j.impact_factor DESC
      LIMIT ?
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
