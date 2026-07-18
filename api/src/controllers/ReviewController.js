const Joi = require('joi');
const Review = require('../models/Review');
const ResearcherStats = require('../models/ResearcherStats');

const createSchema = Joi.object({
  paper_id: Joi.number().integer().positive().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  review_text: Joi.string().max(5000).allow('', null)
});

const updateSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5),
  review_text: Joi.string().max(5000).allow('', null)
});

class ReviewController {
  static async getByPaper(req, res) {
    try {
      const reviews = await Review.findByPaper(req.params.paperId);
      const stats = await Review.getAverageRating(req.params.paperId);
      res.status(200).json({ success: true, data: reviews, stats });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      const reviewId = await Review.create(req.user.user_id, value.paper_id, value.rating, value.review_text || null);
      await ResearcherStats.refreshForUser(req.user.user_id).catch(() => undefined);
      res.status(201).json({
        success: true,
        message: 'Review created',
        data: { review_id: reviewId, user_id: req.user.user_id, paper_id: value.paper_id }
      });
    } catch (err) {
      if (err.message && err.message.includes('unique_user_paper_review')) {
        return res.status(409).json({ error: 'You have already reviewed this paper' });
      }
      res.status(500).json({ error: err.message });
    }
  }

  static async update(req, res) {
    const { error, value } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      const updated = await Review.update(req.params.reviewId, req.user.user_id, value.rating, value.review_text);
      if (updated === 0) return res.status(404).json({ error: 'Review not found' });
      await ResearcherStats.refreshForUser(req.user.user_id).catch(() => undefined);
      res.status(200).json({ success: true, message: 'Review updated' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const deleted = await Review.delete(req.params.reviewId, req.user.user_id);
      if (deleted === 0) return res.status(404).json({ error: 'Review not found' });
      await ResearcherStats.refreshForUser(req.user.user_id).catch(() => undefined);
      res.status(200).json({ success: true, message: 'Review deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = ReviewController;
