

const { pool } = require('../config/database');
const Author = require('./Author');

class Paper {
  static async getByAuthor(authorId, limit = 20, offset = 0) {
    const sql = `
      SELECT p.*, j.name as journal_name 
      FROM RESEARCH_PAPERS p
      LEFT JOIN JOURNALS j ON p.journal_id = j.journal_id
      WHERE p.paper_id IN (
        SELECT pa.paper_id 
        FROM PAPER_AUTHORS pa
        LEFT JOIN USER_AUTHOR_CLAIMS c ON pa.author_id = c.author_id AND c.status = 'verified'
        WHERE c.user_id = ? OR pa.author_id = ?
      )
      ORDER BY p.publication_date DESC
      OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    `;
    const params = [authorId, authorId, offset, limit];
    const [rows] = await pool.query(sql, params);
    return rows;
  }

  static async attachAuthors(rows) {
    if (!rows.length) return rows;
    const ids = rows.map(row => row.paper_id);
    const placeholders = ids.map(() => '?').join(', ');
    const [authors] = await pool.query(`
      SELECT pa.paper_id, pa.author_order, a.author_id, a.full_name, a.affiliation, a.country, a.orcid,
             uac.user_id AS claimed_user_id, rp.slug AS claimed_profile_slug,
             rp.headline AS claimed_profile_headline
      FROM PAPER_AUTHORS pa
      JOIN AUTHORS a ON a.author_id = pa.author_id
      LEFT JOIN USER_AUTHOR_CLAIMS uac ON uac.author_id = a.author_id AND uac.status = 'verified'
      LEFT JOIN RESEARCHER_PROFILES rp ON rp.user_id = uac.user_id
      WHERE pa.paper_id IN (${placeholders})
      ORDER BY pa.paper_id, pa.author_order
    `, ids);
    const byPaper = new Map();
    for (const author of authors) {
      if (!byPaper.has(author.paper_id)) byPaper.set(author.paper_id, []);
      byPaper.get(author.paper_id).push({
        author_id: author.author_id,
        author_order: author.author_order,
        full_name: author.full_name,
        affiliation: author.affiliation,
        country: author.country,
        orcid: author.orcid,
        claimed_user_id: author.claimed_user_id,
        claimed_profile_slug: author.claimed_profile_slug,
        claimed_profile_headline: author.claimed_profile_headline,
        is_claimed: Boolean(author.claimed_user_id)
      });
    }
    return rows.map(row => ({ ...row, authors: byPaper.get(row.paper_id) || [] }));
  }

