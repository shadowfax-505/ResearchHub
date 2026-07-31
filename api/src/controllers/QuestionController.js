const Joi = require('joi');
const Question = require('../models/Question');
const ResearcherStats = require('../models/ResearcherStats');
const { demoQuestions, isDatabaseUnavailable } = require('../utils/demoData');

const questionSchema = Joi.object({
  title: Joi.string().min(5).max(500).required(),
  body: Joi.string().max(10000).allow('', null),
  category: Joi.string().max(100).allow('', null)
});

const answerSchema = Joi.object({
  body: Joi.string().min(3).max(10000).required()
});

class QuestionController {
  static async getAll(req, res) {
    try {
      const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
      const offset = parseInt(req.query.offset, 10) || 0;
      const tab = req.query.tab || 'all';
      const userId = req.user?.user_id;

      let questions = [];
      if (tab === 'following' && userId) {
        questions = await Question.findFollowing(userId, limit, offset);
      } else if (tab === 'asked' && userId) {
        questions = await Question.findByUser(userId, limit, offset);
      } else {
        questions = await Question.findAll(limit, offset);
      }
      
      const stats = await Question.getStats();
      res.status(200).json({ success: true, data: questions, stats, pagination: { limit, offset } });
    } catch (error) {
      if (isDatabaseUnavailable(error)) {
        return res.status(200).json({ success: true, source: 'demo', data: demoQuestions, stats: { total_questions: demoQuestions.length, total_answers: demoQuestions.reduce((sum, item) => sum + (item.answers?.length || 0), 0), total_views: demoQuestions.reduce((sum, item) => sum + (item.view_count || 0), 0) } });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const question = await Question.findById(req.params.questionId);
      if (!question) return res.status(404).json({ error: 'Question not found' });
      await Question.incrementViews(req.params.questionId);
      res.status(200).json({ success: true, data: question });
    } catch (error) {
      if (isDatabaseUnavailable(error)) {
        const question = demoQuestions.find(item => item.question_id === Number(req.params.questionId));
        if (!question) return res.status(404).json({ error: 'Question not found' });
        return res.status(200).json({ success: true, source: 'demo', data: question });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async getMyQuestions(req, res) {
    try {
      const questions = await Question.findByUser(req.user.user_id);
      res.status(200).json({ success: true, data: questions, count: questions.length });
    } catch (error) {
      if (isDatabaseUnavailable(error)) {
        const filtered = demoQuestions.filter(item => item.user_id === req.user.user_id);
        return res.status(200).json({ success: true, source: 'demo', data: filtered, count: filtered.length });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    const { error, value } = questionSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      const questionId = await Question.create(req.user.user_id, value.title, value.body || null, value.category || null);
      await ResearcherStats.refreshForUser(req.user.user_id).catch(() => undefined);
      res.status(201).json({ success: true, message: 'Question created', data: { question_id: questionId, user_id: req.user.user_id } });
    } catch (error) {
      if (isDatabaseUnavailable(error)) {
        return res.status(201).json({ success: true, source: 'demo', message: 'Question created', data: { question_id: demoQuestions.length + 1, user_id: req.user.user_id } });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async answer(req, res) {
    const { error, value } = answerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      const answerId = await Question.addAnswer(req.params.questionId, req.user.user_id, value.body);
      await ResearcherStats.refreshForUser(req.user.user_id).catch(() => undefined);
      res.status(201).json({ success: true, message: 'Answer created', data: { answer_id: answerId, question_id: Number(req.params.questionId), user_id: req.user.user_id } });
    } catch (error) {
      if (isDatabaseUnavailable(error)) {
        return res.status(201).json({ success: true, source: 'demo', message: 'Answer created', data: { answer_id: 1, question_id: Number(req.params.questionId), user_id: req.user.user_id } });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async upvoteAnswer(req, res) {
    try {
      await Question.upvoteAnswer(req.params.answerId);
      res.status(200).json({ success: true, message: 'Answer upvoted' });
    } catch (error) {
      if (isDatabaseUnavailable(error)) {
        return res.status(200).json({ success: true, source: 'demo', message: 'Answer upvoted' });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async acceptAnswer(req, res) {
    try {
      await Question.acceptAnswer(req.params.answerId, req.user.user_id);
      res.status(200).json({ success: true, message: 'Answer accepted as solution' });
    } catch (error) {
      if (isDatabaseUnavailable(error)) {
        return res.status(200).json({ success: true, source: 'demo', message: 'Answer accepted as solution' });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = QuestionController;
