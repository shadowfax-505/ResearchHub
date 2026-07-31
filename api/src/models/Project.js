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

  static async addUpdate(projectId, userId, body) {
    // Verify user is owner/member first (or just insert directly as project lead)
    const [rows] = await pool.query('SELECT user_id FROM PROJECTS WHERE project_id = ?', [projectId]);
    if (!rows || rows.length === 0) throw new Error('Project not found');
    if (rows[0].user_id !== userId) throw new Error('Unauthorized to post updates on this project');

    const [result] = await pool.query(
      'INSERT INTO PROJECT_UPDATES (project_id, user_id, body, created_at) VALUES (?, ?, ?, SYSTIMESTAMP)',
      [projectId, userId, body],
      { returnColumn: 'update_id' }
    );
    return result.insertId;
  }

  static async findUpdatesByProject(projectId) {
    const [rows] = await pool.query(`
      SELECT pu.update_id, pu.project_id, pu.user_id, TO_CHAR(pu.body) as body, pu.created_at,
             u.username, u.full_name
      FROM PROJECT_UPDATES pu
      JOIN USERS u ON u.user_id = pu.user_id
      WHERE pu.project_id = ?
      ORDER BY pu.created_at DESC
    `, [projectId]);
    return rows;
  }
}

module.exports = Project;