  static async search(query = '', filters = {}, limit = 20, offset = 0) {
    const normalizedQuery = String(query || '').trim();
    const conditions = ["NVL(p.status, 'published') = 'published'", "NVL(p.visibility, 'public') = 'public'"];
    const params = [];
    if (normalizedQuery) {
      const oracleSafeQuery = `{${normalizedQuery.replace(/[{}]/g, '')}}`;
      conditions.push('(CONTAINS(p.title, ?, 1) > 0 OR CONTAINS(p.abstract, ?, 2) > 0 OR LOWER(p.title) LIKE LOWER(?) OR LOWER(p.abstract) LIKE LOWER(?))');
      params.push(oracleSafeQuery, oracleSafeQuery, `%${normalizedQuery}%`, `%${normalizedQuery}%`);
    }

    const addInFilter = (column, values) => {
      const list = (Array.isArray(values) ? values : [values]).filter(value => value !== undefined && value !== null && value !== '');
      if (!list.length) return;
      conditions.push(`${column} IN (${list.map(() => '?').join(', ')})`);
      params.push(...list.map(value => Number(value)));
    };

    const fieldIds = filters.field_ids || filters.field_id;
    if (fieldIds !== undefined && fieldIds !== null && fieldIds !== '') {
      const list = (Array.isArray(fieldIds) ? fieldIds : [fieldIds]).filter(Boolean);
      if (list.length) {
      conditions.push(`p.paper_id IN (SELECT paper_id FROM PAPER_FIELDS WHERE field_id IN (${list.map(() => '?').join(', ')}))`);
      params.push(...list.map(value => Number(value)));
      }
    }
    const authorIds = filters.author_ids || filters.author_id;
    if (authorIds !== undefined && authorIds !== null && authorIds !== '') {
      const list = (Array.isArray(authorIds) ? authorIds : [authorIds]).filter(Boolean);
      if (list.length) {
      conditions.push(`p.paper_id IN (SELECT paper_id FROM PAPER_AUTHORS WHERE author_id IN (${list.map(() => '?').join(', ')}))`);
      params.push(...list.map(value => Number(value)));
      }
    }
    const journalIds = filters.journal_ids || filters.journal_id;
    if (journalIds) addInFilter('p.journal_id', journalIds);
    if (filters.year) {
      conditions.push('EXTRACT(YEAR FROM p.publication_date) = ?');
      params.push(Number(filters.year));
    }
    if (filters.year_from) {
      conditions.push('EXTRACT(YEAR FROM p.publication_date) >= ?');
      params.push(Number(filters.year_from));
    }
    if (filters.year_to) {
      conditions.push('EXTRACT(YEAR FROM p.publication_date) <= ?');
      params.push(Number(filters.year_to));
    }
    if (filters.publication_type) {
      conditions.push('LOWER(p.publication_type) = LOWER(?)');
      params.push(filters.publication_type);
    }
    if (filters.is_peer_reviewed !== undefined && filters.is_peer_reviewed !== '') {
      conditions.push('p.is_peer_reviewed = ?');
      params.push(Number(filters.is_peer_reviewed) ? 1 : 0);
    }
    if (filters.is_open_access !== undefined && filters.is_open_access !== '') {
      conditions.push('p.is_open_access = ?');
      params.push(Number(filters.is_open_access) ? 1 : 0);
    }
    if (filters.language) {
      conditions.push('LOWER(p.language) = LOWER(?)');
      params.push(filters.language);
    }
    if (filters.min_citations !== undefined && filters.min_citations !== '') {
      conditions.push('p.citation_count >= ?');
      params.push(Number(filters.min_citations));
    }
    if (filters.max_citations !== undefined && filters.max_citations !== '') {
      conditions.push('p.citation_count <= ?');
      params.push(Number(filters.max_citations));
    }
    if (filters.has_full_text !== undefined && filters.has_full_text !== '') {
      conditions.push("EXISTS (SELECT 1 FROM PAPER_FILES pf WHERE pf.paper_id = p.paper_id AND pf.status = 'available')");
    }

    const sortMap = {
      relevance: 'p.citation_count DESC, p.publication_date DESC',
      newest: 'p.publication_date DESC, p.paper_id DESC',
      citations: 'p.citation_count DESC, p.paper_id DESC',
      reads: 'p.view_count DESC, p.paper_id DESC',
      downloads: 'p.download_count DESC, p.paper_id DESC'
    };
    const orderBy = sortMap[filters.sort] || sortMap.relevance;
    const baseSql = `
      SELECT p.*, j.name AS journal_name
      FROM RESEARCH_PAPERS p
      LEFT JOIN JOURNALS j ON p.journal_id = j.journal_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${orderBy}
      OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    `;
    const pageParams = [...params, Number(offset) || 0, Math.min(Number(limit) || 20, 100)];
    try {
      const [rows] = await pool.query(baseSql, pageParams);
      return this.attachAuthors(rows);
    } catch (error) {
      if (!normalizedQuery || !/ORA-20000|CONTAINS|text/i.test(String(error.message))) throw error;
      const likeConditions = conditions.filter(condition => !condition.includes('CONTAINS'));
      const likeIndex = likeConditions.findIndex(condition => condition.includes('LOWER(p.title) LIKE'));
      if (likeIndex >= 0) likeConditions.splice(likeIndex, 1);
      likeConditions.unshift('(LOWER(p.title) LIKE LOWER(?) OR LOWER(p.abstract) LIKE LOWER(?))');
      const fallbackParams = [`%${normalizedQuery}%`, `%${normalizedQuery}%`, ...params.slice(4), Number(offset) || 0, Math.min(Number(limit) || 20, 100)];
      const [rows] = await pool.query(`
        SELECT p.*, j.name AS journal_name
        FROM RESEARCH_PAPERS p
        LEFT JOIN JOURNALS j ON p.journal_id = j.journal_id
        WHERE ${likeConditions.join(' AND ')}
        ORDER BY ${orderBy}
        OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
      `, fallbackParams);
      return this.attachAuthors(rows);
    }
  }

