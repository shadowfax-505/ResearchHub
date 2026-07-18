const { pool } = require('../config/database');

class Notification {
  static async create(userId, title, body, type = 'system') {
    const [result] = await pool.query(
      `INSERT INTO NOTIFICATIONS (user_id, title, body, type, is_read, created_at)
       VALUES (?, ?, ?, ?, 0, SYSTIMESTAMP)`,
      [userId, title, body, type],
      { returnColumn: 'notification_id' }
    );
    return result.insertId;
  }

  static async findByUser(userId) {
    const [rows] = await pool.query(
      'SELECT notification_id, user_id, title, body, type, is_read, created_at FROM NOTIFICATIONS WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  static async markRead(userId, notificationId) {
    const [result] = await pool.query(
      'UPDATE NOTIFICATIONS SET is_read = 1, read_at = SYSTIMESTAMP WHERE user_id = ? AND notification_id = ?',
      [userId, notificationId]
    );
    return result.affectedRows;
  }
}

module.exports = Notification;
