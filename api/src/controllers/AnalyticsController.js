const ResearcherStats = require('../models/ResearcherStats');
const { isDatabaseUnavailable } = require('../utils/demoData');

class AnalyticsController {
  static async getMyStats(req, res) {
    try {
      const stats = await ResearcherStats.getOrRefresh(req.user.user_id);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      if (isDatabaseUnavailable(error)) {
        return res.status(200).json({
          success: true,
          source: 'demo',
          data: {
            user_id: req.user.user_id,
            saved_papers: 42,
            following: 15,
            followers: 120,
            reviews: 12,
            questions: 4,
            answers: 10,
            full_text_requests: 3,
            total_reads: 1450,
            rg_score: 85,
            updated_at: new Date()
          }
        });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async getPlatformStats(req, res) {
    try {
      const stats = await ResearcherStats.getPlatformStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      if (isDatabaseUnavailable(error)) {
        return res.status(200).json({
          success: true,
          source: 'demo',
          data: {
            cached_profiles: 1200,
            avg_rg_score: 45,
            max_rg_score: 950,
            total_full_text_requests: 840,
            total_reads: 98000
          }
        });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AnalyticsController;
