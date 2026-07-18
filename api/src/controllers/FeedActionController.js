const Joi = require('joi');
const FeedAction = require('../models/FeedAction');

const schema = Joi.object({
  paper_id: Joi.number().integer().positive().required(),
  action_type: Joi.string().valid('not_interested', 'mute').required()
});

class FeedActionController {
  static async create(req, res) {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      await FeedAction.create(req.user.user_id, value.paper_id, value.action_type);
      res.status(201).json({ success: true, data: value });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = FeedActionController;
