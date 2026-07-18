const { pool } = require('../config/database');

class EmailQueue {
  static async enqueue(requesterUserId, recipientEmail, subject, body) {
    const [result] = await pool.query(
      `INSERT INTO EMAIL_QUEUE (requester_user_id, recipient_email, subject, body, status, queued_at)
       VALUES (?, ?, ?, ?, 'pending', SYSTIMESTAMP)`,
      [requesterUserId, recipientEmail, subject, body],
      { returnColumn: 'email_id' }
    );
    return result.insertId;
  }

  static async getStats() {
    const [rows] = await pool.query(`
      SELECT
        COUNT(*) AS queued,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) AS sent,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed
      FROM EMAIL_QUEUE
    `);
    return rows[0] || { queued: 0, pending: 0, sent: 0, failed: 0 };
  }
}

module.exports = EmailQueue;
