const { pool } = require('../config/database');

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

class ResearcherStats {
  static scoreFromCounts(stats) {
    return Math.round(
      toNumber(stats.saved_papers)
      + toNumber(stats.following)
      + toNumber(stats.followers) * 2
      + toNumber(stats.reviews) * 2
      + toNumber(stats.questions) * 3
      + toNumber(stats.answers) * 2
      + toNumber(stats.full_text_requests) * 2
      + toNumber(stats.total_reads) * 0.2
    );
  }

  static async computeForUser(userId) {
    const [rows] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM SAVED_PAPERS WHERE user_id = ?) AS saved_papers,
        (SELECT COUNT(*) FROM FOLLOWED_AUTHORS WHERE user_id = ?) AS following,
        (SELECT COUNT(DISTINCT fa2.user_id)
         FROM FOLLOWED_AUTHORS fa1
         JOIN FOLLOWED_AUTHORS fa2 ON fa1.author_id = fa2.author_id AND fa2.user_id <> ?
         WHERE fa1.user_id = ?
        ) AS followers,
        (SELECT COUNT(*) FROM REVIEWS WHERE user_id = ?) AS reviews,
        (SELECT COUNT(*) FROM QUESTIONS WHERE user_id = ?) AS questions,
        (SELECT COUNT(*) FROM ANSWERS WHERE user_id = ?) AS answers,
        (SELECT COUNT(*) FROM EMAIL_QUEUE WHERE requester_user_id = ? AND subject LIKE 'Full-text request%') AS full_text_requests,
        (SELECT COUNT(*) FROM USER_ACTIVITY WHERE user_id = ? AND activity_type IN ('view', 'download')) AS total_reads
      FROM dual
    `, [userId, userId, userId, userId, userId, userId, userId, userId, userId]);

    const stats = rows[0] || {};
    return {
      user_id: userId,
      saved_papers: toNumber(stats.saved_papers),
      following: toNumber(stats.following),
      followers: toNumber(stats.followers),
      reviews: toNumber(stats.reviews),
      questions: toNumber(stats.questions),
      answers: toNumber(stats.answers),
      full_text_requests: toNumber(stats.full_text_requests),
      total_reads: toNumber(stats.total_reads),
      rg_score: ResearcherStats.scoreFromCounts(stats)
    };
  }

  static async refreshForUser(userId) {
    const stats = await ResearcherStats.computeForUser(userId);
    await pool.query('DELETE FROM RESEARCHER_STATS WHERE user_id = ?', [userId]);
    await pool.query(
      `INSERT INTO RESEARCHER_STATS (
        user_id, saved_papers, following, followers, reviews, questions, answers,
        full_text_requests, total_reads, rg_score, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, SYSTIMESTAMP)`,
      [
        stats.user_id,
        stats.saved_papers,
        stats.following,
        stats.followers,
        stats.reviews,
        stats.questions,
        stats.answers,
        stats.full_text_requests,
        stats.total_reads,
        stats.rg_score
      ]
    );
    return stats;
  }

  static async getByUser(userId) {
    const [rows] = await pool.query(
      'SELECT user_id, saved_papers, following, followers, reviews, questions, answers, full_text_requests, total_reads, rg_score, updated_at FROM RESEARCHER_STATS WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  }

  static async getOrRefresh(userId) {
    const current = await ResearcherStats.getByUser(userId);
    if (current) return current;
    return ResearcherStats.refreshForUser(userId);
  }

  static async refreshAll() {
    const [rows] = await pool.query('SELECT user_id FROM USERS WHERE is_active = 1');
    for (const row of rows) {
      await ResearcherStats.refreshForUser(row.user_id);
    }
    return rows.length;
  }

  static async getPlatformStats() {
    const [rows] = await pool.query(`
      SELECT
        COUNT(*) AS cached_profiles,
        NVL(ROUND(AVG(rg_score)), 0) AS avg_rg_score,
        NVL(MAX(rg_score), 0) AS max_rg_score,
        NVL(SUM(full_text_requests), 0) AS total_full_text_requests,
        NVL(SUM(total_reads), 0) AS total_reads
      FROM RESEARCHER_STATS
    `);
    return rows[0] || {
      cached_profiles: 0,
      avg_rg_score: 0,
      max_rg_score: 0,
      total_full_text_requests: 0,
      total_reads: 0
    };
  }
}

module.exports = ResearcherStats;
