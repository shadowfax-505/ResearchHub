const Paper = require('../models/Paper');
const Job = require('../models/Job');
const { pool } = require('../config/database');

function isConnectionFailure(error) {
  return /NJS-503|NJS-500|ECONNREFUSED|connection.*(closed|lost|failed)|no listener/i.test(String(error?.message || error));
}

function listValue(value) {
  if (Array.isArray(value)) return value.flatMap(item => String(item).split(',')).filter(Boolean);
  return value ? String(value).split(',').filter(Boolean) : [];
}

function pageParams(req) {
  return {
    limit: Math.min(parseInt(req.query.limit, 10) || 20, 100),
    offset: Math.max(parseInt(req.query.offset, 10) || 0, 0)
  };
}

async function searchDirectory(table, columns, query, limit, offset, orderBy = columns[0]) {
  const pattern = `%${query}%`;
  const where = columns.map(column => `LOWER(${column}) LIKE LOWER(?)`).join(' OR ');
  const params = columns.map(() => pattern);
  const [rows] = await pool.query(`
    SELECT * FROM ${table}
    WHERE ${where}
    ORDER BY ${orderBy}
    OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
  `, [...params, offset, limit]);
  return rows;
}

class SearchController {
  static async search(req, res) {
    const { limit, offset } = pageParams(req);
    const query = String(req.query.q || req.query.query || '').trim();
    const type = String(req.query.type || 'publications').toLowerCase();
    try {
      let data;
      if (type === 'publications') {
        data = await Paper.search(query, {
          field_ids: listValue(req.query.field_id || req.query.field_ids),
          author_ids: listValue(req.query.author_id || req.query.author_ids),
          journal_ids: listValue(req.query.journal_id || req.query.journal_ids),
          year: req.query.year,
          year_from: req.query.year_from,
          year_to: req.query.year_to,
          publication_type: req.query.publication_type,
          is_peer_reviewed: req.query.is_peer_reviewed,
          is_open_access: req.query.is_open_access,
          language: req.query.language,
          min_citations: req.query.min_citations,
          max_citations: req.query.max_citations,
          has_full_text: req.query.has_full_text,
          sort: req.query.sort
        }, limit, offset);
      } else if (type === 'researchers') {
        data = await searchDirectory('USERS u LEFT JOIN RESEARCHER_PROFILES rp ON rp.user_id = u.user_id', ['u.full_name', 'u.username', 'u.affiliation', 'u.country'], query, limit, offset, 'u.full_name');
      } else if (type === 'authors') {
        data = await searchDirectory('AUTHORS', ['full_name', 'affiliation', 'country', 'biography'], query, limit, offset, 'full_name');
      } else if (type === 'journals') {
        data = await searchDirectory('JOURNALS', ['name', 'publisher', 'description'], query, limit, offset, 'name');
      } else if (type === 'topics') {
        const pattern = `%${query}%`;
        const [rows] = await pool.query(`
          SELECT 'field' AS entity_type, field_id AS entity_id, field_name AS name, description
          FROM RESEARCH_FIELDS
          WHERE LOWER(field_name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?)
          UNION ALL
          SELECT 'keyword' AS entity_type, keyword_id AS entity_id, keyword AS name, NULL AS description
          FROM KEYWORDS
          WHERE LOWER(keyword) LIKE LOWER(?)
          ORDER BY name
          OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        `, [pattern, pattern, pattern, offset, limit]);
        data = rows;
      } else if (type === 'questions') {
        data = await searchDirectory('QUESTIONS q JOIN USERS u ON u.user_id = q.user_id', ['q.title', 'q.body', 'q.category'], query, limit, offset, 'q.created_at DESC');
      } else if (type === 'jobs') {
        data = await Job.getAll(limit, offset, query, {
          career_level: req.query.career_level,
          remote_mode: req.query.remote_mode,
          employment_type: req.query.employment_type,
          country: req.query.country,
          location: req.query.location,
          discipline: req.query.discipline,
          sort: req.query.sort
        });
      } else if (type === 'projects') {
        data = await searchDirectory('PROJECTS', ['title', 'description'], query, limit, offset, 'created_at DESC');
      } else {
        return res.status(400).json({ error: 'Unsupported search type' });
      }

      return res.json({
        success: true,
        data,
        query,
        type,
        pagination: { limit, offset, has_more: data.length === limit }
      });
    } catch (error) {
      if (isConnectionFailure(error)) {
        return res.json({ success: true, source: 'demo', data: [], query, type, pagination: { limit, offset, has_more: false } });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  static async facets(req, res) {
    const query = String(req.query.q || '').trim();
    const pattern = `%${query}%`;
    try {
      const [fields, journals, types, languages, jobFilters] = await Promise.all([
        pool.query(`SELECT f.field_id AS id, f.field_name AS name, COUNT(p.paper_id) AS count
          FROM RESEARCH_FIELDS f LEFT JOIN PAPER_FIELDS pf ON pf.field_id = f.field_id
          LEFT JOIN RESEARCH_PAPERS p ON p.paper_id = pf.paper_id AND LOWER(p.title || ' ' || p.abstract) LIKE LOWER(?)
          GROUP BY f.field_id, f.field_name ORDER BY count DESC FETCH NEXT 30 ROWS ONLY`, [pattern]),
        pool.query(`SELECT j.journal_id AS id, j.name, COUNT(p.paper_id) AS count
          FROM JOURNALS j LEFT JOIN RESEARCH_PAPERS p ON p.journal_id = j.journal_id AND LOWER(p.title || ' ' || p.abstract) LIKE LOWER(?)
          GROUP BY j.journal_id, j.name ORDER BY count DESC FETCH NEXT 30 ROWS ONLY`, [pattern]),
        pool.query(`SELECT publication_type AS id, publication_type AS name, COUNT(*) AS count
          FROM RESEARCH_PAPERS WHERE LOWER(title || ' ' || abstract) LIKE LOWER(?) GROUP BY publication_type ORDER BY count DESC`, [pattern]),
        pool.query(`SELECT language AS id, language AS name, COUNT(*) AS count
          FROM RESEARCH_PAPERS WHERE LOWER(title || ' ' || abstract) LIKE LOWER(?) GROUP BY language ORDER BY count DESC`, [pattern]),
        Job.getFilters()
      ]);
      return res.json({
        success: true,
        data: {
          fields: fields[0],
          journals: journals[0],
          publication_types: types[0],
          languages: languages[0],
          job_facets: jobFilters
        }
      });
    } catch (error) {
      if (isConnectionFailure(error)) return res.json({ success: true, source: 'demo', data: { fields: [], journals: [], publication_types: [], languages: [], job_facets: {} } });
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = SearchController;
