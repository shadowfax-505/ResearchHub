const { isDatabaseUnavailable, sendDatabaseUnavailable } = require('../utils/errors');


const Joi = require('joi');
const Paper = require('../models/Paper');
const Author = require('../models/Author');
const EmailQueue = require('../models/EmailQueue');
const Notification = require('../models/Notification');
const ResearcherStats = require('../models/ResearcherStats');
const { pool } = require('../config/database');

async function ensureUserAuthorClaim(userId, userDetails, tx) {
  // Serialize first publication creation for this account. A matching name is not identity proof.
  await tx.query('SELECT user_id FROM USERS WHERE user_id = ? FOR UPDATE', [userId]);
  const [claims] = await tx.query("SELECT author_id FROM USER_AUTHOR_CLAIMS WHERE user_id = ? AND status = 'verified' FETCH FIRST 1 ROW ONLY", [userId]);
  if (claims[0]) return claims[0].author_id;
  const authorId = await Author.create({ full_name: userDetails.full_name || userDetails.username, affiliation: userDetails.affiliation || null, country: userDetails.country || null, email: userDetails.email || null }, tx);
  await tx.query("INSERT INTO USER_AUTHOR_CLAIMS (user_id, author_id, status, created_at) VALUES (?, ?, 'verified', SYSTIMESTAMP)", [userId, authorId]);
  return authorId;
}

const createPaperSchema = Joi.object({
  journal_id: Joi.number().integer().allow(null),
  title: Joi.string().min(1).max(500).required(),
  abstract: Joi.string().allow('', null).default(''),
  doi: Joi.string().allow('', null).default(''),
  publication_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  volume: Joi.string().allow('', null).default(''),
  issue: Joi.string().allow('', null).default(''),
  pages: Joi.string().allow('', null).default(''),
  pdf_url: Joi.string().uri().allow('', null).default(''),
  cover_image_url: Joi.string().uri({ scheme: ['http', 'https'] }).max(1000).allow('', null).default(''),
  language: Joi.string().valid('en', 'English', 'fr', 'de', 'es', 'zh').default('en'),
  is_peer_reviewed: Joi.boolean().default(true),
  publication_type: Joi.string().valid('article', 'preprint', 'conference', 'data', 'thesis', 'book').default('article'),
  is_open_access: Joi.boolean().default(false),
  visibility: Joi.string().valid('public', 'network', 'private').default('public'),
  status: Joi.string().valid('draft', 'submitted', 'published').default('published'),
  authors: Joi.array().items(Joi.object({
    author_id: Joi.number().integer().positive(),
    full_name: Joi.string().max(300),
    name: Joi.string().max(300),
    affiliation: Joi.string().max(500).allow('', null),
    country: Joi.string().max(100).allow('', null),
    email: Joi.string().email().allow('', null),
    orcid: Joi.string().max(100).allow('', null),
    author_order: Joi.number().integer().positive()
  })).default([])
});

