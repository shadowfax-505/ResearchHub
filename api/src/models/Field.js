/**
 * Field Model
 * Handles research field taxonomy and operations
 */

const pool = require('../config/database');

class Field {
  static async findAll() {
    const [rows] = await pool.query(
      'SELECT * FROM RESEARCH_FIELDS ORDER BY parent_field_id, field_name'
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
    
    // Get child fields
    const [children] = await pool.query(
      'SELECT * FROM RESEARCH_FIELDS WHERE parent_field_id = ?',
      [fieldId]
    );
    field.children = children;

    // Get parent field
    if (field.parent_field_id) {
      const [parent] = await pool.query(
        'SELECT * FROM RESEARCH_FIELDS WHERE field_id = ?',
        [field.parent_field_id]
      );
      field.parent = parent[0];
    }

    // Get papers in this field
    const [papers] = await pool.query(
      'SELECT p.* FROM RESEARCH_PAPERS p JOIN PAPER_FIELDS pf ON p.paper_id = pf.paper_id WHERE pf.field_id = ? LIMIT 100',
      [fieldId]
    );
    field.papers = papers;

    return field;
  }

  static async search(query, limit = 20, offset = 0) {
    const [rows] = await pool.query(
      'SELECT * FROM RESEARCH_FIELDS WHERE field_name LIKE ? LIMIT ? OFFSET ?',
      [`%${query}%`, limit, offset]
    );
    return rows;
  }

  static async getHierarchy() {
    const [rows] = await pool.query(
      'SELECT * FROM RESEARCH_FIELDS ORDER BY parent_field_id, field_name'
    );
    return this.buildHierarchy(rows);
  }

  static buildHierarchy(rows) {
    const map = {};
    const roots = [];

    // Create map for easy lookup
    rows.forEach(row => {
      map[row.field_id] = { ...row, children: [] };
    });

    // Build hierarchy
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
