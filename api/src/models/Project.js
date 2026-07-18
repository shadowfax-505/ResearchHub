const { pool } = require('../config/database');

class Project {
  static async create(userId, title, description) {
    const [result] = await pool.query(
      `INSERT INTO PROJECTS (user_id, title, description, status, created_at)
       VALUES (?, ?, ?, 'active', SYSTIMESTAMP)`,
      [userId, title, description],
      { returnColumn: 'project_id' }
    );
    return result.insertId;
  }

  static async findAllPublic() {
    const [rows] = await pool.query(`
      SELECT p.project_id, p.user_id, p.title, TO_CHAR(p.description) as description, p.status, p.created_at,
             u.username, u.full_name
      FROM PROJECTS p
      JOIN USERS u ON p.user_id = u.user_id
      WHERE p.status = 'active'
      ORDER BY p.created_at DESC
    `);
    return rows;
  }

  static async findByUser(userId) {
    const [rows] = await pool.query(`
      SELECT project_id, user_id, title, TO_CHAR(description) as description, status, created_at
      FROM PROJECTS
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [userId]);
    return rows;
  }

  static async updateStatus(projectId, userId, status) {
    const [result] = await pool.query(
      'UPDATE PROJECTS SET status = ? WHERE project_id = ? AND user_id = ?',
      [status, projectId, userId]
    );
    return result.affectedRows;
  }
}

module.exports = Project;
