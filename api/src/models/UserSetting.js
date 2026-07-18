const { pool } = require('../config/database');

class UserSetting {
  static async findByUser(userId) {
    const [rows] = await pool.query(
      'SELECT user_id, theme, density, notifications, privacy, updated_at FROM USER_SETTINGS WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  }

  static async upsert(userId, settings) {
    const notifications = JSON.stringify(settings.notifications || {});
    const privacy = JSON.stringify(settings.privacy || {});
    const theme = settings.theme || 'system';
    const density = settings.density || 'comfortable';
    await pool.query(`
      MERGE INTO USER_SETTINGS target
      USING (SELECT ? AS user_id FROM dual) source
      ON (target.user_id = source.user_id)
      WHEN MATCHED THEN UPDATE SET theme = ?, density = ?, notifications = ?, privacy = ?, updated_at = SYSTIMESTAMP
      WHEN NOT MATCHED THEN INSERT (user_id, theme, density, notifications, privacy, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, SYSTIMESTAMP, SYSTIMESTAMP)
    `, [userId, theme, density, notifications, privacy, userId, theme, density, notifications, privacy]);
    return { user_id: userId, theme, density, notifications: settings.notifications || {}, privacy: settings.privacy || {} };
  }
}

module.exports = UserSetting;