class PaperController {
  static async getByAuthor(req, res) {
    try {
      const { authorId } = req.params;
      const { limit = 20, offset = 0 } = req.query;
      const numLimit = Math.min(parseInt(limit, 10) || 20, 100);
      const numOffset = parseInt(offset, 10) || 0;

      const papers = await Paper.getByAuthor(parseInt(authorId, 10), numLimit, numOffset);
      const papersWithAuthors = await Paper.attachAuthors(papers);
      res.status(200).json({
        success: true,
        data: papersWithAuthors,
        pagination: { limit: numLimit, offset: numOffset }
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Server error while fetching author papers' });
    }
  }
  static async search(req, res) {
    try {
      const { query = '', field_id, year, journal_id, limit = 20, offset = 0 } = req.query;

      const numLimit = Math.min(parseInt(limit, 10) || 20, 100);
      const numOffset = parseInt(offset, 10) || 0;

      const papers = await Paper.search(
        query,
        {
          field_ids: field_id ? String(field_id).split(',').map(value => parseInt(value, 10)) : undefined,
          year: year ? parseInt(year, 10) : undefined,
          journal_ids: journal_id ? String(journal_id).split(',').map(value => parseInt(value, 10)) : undefined,
          author_ids: req.query.author_id ? String(req.query.author_id).split(',').map(value => parseInt(value, 10)) : undefined,
          year_from: req.query.year_from,
          year_to: req.query.year_to,
          publication_type: req.query.publication_type,
          is_peer_reviewed: req.query.is_peer_reviewed,
          is_open_access: req.query.is_open_access,
          language: req.query.language,
          min_citations: req.query.min_citations,
          max_citations: req.query.max_citations,
          sort: req.query.sort
        },
        numLimit,
        numOffset
      );

      res.status(200).json({
        success: true,
        data: papers,
        query,
        pagination: { limit: numLimit, offset: numOffset }
      });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const paper = await Paper.findById(req.params.paperId);

      if (!paper || !Paper.canRead(paper, req.user)) {
        return res.status(404).json({ error: 'Paper not found' });
      }

      await Paper.incrementViews(req.params.paperId);

      res.status(200).json({ success: true, data: paper });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async getTopCited(req, res) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 10, 100);
      const papers = await Paper.getTopCited(limit);

      res.status(200).json({ success: true, data: papers, count: papers.length });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      res.status(error.status || 500).json({ error: error.message });
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
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async getFeed(req, res) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const papers = await Paper.getFeed(req.user.user_id, limit);
      res.status(200).json({ success: true, data: papers });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'researcher') {
        return res.status(403).json({ error: 'Only researchers and admins can create papers' });
      }

      const { error, value } = createPaperSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const paperId = await pool.transaction(async tx => {
      const userAuthorId = await ensureUserAuthorClaim(req.user.user_id, req.user, tx);

      let authors = value.authors || [];
      if (userAuthorId) {
        const matchingIdx = authors.findIndex(a => a.author_id === userAuthorId || (a.full_name && a.full_name.toLowerCase() === req.user.full_name?.toLowerCase()));
        if (matchingIdx >= 0) {
          authors[matchingIdx].author_id = userAuthorId;
        } else if (authors.length === 0) {
          authors.push({ author_id: userAuthorId, full_name: req.user.full_name || req.user.username, affiliation: req.user.affiliation, author_order: 1 });
        } else {
          authors.push({ author_id: userAuthorId, full_name: req.user.full_name || req.user.username, affiliation: req.user.affiliation, author_order: authors.length + 1 });
        }
      }

      const createdId = await Paper.create({ ...value, owner_user_id: req.user.user_id }, tx);
      await Paper.attachAuthorsToPaper(createdId, authors, tx);
      return createdId;
      });

      res.status(201).json({
        success: true,
        message: 'Paper created successfully',
        data: { paper_id: paperId }
      });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async requestFullText(req, res) {
    try {
      const paper = await Paper.findById(req.params.paperId);
      if (!paper || !Paper.canRead(paper, req.user)) {
        return res.status(404).json({ error: 'Paper not found' });
      }

      const recipientEmail = paper.authors?.find(author => author.email)?.email;
      if (!recipientEmail) {
        return res.status(400).json({ error: 'No author email available for this paper' });
      }

      const subject = `Full-text request for "${paper.title}"`;
      const body = `${req.user.full_name || req.user.username || 'A ResearchHub member'} requested the full text of "${paper.title}".\n\nPaper ID: ${paper.paper_id}`;
      const emailId = await EmailQueue.enqueue(req.user.user_id, recipientEmail, subject, body);

      await Notification.create(
        req.user.user_id,
        'Full-text request queued',
        `Your full-text request for "${paper.title}" was queued for email delivery to ${recipientEmail}.`,
        'email'
      ).catch(() => undefined);

      await ResearcherStats.refreshForUser(req.user.user_id).catch(() => undefined);

      res.status(201).json({
        success: true,
        message: 'Full-text request queued',
        data: { email_id: emailId, recipient_email: recipientEmail, paper_id: paper.paper_id }
      });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = await Paper.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async getTrendingFields(req, res) {
    try {
      const fields = await Paper.getTrendingFields(5);
      res.status(200).json({ success: true, data: fields });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async recommend(req, res) {
    try {
      const paperId = parseInt(req.params.paperId, 10);
      const userId = req.user.user_id;
      
      const paper = await Paper.findById(paperId);
      if (!paper || !Paper.canRead(paper, req.user)) {
        return res.status(404).json({ error: 'Paper not found' });
      }

      const rowsAffected = await Paper.recommend(paperId, userId);
      
      if (rowsAffected > 0) {
        await Notification.create(
          userId, // Should notify the author actually, but sending to self for now to avoid complexity or finding authors
          'Paper Recommended',
          `You recommended "${paper.title}"`,
          'social'
        ).catch(() => undefined);
      }
      
      res.status(200).json({ success: true, message: 'Paper recommended' });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async unrecommend(req, res) {
    try {
      const paperId = parseInt(req.params.paperId, 10);
      const userId = req.user.user_id;

      await Paper.unrecommend(paperId, userId);
      res.status(200).json({ success: true, message: 'Paper recommendation removed' });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      res.status(error.status || 500).json({ error: error.message });
    }
  }
}

module.exports = PaperController;
