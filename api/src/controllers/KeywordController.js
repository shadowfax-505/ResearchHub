/**
 * Keyword Controller
 * Handles keyword-related API requests
 */

const Keyword = require('../models/Keyword');

class KeywordController {
  static async getAll(req, res) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const offset = parseInt(req.query.offset) || 0;
      
      const keywords = await Keyword.findAll(limit, offset);
      const stats = await Keyword.getStats();
      
      res.status(200).json({
        success: true,
        data: keywords,
        pagination: { limit, offset, total: stats.total_keywords }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const keyword = await Keyword.findById(req.params.keywordId);
      
      if (!keyword) {
        return res.status(404).json({ error: 'Keyword not found' });
      }
      
      res.status(200).json({ success: true, data: keyword });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async search(req, res) {
    try {
      const query = req.query.q;
      
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const offset = parseInt(req.query.offset) || 0;
      
      const keywords = await Keyword.search(query, limit, offset);

      res.status(200).json({
        success: true,
        data: keywords,
        query,
        count: keywords.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getTopKeywords(req, res) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const keywords = await Keyword.getTopKeywords(limit);

      res.status(200).json({ success: true, data: keywords });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = await Keyword.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = KeywordController;
