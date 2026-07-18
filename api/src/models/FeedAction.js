const { pool } = require('../config/database');

class FeedAction {
  static async create(userId, paperId, actionType) {
    const [result] = await pool.query(
      `MERGE INTO USER_FEED_ACTIONS target
       USING (SELECT ? AS user_id, ? AS paper_id, ? AS action_type FROM dual) source
       ON (target.user_id = source.user_id AND target.paper_id = source.paper_id AND target.action_type = source.action_type)
       WHEN NOT MATCHED THEN INSERT (user_id, paper_id, action_type, created_at)
       VALUES (source.user_id, source.paper_id, source.action_type, SYSTIMESTAMP)`,
      [userId, paperId, actionType]
    );
    return result.affectedRows;
  }
}

module.exports = FeedAction;
