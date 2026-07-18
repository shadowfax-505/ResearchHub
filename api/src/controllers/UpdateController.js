const ActivityEvent = require('../models/ActivityEvent');

class UpdateController {
  static async getAll(req, res) {
    try {
      const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);
      const offset = Math.max(Number(req.query.offset) || 0, 0);
      const [data, unread_count] = await Promise.all([ActivityEvent.findByUser(req.user.user_id, limit, offset), ActivityEvent.unreadCount(req.user.user_id)]);
      res.json({ success: true, data, unread_count, pagination: { limit, offset, has_more: data.length === limit } });
    } catch (error) { res.status(500).json({ success: false, error: error.message }); }
  }

  static async markRead(req, res) {
    try { const updated = await ActivityEvent.markRead(req.user.user_id, Number(req.params.id)); if (!updated) return res.status(404).json({ success: false, error: 'Update not found' }); res.json({ success: true }); }
    catch (error) { res.status(500).json({ success: false, error: error.message }); }
  }

  static async markAllRead(req, res) {
    try { const updated = await ActivityEvent.markAllRead(req.user.user_id); res.json({ success: true, data: { updated } }); }
    catch (error) { res.status(500).json({ success: false, error: error.message }); }
  }
}

module.exports = UpdateController;
