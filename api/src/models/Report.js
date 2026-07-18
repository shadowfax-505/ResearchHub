const { pool } = require('../config/database');

class Report {
  static async create({ reporterUserId, targetType, targetId, reasonCode, details }) {
    const [report] = await pool.query(
      `INSERT INTO CONTENT_REPORTS (reporter_user_id, target_type, target_id, reason_code, details)
       VALUES (?, ?, ?, ?, ?)`,
      [reporterUserId, targetType, targetId, reasonCode, details],
      { returnColumn: 'report_id' }
    );
    const [moderationCase] = await pool.query(
      'INSERT INTO MODERATION_CASES (report_id, target_type, target_id) VALUES (?, ?, ?)',
      [report.insertId, targetType, targetId],
      { returnColumn: 'case_id' }
    );
    return { report_id: report.insertId, case_id: moderationCase.insertId };
  }

  static async getMine(userId, limit = 20, offset = 0) {
    const [rows] = await pool.query(
      `SELECT report_id, target_type, target_id, reason_code, details, status, created_at, updated_at
       FROM CONTENT_REPORTS WHERE reporter_user_id = ? ORDER BY created_at DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`,
      [userId, offset, limit]
    );
    return rows;
  }
}

module.exports = Report;
