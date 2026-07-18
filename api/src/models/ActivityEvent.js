const { pool } = require('../config/database');

class ActivityEvent {
  static async create(data) {
    const [result] = await pool.query(
      `INSERT INTO ACTIVITY_EVENTS (recipient_user_id, actor_user_id, event_type, source_type, source_id, title, body, route_url, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, SYSTIMESTAMP)`,
      [data.recipient_user_id, data.actor_user_id || null, data.event_type, data.source_type || null, data.source_id || null, data.title, data.body || null, data.route_url || null],
      { returnColumn: 'event_id' }
    );
    return result.insertId;
  }

  static async findByUser(userId, limit = 30, offset = 0) {
    const [rows] = await pool.query(
      `SELECT event_id, recipient_user_id, actor_user_id, event_type, source_type, source_id, title, body, route_url, is_read, created_at, read_at
       FROM ACTIVITY_EVENTS WHERE recipient_user_id = ? ORDER BY created_at DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`,
      [userId, offset, limit]
    );
    return rows;
  }

  static async unreadCount(userId) {
    const [rows] = await pool.query('SELECT COUNT(*) unread_count FROM ACTIVITY_EVENTS WHERE recipient_user_id = ? AND is_read = 0', [userId]);
    return Number(rows[0]?.unread_count || 0);
  }

  static async markRead(userId, eventId) {
    const [result] = await pool.query('UPDATE ACTIVITY_EVENTS SET is_read = 1, read_at = SYSTIMESTAMP WHERE recipient_user_id = ? AND event_id = ?', [userId, eventId]);
    return result.affectedRows;
  }

  static async markAllRead(userId) {
    const [result] = await pool.query('UPDATE ACTIVITY_EVENTS SET is_read = 1, read_at = SYSTIMESTAMP WHERE recipient_user_id = ? AND is_read = 0', [userId]);
    return result.affectedRows;
  }
}

module.exports = ActivityEvent;
