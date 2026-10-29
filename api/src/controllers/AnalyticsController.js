const { isDatabaseUnavailable, sendDatabaseUnavailable } = require('../utils/errors');
const ResearcherStats = require('../models/ResearcherStats');

class AnalyticsController {
  static async getMyStats(req, res) {
    try {
      const stats = await ResearcherStats.getOrRefresh(req.user.user_id);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      res.status(500).json({ error: error.message });
    }
  }

  static async getPlatformStats(req, res) {
    try {
      const stats = await ResearcherStats.getPlatformStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AnalyticsController;
