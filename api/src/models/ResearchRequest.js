const { pool } = require('../config/database');

const fields = `rr.request_id, rr.user_id, rr.recipient_user_id, rr.paper_id, rr.request_type, rr.title, rr.recipient_name, TO_CHAR(rr.message) message, rr.status, rr.decision_by_user_id, rr.decision_reason, rr.created_at, rr.updated_at,
  sender.username sender_username, sender.full_name sender_full_name, sender_rp.slug sender_slug,
  recipient.username recipient_username, recipient.full_name recipient_full_name, recipient_rp.slug recipient_slug`;

class ResearchRequest {
  static async findByUser(userId) {
    const [rows] = await pool.query(`SELECT ${fields} FROM RESEARCH_REQUESTS rr JOIN USERS sender ON sender.user_id = rr.user_id LEFT JOIN RESEARCHER_PROFILES sender_rp ON sender_rp.user_id = sender.user_id LEFT JOIN USERS recipient ON recipient.user_id = rr.recipient_user_id LEFT JOIN RESEARCHER_PROFILES recipient_rp ON recipient_rp.user_id = recipient.user_id WHERE rr.user_id = ? ORDER BY rr.created_at DESC`, [userId]);
    return rows;
  }

  static async findReceived(userId, username) {
    const [rows] = await pool.query(`SELECT ${fields} FROM RESEARCH_REQUESTS rr JOIN USERS sender ON sender.user_id = rr.user_id LEFT JOIN RESEARCHER_PROFILES sender_rp ON sender_rp.user_id = sender.user_id LEFT JOIN USERS recipient ON recipient.user_id = rr.recipient_user_id LEFT JOIN RESEARCHER_PROFILES recipient_rp ON recipient_rp.user_id = recipient.user_id WHERE rr.recipient_user_id = ? OR (rr.recipient_user_id IS NULL AND LOWER(rr.recipient_name) = LOWER(?)) ORDER BY rr.created_at DESC`, [userId, username]);
    return rows;
  }

  static async create(userId, data) {
    const [result] = await pool.query(
      `INSERT INTO RESEARCH_REQUESTS (user_id, recipient_user_id, paper_id, request_type, title, recipient_name, message, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', SYSTIMESTAMP, SYSTIMESTAMP)`,
      [userId, data.recipient_user_id || null, data.paper_id || null, data.request_type || 'other', data.title, data.recipient_name, data.message]
    );
    return result.affectedRows;
  }

  static async updateStatus(requestId, actorId, status, reason) {
    const [result] = await pool.query(
      `UPDATE RESEARCH_REQUESTS SET status = ?, decision_by_user_id = ?, decision_reason = ?, updated_at = SYSTIMESTAMP
       WHERE request_id = ? AND status = 'pending' AND (recipient_user_id = ? OR user_id = ?)`,
      [status, actorId, reason || null, requestId, actorId, actorId]
    );
    return result.affectedRows;
  }

  static async findRecipient(userId) {
    const [rows] = await pool.query('SELECT user_id, username, full_name, affiliation, profile_picture_url FROM USERS WHERE user_id = ? AND is_active = 1 AND account_status = \'active\'', [userId]);
    return rows[0] || null;
  }
}

module.exports = ResearchRequest;
