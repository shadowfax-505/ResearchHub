

const Author = require('../models/Author');
const FollowedAuthor = require('../models/FollowedAuthor');
const ResearcherStats = require('../models/ResearcherStats');
const Joi = require('joi');

const claimSchema = Joi.object({ status: Joi.string().valid('verified', 'rejected').required() });

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

  static async follow(req, res) {
    try {
      const authorId = req.params.authorId;
      const already = await FollowedAuthor.isFollowing(req.user.user_id, authorId);
      if (already) {
        return res.status(409).json({ error: 'Already following this author' });
      }
      await FollowedAuthor.follow(req.user.user_id, authorId);
      await ResearcherStats.refreshForUser(req.user.user_id).catch(() => undefined);
      const followerCount = await FollowedAuthor.getFollowerCount(authorId);
      res.status(201).json({ success: true, message: 'Now following author', data: { follower_count: followerCount } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async unfollow(req, res) {
    try {
      const authorId = req.params.authorId;
      const deleted = await FollowedAuthor.unfollow(req.user.user_id, authorId);
      if (deleted === 0) {
        return res.status(404).json({ error: 'Not following this author' });
      }
      await ResearcherStats.refreshForUser(req.user.user_id).catch(() => undefined);
      const followerCount = await FollowedAuthor.getFollowerCount(authorId);
      res.status(200).json({ success: true, message: 'Unfollowed author', data: { follower_count: followerCount } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async isFollowing(req, res) {
    try {
      const following = await FollowedAuthor.isFollowing(req.user.user_id, req.params.authorId);
      res.status(200).json({ success: true, data: { is_following: following } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async requestClaim(req, res) {
    try {
      const author = await Author.findById(req.params.authorId);
      if (!author) return res.status(404).json({ error: 'Author not found' });
      const claimId = await Author.requestClaim(req.user.user_id, Number(req.params.authorId));
      res.status(201).json({ success: true, data: { claim_id: claimId, status: 'pending' } });
    } catch (error) {
      if (/ORA-00001/.test(String(error.message))) return res.status(409).json({ error: 'You already submitted a claim for this author' });
      res.status(500).json({ error: error.message });
    }
  }

  static async reviewClaim(req, res) {
    const { error, value } = claimSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    try {
      const updated = await Author.reviewClaim(Number(req.params.claimId), req.user.user_id, value.status);
      if (!updated) return res.status(404).json({ error: 'Pending claim not found' });
      res.status(200).json({ success: true, data: { status: value.status } });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = AuthorController;
