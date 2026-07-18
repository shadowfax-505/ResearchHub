const { pool } = require('../config/database');

class PaperFile {
  static async create(fileData) {
    const [result] = await pool.query(
      `INSERT INTO PAPER_FILES (paper_id, owner_user_id, storage_key, original_name, mime_type, size_bytes, checksum_sha256, visibility, file_kind, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', SYSTIMESTAMP, SYSTIMESTAMP)`,
      [
        fileData.paper_id,
        fileData.owner_user_id,
        fileData.storage_key,
        fileData.original_name,
        fileData.mime_type,
        fileData.size_bytes,
        fileData.checksum_sha256,
        fileData.visibility || 'public',
        fileData.file_kind || 'paper'
      ],
      { returnColumn: 'file_id' }
    );
    return result.insertId;
  }

  static async findAccessible(fileId, userId) {
    const [rows] = await pool.query(
      `SELECT pf.*, p.title, p.visibility AS paper_visibility, p.status AS paper_status
       FROM PAPER_FILES pf
       JOIN RESEARCH_PAPERS p ON p.paper_id = pf.paper_id
       WHERE pf.file_id = ?
         AND pf.status = 'available'
         AND (pf.owner_user_id = ? OR (pf.visibility = 'public' AND NVL(p.visibility, 'public') = 'public' AND NVL(p.status, 'published') = 'published'))`,
      [fileId, userId || null]
    );
    return rows[0] || null;
  }
}

module.exports = PaperFile;
