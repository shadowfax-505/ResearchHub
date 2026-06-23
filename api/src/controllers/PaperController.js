/**
 * Paper Controller
 * Handles research paper API requests
 */

const Paper = require('../models/Paper');

class PaperController {
  static async search(req, res) {
    try {
      const { query, field_id, year, journal_id, limit = 20, offset = 0 } = req.query;

      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const papers = await Paper.search(
        query,
        { field_id, year, journal_id },
        Math.min(parseInt(limit), 100),
        parseInt(offset)
      );

      res.status(200).json({
        success: true,
        data: papers,
        query,
        pagination: { limit, offset }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const paper = await Paper.findById(req.params.paperId);

      if (!paper) {
        return res.status(404).json({ error: 'Paper not found' });
      }

      // Increment view count
      await Paper.incrementViews(req.params.paperId);

      res.status(200).json({ success: true, data: paper });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getTopCited(req, res) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 10, 100);
      const papers = await Paper.getTopCited(limit);

      res.status(200).json({ success: true, data: papers, count: papers.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getTrending(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const limit = Math.min(parseInt(req.query.limit) || 10, 100);
      
      const papers = await Paper.getTrending(days, limit);

      res.status(200).json({
        success: true,
        data: papers,
        params: { days, limit }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      // Verify authorization
      if (req.user.role !== 'admin' && req.user.role !== 'researcher') {
        return res.status(403).json({ error: 'Only researchers and admins can create papers' });
      }

      const paperId = await Paper.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Paper created successfully',
        data: { paper_id: paperId }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = await Paper.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PaperController;
