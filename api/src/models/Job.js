const { pool } = require('../config/database');

function list(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || '').split(',').map(item => item.trim()).filter(Boolean);
}

function addIn(sql, params, column, values) {
  if (!values.length) return sql;
  sql += ` AND ${column} IN (${values.map(() => '?').join(',')})`;
  params.push(...values);
  return sql;
}

class Job {
  static buildWhere(query, filters = {}) {
    let sql = 'FROM JOBS j LEFT JOIN USERS u ON j.posted_by = u.user_id LEFT JOIN INSTITUTIONS i ON i.institution_id = j.institution_id WHERE NVL(j.status, \'ACTIVE\') IN (\'ACTIVE\', \'PUBLISHED\', \'OPEN\', \'APPROVED\')';
    const params = [];
    if (query) {
      const term = `%${String(query).trim().toLowerCase()}%`;
      sql += ' AND (LOWER(j.title) LIKE ? OR LOWER(j.employer) LIKE ? OR LOWER(j.discipline) LIKE ? OR LOWER(j.location) LIKE ? OR LOWER(TO_CHAR(j.description)) LIKE ? OR LOWER(TO_CHAR(j.requirements)) LIKE ?)';
      params.push(term, term, term, term, term, term);
    }
    const employment = list(filters.employment_type);
    const countries = list(filters.country);
    const disciplines = list(filters.discipline);
    const remoteModes = list(filters.remote_mode);
    const careerLevels = list(filters.career_level);
    sql = addIn(sql, params, 'j.employment_type', employment);
    sql = addIn(sql, params, 'j.country', countries);
    sql = addIn(sql, params, 'j.discipline', disciplines);
    sql = addIn(sql, params, 'j.remote_mode', remoteModes);
    sql = addIn(sql, params, 'j.career_level', careerLevels);
    if (filters.location) { sql += ' AND LOWER(j.location) LIKE ?'; params.push(`%${String(filters.location).toLowerCase()}%`); }
    if (filters.institution_id) { sql += ' AND j.institution_id = ?'; params.push(Number(filters.institution_id)); }
    if (filters.posted_after) { sql += ' AND j.posted_at >= TO_TIMESTAMP(?, \'YYYY-MM-DD\')'; params.push(filters.posted_after); }
    if (filters.posted_before) { sql += ' AND j.posted_at < TO_TIMESTAMP(?, \'YYYY-MM-DD\') + INTERVAL \'1\' DAY'; params.push(filters.posted_before); }
    return { sql, params };
  }

  static async getAll(limit = 20, offset = 0, query = '', filters = {}) {
    const where = this.buildWhere(query, filters);
    const sort = filters.sort === 'oldest' ? 'j.posted_at ASC' : 'j.posted_at DESC';
    const [rows] = await pool.query(`SELECT j.*, u.full_name posted_by_name, i.name institution_name, i.logo_url ${where.sql} ORDER BY ${sort}, j.job_id DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`, [...where.params, offset, limit]);
    return rows;
  }

  static async getCount(query = '', filters = {}) {
    const where = this.buildWhere(query, filters);
    const [rows] = await pool.query(`SELECT COUNT(*) total ${where.sql}`, where.params);
    return Number(rows[0]?.total || 0);
  }

  static async getById(id) {
    const [rows] = await pool.query(`SELECT j.*, u.full_name posted_by_name, u.affiliation posted_by_affiliation, i.name institution_name, i.logo_url ${this.buildWhere('').sql} AND j.job_id = ?`, [...this.buildWhere('').params, id]);
    return rows[0];
  }

  static async create(jobData) {
    const [result] = await pool.query('INSERT INTO JOBS (employer, title, location, description, requirements, salary_range, employment_type, posted_by, country, discipline, remote_mode, career_level, status, posted_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, \'PUBLISHED\', SYSTIMESTAMP, SYSTIMESTAMP)', [jobData.employer, jobData.title, jobData.location, jobData.description, jobData.requirements, jobData.salary_range, jobData.employment_type || 'Full-time', jobData.posted_by, jobData.country || null, jobData.discipline || null, jobData.remote_mode || 'on_site', jobData.career_level || null], { returnColumn: 'job_id' });
    return result.insertId;
  }

  static async getSavedJobs(userId, limit = 20, offset = 0) {
    const [rows] = await pool.query('SELECT j.*, u.full_name posted_by_name, sj.saved_at FROM SAVED_JOBS sj JOIN JOBS j ON sj.job_id = j.job_id LEFT JOIN USERS u ON j.posted_by = u.user_id WHERE sj.user_id = ? ORDER BY sj.saved_at DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY', [userId, offset, limit]);
    return rows;
  }

  static async getFilters() {
    const [countries] = await pool.query('SELECT country name, COUNT(*) count FROM JOBS WHERE country IS NOT NULL AND NVL(status, \'ACTIVE\') IN (\'ACTIVE\', \'PUBLISHED\', \'OPEN\', \'APPROVED\') GROUP BY country ORDER BY count DESC');
    const [disciplines] = await pool.query('SELECT discipline name, COUNT(*) count FROM JOBS WHERE discipline IS NOT NULL AND NVL(status, \'ACTIVE\') IN (\'ACTIVE\', \'PUBLISHED\', \'OPEN\', \'APPROVED\') GROUP BY discipline ORDER BY count DESC');
    const [employment_types] = await pool.query('SELECT employment_type name, COUNT(*) count FROM JOBS WHERE employment_type IS NOT NULL AND NVL(status, \'ACTIVE\') IN (\'ACTIVE\', \'PUBLISHED\', \'OPEN\', \'APPROVED\') GROUP BY employment_type ORDER BY count DESC');
    const [remote_modes] = await pool.query('SELECT remote_mode name, COUNT(*) count FROM JOBS WHERE remote_mode IS NOT NULL AND NVL(status, \'ACTIVE\') IN (\'ACTIVE\', \'PUBLISHED\', \'OPEN\', \'APPROVED\') GROUP BY remote_mode ORDER BY count DESC');
    const [career_levels] = await pool.query('SELECT career_level name, COUNT(*) count FROM JOBS WHERE career_level IS NOT NULL AND NVL(status, \'ACTIVE\') IN (\'ACTIVE\', \'PUBLISHED\', \'OPEN\', \'APPROVED\') GROUP BY career_level ORDER BY count DESC');
    const [institutions] = await pool.query('SELECT i.institution_id id, i.name, COUNT(*) count FROM JOBS j JOIN INSTITUTIONS i ON i.institution_id = j.institution_id WHERE NVL(j.status, \'ACTIVE\') IN (\'ACTIVE\', \'PUBLISHED\', \'OPEN\', \'APPROVED\') GROUP BY i.institution_id, i.name ORDER BY count DESC');
    return { countries, disciplines, employment_types, remote_modes, career_levels, institutions };
  }

  static async saveJob(userId, jobId) {
    try { await pool.query('INSERT INTO SAVED_JOBS (user_id, job_id) VALUES (?, ?)', [userId, jobId]); return true; }
    catch (e) { if (e.message.includes('ORA-00001')) return false; throw e; }
  }

  static async unsaveJob(userId, jobId) { await pool.query('DELETE FROM SAVED_JOBS WHERE user_id = ? AND job_id = ?', [userId, jobId]); return true; }
}

module.exports = Job;
