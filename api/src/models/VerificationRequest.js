const { pool } = require('../config/database');

class VerificationRequest {
  static async getByUser(userId) {
    const [rows] = await pool.query(
      `SELECT verification_request_id, user_id, institutional_email, institutional_domain, status, evidence, rejection_reason, reviewed_by_user_id, reviewed_at, created_at, updated_at
       FROM RESEARCHER_VERIFICATION_REQUESTS WHERE user_id = ?`,
      [userId]
    );
    return rows[0] || null;
  }

  static async upsert(userId, data) {
    await pool.query(
      `MERGE INTO RESEARCHER_VERIFICATION_REQUESTS target
       USING (SELECT ? user_id, ? institutional_email, ? institutional_domain, ? evidence FROM dual) source
       ON (target.user_id = source.user_id)
       WHEN MATCHED THEN UPDATE SET institutional_email = source.institutional_email, institutional_domain = source.institutional_domain, evidence = source.evidence, status = 'pending', rejection_reason = NULL, reviewed_by_user_id = NULL, reviewed_at = NULL, updated_at = SYSTIMESTAMP
       WHEN NOT MATCHED THEN INSERT (user_id, institutional_email, institutional_domain, evidence, status, created_at, updated_at)
       VALUES (source.user_id, source.institutional_email, source.institutional_domain, source.evidence, 'pending', SYSTIMESTAMP, SYSTIMESTAMP)`,
      [userId, data.institutional_email, data.institutional_domain, data.evidence || null]
    );
    return this.getByUser(userId);
  }

  static async listPending() {
    const [rows] = await pool.query(
      `SELECT r.*, u.username, u.full_name, u.email_verified_at, u.affiliation
       FROM RESEARCHER_VERIFICATION_REQUESTS r JOIN USERS u ON u.user_id = r.user_id
       WHERE r.status = 'pending' ORDER BY r.created_at ASC`
    );
    return rows;
  }

  static async decide(requestId, reviewerId, status, reason) {
    const [result] = await pool.query(
      `UPDATE RESEARCHER_VERIFICATION_REQUESTS
       SET status = ?, rejection_reason = ?, reviewed_by_user_id = ?, reviewed_at = SYSTIMESTAMP, updated_at = SYSTIMESTAMP
       WHERE verification_request_id = ? AND status = 'pending'`,
      [status, reason || null, reviewerId, requestId]
    );
    if (!result.affectedRows) return false;
    const [rows] = await pool.query('SELECT user_id FROM RESEARCHER_VERIFICATION_REQUESTS WHERE verification_request_id = ?', [requestId]);
    const userId = rows[0]?.user_id;
    if (userId) {
      await pool.query('UPDATE USERS SET researcher_verified_at = CASE WHEN ? = \'approved\' THEN SYSTIMESTAMP ELSE NULL END, updated_at = SYSTIMESTAMP WHERE user_id = ?', [status, userId]);
    }
    return true;
  }
}

module.exports = VerificationRequest;
