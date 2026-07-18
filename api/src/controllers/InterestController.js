const Joi = require('joi');
const Interest = require('../models/Interest');

const interestSchema = Joi.object({
  interest_type: Joi.string().valid('field', 'keyword', 'journal', 'researcher', 'author').required(),
  interest_id: Joi.number().integer().positive().required(),
  source: Joi.string().valid('explicit', 'inferred').default('explicit'),
  weight: Joi.number().min(0).max(10).default(1)
});

class InterestController {
  static async list(req, res) {
    try {
      return res.json({ success: true, data: await Interest.list(req.user.user_id) });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async replace(req, res) {
    const interests = Array.isArray(req.body?.interests) ? req.body.interests : [];
    const validated = [];
    for (const interest of interests) {
      const result = interestSchema.validate(interest);
      if (result.error) return res.status(400).json({ error: result.error.details[0].message });
      validated.push(result.value);
    }
    if (validated.length > 50) return res.status(400).json({ error: 'A maximum of 50 interests is allowed' });
    try {
      return res.json({ success: true, data: await Interest.replace(req.user.user_id, validated) });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async remove(req, res) {
    try {
      await Interest.remove(req.user.user_id, req.params.interestType, Number(req.params.interestId));
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = InterestController;
