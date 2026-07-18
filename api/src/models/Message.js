const { pool } = require('../config/database');

class Message {
  static async create(senderId, receiverId, content) {
    const [result] = await pool.query(
      `INSERT INTO MESSAGES (sender_id, receiver_id, content, is_read, created_at)
       VALUES (?, ?, ?, 0, SYSTIMESTAMP)`,
      [senderId, receiverId, content],
      { returnColumn: 'message_id' }
    );
    return result.insertId;
  }

  static async getConversations(userId) {
    const [rows] = await pool.query(`
      WITH RecentMessages AS (
        SELECT m.*, CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END other_user_id,
          ROW_NUMBER() OVER (PARTITION BY CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END ORDER BY created_at DESC) rn
        FROM MESSAGES m WHERE sender_id = ? OR receiver_id = ?
      )
      SELECT rm.message_id, rm.sender_id, rm.receiver_id, TO_CHAR(rm.content) content, rm.is_read, rm.created_at,
        u.user_id other_user_id, u.username other_username, u.full_name other_full_name, rp.slug other_slug,
        (SELECT COUNT(*) FROM MESSAGES unread WHERE unread.sender_id = rm.other_user_id AND unread.receiver_id = ? AND unread.is_read = 0) unread_count
      FROM RecentMessages rm JOIN USERS u ON u.user_id = rm.other_user_id LEFT JOIN RESEARCHER_PROFILES rp ON rp.user_id = u.user_id
      WHERE rm.rn = 1 ORDER BY rm.created_at DESC`,
      [userId, userId, userId, userId, userId]
    );
    return rows;
  }

  static async getConversationWithUser(userId1, userId2) {
    const [rows] = await pool.query(`
      SELECT m.message_id, m.sender_id, m.receiver_id, TO_CHAR(m.content) content, m.is_read, m.created_at,
        s.username sender_username, s.full_name sender_full_name, r.username receiver_username, r.full_name receiver_full_name
      FROM MESSAGES m JOIN USERS s ON m.sender_id = s.user_id JOIN USERS r ON m.receiver_id = r.user_id
      WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC`,
      [userId1, userId2, userId2, userId1]
    );
    return rows;
  }

  static async markAsRead(messageId, receiverId) {
    const [result] = await pool.query('UPDATE MESSAGES SET is_read = 1 WHERE message_id = ? AND receiver_id = ?', [messageId, receiverId]);
    return result.affectedRows;
  }

  static async searchUsers(userId, query = '') {
    const [rows] = await pool.query(`
      SELECT u.user_id, u.username, u.full_name, u.affiliation, u.profile_picture_url, rp.slug, rp.headline
      FROM USERS u JOIN RESEARCHER_PROFILES rp ON rp.user_id = u.user_id
      WHERE u.user_id <> ? AND u.is_active = 1 AND u.account_status = 'active' AND rp.visibility = 'public'
        AND NOT EXISTS (SELECT 1 FROM USER_BLOCKS b WHERE (b.blocker_user_id = ? AND b.blocked_user_id = u.user_id) OR (b.blocker_user_id = u.user_id AND b.blocked_user_id = ?))
        AND (LOWER(u.username) LIKE LOWER(?) OR LOWER(u.full_name) LIKE LOWER(?) OR LOWER(NVL(u.affiliation, '')) LIKE LOWER(?))
      ORDER BY u.full_name FETCH FIRST 20 ROWS ONLY`,
      [userId, userId, userId, `%${query}%`, `%${query}%`, `%${query}%`]
    );
    return rows;
  }

  static async createRequest(senderId, recipientId, firstMessage) {
    const [existing] = await pool.query(
      `SELECT request_id, sender_id, recipient_id, status FROM MESSAGE_REQUESTS
       WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
       ORDER BY created_at DESC FETCH FIRST 1 ROW ONLY`,
      [senderId, recipientId, recipientId, senderId]
    );
    if (existing[0]) return existing[0];
    const [result] = await pool.query(
      `INSERT INTO MESSAGE_REQUESTS (sender_id, recipient_id, first_message, status, created_at, updated_at)
       VALUES (?, ?, ?, 'pending', SYSTIMESTAMP, SYSTIMESTAMP)`,
      [senderId, recipientId, firstMessage],
      { returnColumn: 'request_id' }
    );
    return { request_id: result.insertId, sender_id: senderId, recipient_id: recipientId, status: 'pending', first_message: firstMessage };
  }

  static async getRequests(userId) {
    const [rows] = await pool.query(`
      SELECT mr.request_id, mr.sender_id, mr.recipient_id, TO_CHAR(mr.first_message) first_message, mr.status, mr.created_at, mr.updated_at,
        s.username sender_username, s.full_name sender_full_name, sr.slug sender_slug,
        r.username recipient_username, r.full_name recipient_full_name, rr.slug recipient_slug
      FROM MESSAGE_REQUESTS mr JOIN USERS s ON s.user_id = mr.sender_id JOIN USERS r ON r.user_id = mr.recipient_id
      LEFT JOIN RESEARCHER_PROFILES sr ON sr.user_id = s.user_id LEFT JOIN RESEARCHER_PROFILES rr ON rr.user_id = r.user_id
      WHERE mr.sender_id = ? OR mr.recipient_id = ? ORDER BY mr.created_at DESC`,
      [userId, userId]
    );
    return rows;
  }

  static async updateRequest(requestId, userId, status) {
    const [result] = await pool.query(
      `UPDATE MESSAGE_REQUESTS SET status = ?, decided_by_user_id = ?, decided_at = SYSTIMESTAMP, updated_at = SYSTIMESTAMP
       WHERE request_id = ? AND (recipient_id = ? OR sender_id = ?) AND status = 'pending'`,
      [status, userId, requestId, userId, userId]
    );
    return result.affectedRows;
  }

  static async canMessage(userId1, userId2) {
    const [rows] = await pool.query(
      `SELECT 1 FROM MESSAGE_REQUESTS WHERE status = 'accepted' AND ((sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?))
       UNION ALL SELECT 1 FROM MESSAGES WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) FETCH FIRST 1 ROW ONLY`,
      [userId1, userId2, userId2, userId1, userId1, userId2, userId2, userId1]
    );
    return rows.length > 0;
  }
}

module.exports = Message;
