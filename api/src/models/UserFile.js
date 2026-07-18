const { pool } = require('../config/database');

class UserFile {
  static async create(data) {
    const [result] = await pool.query(
      `INSERT INTO USER_FILES (user_id, storage_key, original_name, mime_type, size_bytes, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'available', SYSTIMESTAMP)`,
      [data.user_id, data.storage_key, data.original_name, data.mime_type, data.size_bytes],
      { returnColumn: 'file_id' }
    );
    return result.insertId;
  }

  static async findAccessible(fileId) {
    const [rows] = await pool.query('SELECT * FROM USER_FILES WHERE file_id = ? AND status = \'available\'', [fileId]);
    return rows[0] || null;
  }
}

module.exports = UserFile;