  static async findById(paperId) {
    const [rows] = await pool.query(
      'SELECT * FROM RESEARCH_PAPERS WHERE paper_id = ?',
      [paperId]
    );
    if (rows.length === 0) return null;

    const paper = rows[0];
    const [authors] = await pool.query(`
      SELECT a.* FROM AUTHORS a
      JOIN PAPER_AUTHORS pa ON a.author_id = pa.author_id
      WHERE pa.paper_id = ?
      ORDER BY pa.author_order
    `, [paperId]);
    paper.authors = authors;

    const [keywords] = await pool.query(`
      SELECT k.* FROM KEYWORDS k
      JOIN PAPER_KEYWORDS pk ON k.keyword_id = pk.keyword_id
      WHERE pk.paper_id = ?
    `, [paperId]);
    paper.keywords = keywords;

    const [fields] = await pool.query(`
      SELECT f.*, pf.relevance_score FROM RESEARCH_FIELDS f
      JOIN PAPER_FIELDS pf ON f.field_id = pf.field_id
      WHERE pf.paper_id = ?
    `, [paperId]);
    paper.fields = fields;

    const [files] = await pool.query(
      `SELECT file_id, original_name, mime_type, size_bytes, visibility, created_at
       FROM PAPER_FILES
       WHERE paper_id = ? AND status = 'available'
       ORDER BY created_at DESC`,
      [paperId]
    );
    paper.files = files;

    return paper;
  }

  static async getTopCited(limit = 10) {
    const [rows] = await pool.query(`
      SELECT p.paper_id, p.title, p.abstract, p.citation_count, p.publication_date, p.view_count,
             j.name AS journal_name
      FROM RESEARCH_PAPERS p
      LEFT JOIN JOURNALS j ON p.journal_id = j.journal_id
      ORDER BY p.citation_count DESC
      FETCH NEXT ? ROWS ONLY
    `, [limit]);
    return rows;
  }

  static async getTrending(days = 30, limit = 10) {
    const [rows] = await pool.query(`
      SELECT p.paper_id, p.title, p.citation_count, COUNT(ua.activity_id) as recent_activity
      FROM RESEARCH_PAPERS p
      LEFT JOIN USER_ACTIVITY ua ON p.paper_id = ua.paper_id 
        AND ua.activity_timestamp > SYSTIMESTAMP - NUMTODSINTERVAL(?, 'DAY')
      GROUP BY p.paper_id, p.title, p.citation_count
      ORDER BY recent_activity DESC
      FETCH NEXT ? ROWS ONLY
    `, [days, limit]);
    return rows;
  }

  static async getFeed(userId, limit = 20) {
    const [rows] = await pool.query(`
      SELECT p.*, j.name as journal_name
      FROM RESEARCH_PAPERS p
      LEFT JOIN JOURNALS j ON p.journal_id = j.journal_id
      WHERE p.paper_id IN (
        SELECT pa.paper_id
        FROM PAPER_AUTHORS pa
        JOIN FOLLOWED_AUTHORS fa ON pa.author_id = fa.author_id
        WHERE fa.user_id = ?
      )
      ORDER BY p.publication_date DESC
      FETCH NEXT ? ROWS ONLY
    `, [userId, limit]);
    
    // If no feed items (e.g. following no one), just return top cited
    if (rows.length === 0) {
      return this.getTopCited(limit);
    }
    return rows;
  }

