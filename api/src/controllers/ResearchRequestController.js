const Joi = require('joi');
const ResearchRequest = require('../models/ResearchRequest');
const Notification = require('../models/Notification');
const ActivityEvent = require('../models/ActivityEvent');
const { demoResearchRequests, isDatabaseUnavailable } = require('../utils/demoData');

const requestSchema = Joi.object({
  title: Joi.string().max(200).required(),
  recipient_user_id: Joi.number().integer().positive(),
  recipient_name: Joi.string().max(150).allow('', null),
  paper_id: Joi.number().integer().positive().allow(null),
  request_type: Joi.string().valid('full_text', 'collaboration', 'introduction', 'dataset', 'other').default('other'),
  message: Joi.string().max(2000).required()
}).or('recipient_user_id', 'recipient_name');

class ResearchRequestController {
  static async getAll(req, res) {
    try { const requests = await ResearchRequest.findByUser(req.user.user_id); res.json({ success: true, data: requests, count: requests.length }); }
    catch (error) { if (isDatabaseUnavailable(error)) return res.json({ success: true, source: 'demo', data: demoResearchRequests, count: demoResearchRequests.length }); res.status(500).json({ error: error.message }); }
  }

  static async create(req, res) {
    const { error, value } = requestSchema.validate(req.body, { stripUnknown: true });
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      let recipient = null;
      if (value.recipient_user_id) {
        recipient = await ResearchRequest.findRecipient(value.recipient_user_id);
        if (!recipient) return res.status(404).json({ error: 'Recipient researcher not found' });
        if (recipient.user_id === req.user.user_id) return res.status(400).json({ error: 'You cannot send a request to yourself' });
      }
      const data = { ...value, recipient_name: recipient?.full_name || value.recipient_name };
      await ResearchRequest.create(req.user.user_id, data);
      if (recipient) {
        await Notification.create(recipient.user_id, data.title, data.message, 'request').catch(() => undefined);
        await ActivityEvent.create({ recipient_user_id: recipient.user_id, actor_user_id: req.user.user_id, event_type: 'research_request', source_type: 'research_request', title: data.title, body: data.message.slice(0, 180), route_url: '/requests' }).catch(() => undefined);
      }
      res.status(201).json({ success: true, data: { ...data, user_id: req.user.user_id, status: 'pending' } });
    } catch (err) { if (isDatabaseUnavailable(err)) return res.status(201).json({ success: true, source: 'demo', data: { ...value, user_id: req.user.user_id, status: 'pending' } }); res.status(500).json({ error: err.message }); }
  }

  static async getReceived(req, res) {
    try { const requests = await ResearchRequest.findReceived(req.user.user_id, req.user.username); res.json({ success: true, data: requests, count: requests.length }); }
    catch (error) { if (isDatabaseUnavailable(error)) return res.json({ success: true, source: 'demo', data: [], count: 0 }); res.status(500).json({ error: error.message }); }
  }

  static async updateStatus(req, res) {
    const status = String(req.body.status || '').toLowerCase();
    if (!['approved', 'declined', 'cancelled'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    try {
      const updated = await ResearchRequest.updateStatus(Number(req.params.id), req.user.user_id, status, req.body.reason);
      if (!updated) return res.status(404).json({ error: 'Request not found or already decided' });
      res.json({ success: true, data: { request_id: Number(req.params.id), status } });
    } catch (error) { if (isDatabaseUnavailable(error)) return res.json({ success: true, source: 'demo', data: { request_id: Number(req.params.id), status } }); res.status(500).json({ error: error.message }); }
  }
}

module.exports = ResearchRequestController;
