/**
 * Journal Controller
 * Handles journal-related API requests
 */

const Journal = require('../models/Journal');

class JournalController {
  static async getAll(req, res) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const offset = parseInt(req.query.offset) || 0;
      
      const journals = await Journal.findAll(limit, offset);
      const stats = await Journal.getStats();
      
      res.status(200).json({
        success: true,
        data: journals,
        pagination: { limit, offset, total: stats.total_journals }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const journal = await Journal.findById(req.params.journalId);
      
      if (!journal) {
        return res.status(404).json({ error: 'Journal not found' });
      }
      
      res.status(200).json({ success: true, data: journal });
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
      
      const journals = await Journal.search(query, limit, offset);

      res.status(200).json({
        success: true,
        data: journals,
        query,
        count: journals.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getTopJournals(req, res) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 10, 100);
      const journals = await Journal.getTopJournals(limit);

      res.status(200).json({ success: true, data: journals });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = await Journal.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = JournalController;
