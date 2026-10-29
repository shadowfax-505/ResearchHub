const { isDatabaseUnavailable, sendDatabaseUnavailable } = require('../utils/errors');
const Notification = require('../models/Notification');

class NotificationController {
  static async getAll(req, res) {
    try {
      const notifications = await Notification.findByUser(req.user.user_id);
      res.status(200).json({ success: true, data: notifications, count: notifications.length });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      res.status(500).json({ error: error.message });
    }
  }

  static async markRead(req, res) {
    try {
      const affected = await Notification.markRead(req.user.user_id, req.params.notificationId);
      if (!affected) return res.status(404).json({ error: 'Notification not found' });
      res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = NotificationController;