  static async create(paperData) {
    const {
      journal_id,
      title,
      abstract,
      doi,
      publication_date,
      volume,
      issue,
      pages,
      pdf_url,
      cover_image_url,
      language = 'English',
      is_peer_reviewed = true,
      publication_type = 'article',
      is_open_access = false,
      visibility = 'public',
      status = 'published'
    } = paperData;
    const [result] = await pool.query(
      `INSERT INTO RESEARCH_PAPERS (journal_id, title, abstract, doi, publication_date, volume, issue, pages, pdf_url, cover_image_url, language, is_peer_reviewed, citation_count, view_count, download_count, status, visibility, publication_type, is_open_access, created_at, updated_at)
       VALUES (?, ?, ?, ?, TO_DATE(?, 'YYYY-MM-DD'), ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?, ?, SYSTIMESTAMP, SYSTIMESTAMP)`,
      [journal_id ?? null, title, abstract, doi, publication_date, volume, issue, pages, pdf_url, cover_image_url, language, is_peer_reviewed ? 1 : 0, status, visibility, publication_type, is_open_access ? 1 : 0],
      { returnColumn: 'paper_id' }
    );
    return result.insertId;
  }

  static async attachAuthorsToPaper(paperId, authorEntries = []) {
    for (const [index, entry] of authorEntries.entries()) {
      const fullName = String(entry.full_name || entry.name || '').trim();
      if (!entry.author_id && !fullName) continue;
      let authorId = Number(entry.author_id) || null;
      if (!authorId) {
        const [matches] = await pool.query(
          `SELECT author_id FROM AUTHORS
           WHERE LOWER(full_name) = LOWER(?)
             AND NVL(LOWER(affiliation), '') = NVL(LOWER(?), '')
           FETCH NEXT 1 ROWS ONLY`,
          [fullName, entry.affiliation || null]
        );
        authorId = matches[0]?.author_id || await Author.create({
          full_name: fullName,
          affiliation: entry.affiliation || null,
          country: entry.country || null,
          email: entry.email || null,
          orcid: entry.orcid || null,
          biography: null
        });
      }
      try {
        await pool.query(
          'INSERT INTO PAPER_AUTHORS (paper_id, author_id, author_order) VALUES (?, ?, ?)',
          [paperId, authorId, Number(entry.author_order) || index + 1]
        );
      } catch (error) {
        if (!/ORA-00001/.test(String(error.message))) throw error;
      }
    }
  }

  static async incrementViews(paperId) {
    const [result] = await pool.query(
      'UPDATE RESEARCH_PAPERS SET view_count = view_count + 1, updated_at = SYSTIMESTAMP WHERE paper_id = ?',
      [paperId]
    );
    return result.affectedRows;
  }

  static async incrementDownloads(paperId) {
    const [result] = await pool.query(
      'UPDATE RESEARCH_PAPERS SET download_count = download_count + 1, updated_at = SYSTIMESTAMP WHERE paper_id = ?',
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

  static async getTrendingFields(limit = 5) {
    const [rows] = await pool.query(`
      SELECT f.field_id, f.field_name, COUNT(pf.paper_id) AS paper_count
      FROM RESEARCH_FIELDS f
      JOIN PAPER_FIELDS pf ON f.field_id = pf.field_id
      GROUP BY f.field_id, f.field_name
      ORDER BY paper_count DESC
      FETCH NEXT ? ROWS ONLY
    `, [limit]);
    return rows;
  }

  static async recommend(paperId, userId) {
    try {
      const [result] = await pool.query(
        'INSERT INTO PAPER_RECOMMENDATIONS (paper_id, user_id, created_at) VALUES (?, ?, SYSTIMESTAMP)',
        [paperId, userId]
      );
      return result.affectedRows;
    } catch (err) {
      if (err.message.includes('ORA-00001')) return 1; // Unique constraint violation - already recommended
      throw err;
    }
  }

  static async unrecommend(paperId, userId) {
    const [result] = await pool.query(
      'DELETE FROM PAPER_RECOMMENDATIONS WHERE paper_id = ? AND user_id = ?',
      [paperId, userId]
    );
    return result.affectedRows;
  }

  static async hasRecommended(paperId, userId) {
    const [rows] = await pool.query(
      'SELECT 1 FROM PAPER_RECOMMENDATIONS WHERE paper_id = ? AND user_id = ?',
      [paperId, userId]
    );
    return rows.length > 0;
  }
}

module.exports = Paper;
