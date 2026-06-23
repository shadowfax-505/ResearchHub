/**
 * Author Controller
 * Handles author-related API requests
 */

const Author = require('../models/Author');

class AuthorController {
  static async getAll(req, res) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const offset = parseInt(req.query.offset) || 0;
      
      const authors = await Author.findAll(limit, offset);
      const stats = await Author.getStats();
      
      res.status(200).json({
        success: true,
        data: authors,
        pagination: { limit, offset, total: stats.total_authors }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const author = await Author.findById(req.params.authorId);
      
      if (!author) {
        return res.status(404).json({ error: 'Author not found' });
      }
      
      res.status(200).json({ success: true, data: author });
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
      
      const authors = await Author.search(query, limit, offset);

      res.status(200).json({
        success: true,
        data: authors,
        query,
        count: authors.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getTopAuthors(req, res) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 10, 100);
      const authors = await Author.getTopAuthors(limit);

      res.status(200).json({ success: true, data: authors });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = await Author.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AuthorController;
