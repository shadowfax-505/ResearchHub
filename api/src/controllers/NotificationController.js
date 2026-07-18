const Notification = require('../models/Notification');
const { demoNotifications, isDatabaseUnavailable } = require('../utils/demoData');

class NotificationController {
  static async getAll(req, res) {
    try {
      const notifications = await Notification.findByUser(req.user.user_id);
      res.status(200).json({ success: true, data: notifications, count: notifications.length });
    } catch (error) {
      if (isDatabaseUnavailable(error)) {
        return res.status(200).json({ success: true, source: 'demo', data: demoNotifications, count: demoNotifications.length });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async markRead(req, res) {
    try {
      await Notification.markRead(req.user.user_id, req.params.notificationId);
      res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return res.status(200).json({ success: true, source: 'demo', message: 'Notification marked as read' });
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = NotificationController;
