const { pool } = require('../config/database');

class Question {
  static async findAll(limit = 20, offset = 0) {
    const [rows] = await pool.query(`
      SELECT q.question_id, q.user_id, q.title, q.body, q.category, q.view_count, q.answer_count, q.created_at, q.updated_at,
             u.username, u.full_name
      FROM QUESTIONS q
      JOIN USERS u ON q.user_id = u.user_id
      ORDER BY q.created_at DESC
      OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    `, [offset, limit]);
    return rows;
  }

  static async findFollowing(userId, limit = 20, offset = 0) {
    const [rows] = await pool.query(`
      SELECT q.question_id, q.user_id, q.title, q.body, q.category, q.view_count, q.answer_count, q.created_at, q.updated_at,
             u.username, u.full_name
      FROM QUESTIONS q
      JOIN USERS u ON q.user_id = u.user_id
      JOIN FOLLOWED_AUTHORS fa ON q.user_id = fa.author_id
      WHERE fa.user_id = ?
      ORDER BY q.created_at DESC
      OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    `, [userId, offset, limit]);
    return rows;
  }

  static async findByUser(userId, limit = 20, offset = 0) {
    const [rows] = await pool.query(`
      SELECT q.question_id, q.user_id, q.title, q.body, q.category, q.view_count, q.answer_count, q.created_at, q.updated_at,
             u.username, u.full_name
      FROM QUESTIONS q
      JOIN USERS u ON q.user_id = u.user_id
      WHERE q.user_id = ?
      ORDER BY q.created_at DESC
      OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    `, [userId, offset, limit]);
    return rows;
  }

  static async findById(questionId) {
    const [rows] = await pool.query(`
      SELECT q.question_id, q.user_id, q.title, q.body, q.category, q.view_count, q.answer_count, q.created_at, q.updated_at,
             u.username, u.full_name
      FROM QUESTIONS q
      JOIN USERS u ON q.user_id = u.user_id
      WHERE q.question_id = ?
    `, [questionId]);

    if (rows.length === 0) return null;

    const question = rows[0];
    const [answers] = await pool.query(`
      SELECT a.answer_id, a.question_id, a.user_id, a.body, a.upvotes, a.is_accepted, a.created_at, a.updated_at,
             u.username, u.full_name
      FROM ANSWERS a
      JOIN USERS u ON a.user_id = u.user_id
      WHERE a.question_id = ?
      ORDER BY a.is_accepted DESC, a.upvotes DESC, a.created_at ASC
    `, [questionId]);

    question.answers = answers;
    return question;
  }

  static async create(userId, title, body, category) {
    const [result] = await pool.query(
      `INSERT INTO QUESTIONS (user_id, title, body, category, view_count, answer_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, 0, SYSTIMESTAMP, SYSTIMESTAMP)`,
      [userId, title, body, category],
      { returnColumn: 'question_id' }
    );
    return result.insertId;
  }

  static async addAnswer(questionId, userId, body) {
    const [result] = await pool.query(
      `INSERT INTO ANSWERS (question_id, user_id, body, upvotes, is_accepted, created_at, updated_at)
       VALUES (?, ?, ?, 0, 0, SYSTIMESTAMP, SYSTIMESTAMP)`,
      [questionId, userId, body],
      { returnColumn: 'answer_id' }
    );

    await pool.query(
      'UPDATE QUESTIONS SET answer_count = answer_count + 1, updated_at = SYSTIMESTAMP WHERE question_id = ?',
      [questionId]
    );

    return result.insertId;
  }

  static async incrementViews(questionId) {
    const [result] = await pool.query(
      'UPDATE QUESTIONS SET view_count = view_count + 1, updated_at = SYSTIMESTAMP WHERE question_id = ?',
      [questionId]
    );
    return result.affectedRows;
  }

  static async upvoteAnswer(answerId) {
    const [result] = await pool.query(
      'UPDATE ANSWERS SET upvotes = NVL(upvotes, 0) + 1, updated_at = SYSTIMESTAMP WHERE answer_id = ?',
      [answerId]
    );
    return result.affectedRows;
  }

  static async acceptAnswer(answerId, userId) {
    const [rows] = await pool.query(
      `SELECT q.user_id, q.question_id 
       FROM ANSWERS a 
       JOIN QUESTIONS q ON q.question_id = a.question_id 
       WHERE a.answer_id = ?`,
      [answerId]
    );
    if (!rows || rows.length === 0) {
      throw new Error('Answer not found');
    }
    if (rows[0].user_id !== userId) {
      throw new Error('Unauthorized to accept answer for this question');
    }

    const questionId = rows[0].question_id;

    await pool.query(
      'UPDATE ANSWERS SET is_accepted = 0, updated_at = SYSTIMESTAMP WHERE question_id = ?',
      [questionId]
    );

    const [result] = await pool.query(
      'UPDATE ANSWERS SET is_accepted = 1, updated_at = SYSTIMESTAMP WHERE answer_id = ?',
      [answerId]
    );

    return result.affectedRows;
  }

  static async getStats() {
    const [rows] = await pool.query(`
      SELECT COUNT(*) AS total_questions, NVL(SUM(answer_count), 0) AS total_answers, NVL(SUM(view_count), 0) AS total_views
      FROM QUESTIONS
    `);
    return rows[0] || { total_questions: 0, total_answers: 0, total_views: 0 };
  }
}

module.exports = Question;
