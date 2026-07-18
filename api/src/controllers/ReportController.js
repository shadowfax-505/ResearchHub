const Joi = require('joi');
const Report = require('../models/Report');
const { isDatabaseUnavailable } = require('../utils/demoData');

const reportSchema = Joi.object({
  target_type: Joi.string().valid('user', 'paper', 'review', 'question', 'answer').required(),
  target_id: Joi.number().integer().positive().required(),
  reason_code: Joi.string().max(50).required(),
  details: Joi.string().max(4000).allow('', null)
});

class ReportController {
  static async create(req, res) {
    const { error, value } = reportSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });
    if (value.target_type === 'user' && value.target_id === req.user.user_id) {
      return res.status(400).json({ success: false, error: 'You cannot report your own profile' });
    }
    try {
      const data = await Report.create({
        reporterUserId: req.user.user_id,
        targetType: value.target_type,
        targetId: value.target_id,
        reasonCode: value.reason_code,
        details: value.details || null
      });
      res.status(201).json({ success: true, data, message: 'Report submitted for review' });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return res.status(503).json({ success: false, error: 'Reports require the Oracle database to be connected' });
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getMine(req, res) {
    try {
      const data = await Report.getMine(req.user.user_id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return res.status(200).json({ success: true, source: 'demo', data: [] });
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = ReportController;
