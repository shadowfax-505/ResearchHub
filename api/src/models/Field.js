

const { pool } = require('../config/database');

class Field {
  static async findAll() {
    const [rows] = await pool.query(
      'SELECT * FROM RESEARCH_FIELDS ORDER BY parent_field_id NULLS FIRST, field_name'
    );
    return this.buildHierarchy(rows);
  }

  static async findById(fieldId) {
    const [rows] = await pool.query(
      'SELECT * FROM RESEARCH_FIELDS WHERE field_id = ?',
      [fieldId]
    );
    if (rows.length === 0) return null;

    const field = rows[0];
    const [children] = await pool.query(
      'SELECT * FROM RESEARCH_FIELDS WHERE parent_field_id = ?',
      [fieldId]
    );
    field.children = children;

    if (field.parent_field_id) {
      const [parent] = await pool.query(
        'SELECT * FROM RESEARCH_FIELDS WHERE field_id = ?',
        [field.parent_field_id]
      );
      field.parent = parent[0];
    }

    const [papers] = await pool.query(
      'SELECT p.* FROM RESEARCH_PAPERS p JOIN PAPER_FIELDS pf ON p.paper_id = pf.paper_id WHERE pf.field_id = ? FETCH NEXT 100 ROWS ONLY',
      [fieldId]
    );
    field.papers = papers;

    return field;
  }

  static async search(query, limit = 20, offset = 0) {
    const [rows] = await pool.query(
      'SELECT * FROM RESEARCH_FIELDS WHERE LOWER(field_name) LIKE LOWER(?) ORDER BY field_name OFFSET ? ROWS FETCH NEXT ? ROWS ONLY',
      [`%${query}%`, offset, limit]
    );
    return rows;
  }

  static async getHierarchy() {
    const [rows] = await pool.query(
      'SELECT * FROM RESEARCH_FIELDS ORDER BY parent_field_id NULLS FIRST, field_name'
    );
    return this.buildHierarchy(rows);
  }

  static buildHierarchy(rows) {
    const map = {};
    const roots = [];

    rows.forEach(row => {
      map[row.field_id] = { ...row, children: [] };
    });

    rows.forEach(row => {
      if (row.parent_field_id && map[row.parent_field_id]) {
        map[row.parent_field_id].children.push(map[row.field_id]);
      } else {
        roots.push(map[row.field_id]);
      }
    });

    return roots;
  }

  static async getStats() {
    const [rows] = await pool.query(`
      SELECT COUNT(*) as total_fields FROM RESEARCH_FIELDS
    `);
    return rows[0];
  }
}

module.exports = Field;
