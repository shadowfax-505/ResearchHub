/**
 * Paper Model
 * Handles research paper database operations
 */

const pool = require('../config/database');

class Paper {
  static async search(query, filters = {}, limit = 20, offset = 0) {
    let sql = `
      SELECT p.*, j.name as journal_name 
      FROM RESEARCH_PAPERS p
      LEFT JOIN JOURNALS j ON p.journal_id = j.journal_id
      WHERE MATCH(p.title, p.abstract) AGAINST(? IN BOOLEAN MODE)
    `;
    const params = [query];

    if (filters.field_id) {
      sql += ' AND p.paper_id IN (SELECT paper_id FROM PAPER_FIELDS WHERE field_id = ?)';
      params.push(filters.field_id);
    }

    if (filters.year) {
      sql += ' AND YEAR(p.publication_date) = ?';
      params.push(filters.year);
    }

    if (filters.journal_id) {
      sql += ' AND p.journal_id = ?';
      params.push(filters.journal_id);
    }

    sql += ' ORDER BY p.citation_count DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  static async findById(paperId) {
    const [rows] = await pool.query(
      'SELECT * FROM RESEARCH_PAPERS WHERE paper_id = ?',
      [paperId]
    );
    if (rows.length === 0) return null;

    const paper = rows[0];
    
    // Get authors
    const [authors] = await pool.query(`
      SELECT a.* FROM AUTHORS a
      JOIN PAPER_AUTHORS pa ON a.author_id = pa.author_id
      WHERE pa.paper_id = ?
      ORDER BY pa.author_order
    `, [paperId]);
    paper.authors = authors;

    // Get keywords
    const [keywords] = await pool.query(`
      SELECT k.* FROM KEYWORDS k
      JOIN PAPER_KEYWORDS pk ON k.keyword_id = pk.keyword_id
      WHERE pk.paper_id = ?
    `, [paperId]);
    paper.keywords = keywords;

    // Get fields
    const [fields] = await pool.query(`
      SELECT f.*, pf.relevance_score FROM RESEARCH_FIELDS f
      JOIN PAPER_FIELDS pf ON f.field_id = pf.field_id
      WHERE pf.paper_id = ?
    `, [paperId]);
    paper.fields = fields;

    return paper;
  }

  static async getTopCited(limit = 10) {
    const [rows] = await pool.query(`
      SELECT paper_id, title, citation_count, publication_date, view_count
      FROM RESEARCH_PAPERS
      ORDER BY citation_count DESC
      LIMIT ?
    `, [limit]);
    return rows;
  }

  static async getTrending(days = 30, limit = 10) {
    const [rows] = await pool.query(`
      SELECT p.paper_id, p.title, p.citation_count, COUNT(ua.activity_id) as recent_activity
      FROM RESEARCH_PAPERS p
      LEFT JOIN USER_ACTIVITY ua ON p.paper_id = ua.paper_id 
        AND ua.activity_timestamp > DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY p.paper_id
      ORDER BY recent_activity DESC
      LIMIT ?
    `, [days, limit]);
    return rows;
  }

  static async create(paperData) {
    const { journal_id, title, abstract, doi, publication_date, volume, issue, pages, pdf_url, language = 'en', is_peer_reviewed = true } = paperData;
    const [result] = await pool.query(
      `INSERT INTO RESEARCH_PAPERS (journal_id, title, abstract, doi, publication_date, volume, issue, pages, pdf_url, language, is_peer_reviewed, citation_count, view_count, download_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, NOW())`,
      [journal_id, title, abstract, doi, publication_date, volume, issue, pages, pdf_url, language, is_peer_reviewed]
    );
    return result.insertId;
  }

  static async incrementViews(paperId) {
    const [result] = await pool.query(
      'UPDATE RESEARCH_PAPERS SET view_count = view_count + 1 WHERE paper_id = ?',
      [paperId]
    );
    return result.affectedRows;
  }

  static async incrementDownloads(paperId) {
    const [result] = await pool.query(
      'UPDATE RESEARCH_PAPERS SET download_count = download_count + 1 WHERE paper_id = ?',
      [paperId]
    );
    return result.affectedRows;
  }

  static async getStats() {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) as total_papers,
        AVG(citation_count) as avg_citations,
        MAX(citation_count) as max_citations,
        SUM(view_count) as total_views
      FROM RESEARCH_PAPERS
    `);
    return rows[0];
  }
}

module.exports = Paper;
