/**
 * Field Controller
 * Handles research field API requests
 */

const Field = require('../models/Field');

class FieldController {
  static async getAll(req, res) {
    try {
      const fields = await Field.findAll();
      const stats = await Field.getStats();
      
      res.status(200).json({
        success: true,
        data: fields,
        total: stats.total_fields
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const field = await Field.findById(req.params.fieldId);
      
      if (!field) {
        return res.status(404).json({ error: 'Field not found' });
      }
      
      res.status(200).json({ success: true, data: field });
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
      
      const fields = await Field.search(query, limit, offset);

      res.status(200).json({
        success: true,
        data: fields,
        query,
        count: fields.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getHierarchy(req, res) {
    try {
      const hierarchy = await Field.getHierarchy();
      res.status(200).json({ success: true, data: hierarchy });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = await Field.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = FieldController;
