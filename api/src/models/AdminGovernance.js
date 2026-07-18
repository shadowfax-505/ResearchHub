const { pool } = require('../config/database');

let oracledb;
try {
  oracledb = require('oracledb');
} catch (_) {
  oracledb = null;
}

function requireDriver() {
  if (!oracledb) throw new Error('Oracle database driver unavailable.');
}

class AdminGovernance {
  static async getModerationCases(limit, offset) {
    requireDriver();
    const result = await pool.call('BEGIN PKG_ADMIN.get_moderation_cases(:limit, :offset, :cases); END;', {
      limit,
      offset,
      cases: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
    });
    return result.cases || [];
  }

  static async getAuditLogs(limit, offset) {
    requireDriver();
    const result = await pool.call('BEGIN PKG_ADMIN.get_audit_logs(:limit, :offset, :logs); END;', {
      limit,
      offset,
      logs: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
    });
    return result.logs || [];
  }

  static async getEmailQueue(limit, offset) {
    requireDriver();
    const result = await pool.call('BEGIN PKG_ADMIN.get_email_queue(:limit, :offset, :items); END;', {
      limit,
      offset,
      items: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
    });
    return result.items || [];
  }

  static async getRecentMessages(limit = 20) {
    const [rows] = await pool.query(`
      SELECT m.message_id, m.sender_id, m.receiver_id, TO_CHAR(m.content) as content, m.is_read, m.created_at,
             s.username as sender_username, r.username as receiver_username
      FROM MESSAGES m
      JOIN USERS s ON m.sender_id = s.user_id
      JOIN USERS r ON m.receiver_id = r.user_id
      ORDER BY m.created_at DESC
      FETCH NEXT ? ROWS ONLY
    `, [limit]);
    return rows;
  }

  static async getRecentProjects(limit = 20) {
    const [rows] = await pool.query(`
      SELECT p.project_id, p.user_id, p.title, TO_CHAR(p.description) as description, p.status, p.created_at,
             u.username
      FROM PROJECTS p
      JOIN USERS u ON p.user_id = u.user_id
      ORDER BY p.created_at DESC
      FETCH NEXT ? ROWS ONLY
    `, [limit]);
    return rows;
  }

  static async applyModerationAction(caseId, actorUserId, actionType, notes) {
    return pool.call('BEGIN PKG_MODERATION.apply_action(:caseId, :actorUserId, :actionType, :notes); END;', {
      caseId,
      actorUserId,
      actionType,
      notes: notes || null
    });
  }

  static async setUserActive(userId, isActive, actorUserId) {
    return pool.call('BEGIN PKG_ADMIN.set_user_active(:userId, :isActive, :actorUserId); END;', {
      userId,
      isActive: isActive ? 1 : 0,
      actorUserId
    });
  }

  static async assignRole(userId, roleKey, actorUserId) {
    return pool.call('BEGIN PKG_ADMIN.assign_role(:userId, :roleKey, :actorUserId); END;', {
      userId,
      roleKey,
      actorUserId
    });
  }

  static async retryEmail(emailId, actorUserId) {
    return pool.call('BEGIN PKG_ADMIN.retry_email(:emailId, :actorUserId); END;', {
      emailId,
      actorUserId
    });
  }
}

module.exports = AdminGovernance;
