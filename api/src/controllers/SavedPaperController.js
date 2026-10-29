const { isDatabaseUnavailable, sendDatabaseUnavailable } = require('../utils/errors');
const Joi = require('joi');
const SavedPaper = require('../models/SavedPaper');
const Paper = require('../models/Paper');
const ResearcherStats = require('../models/ResearcherStats');

const saveSchema = Joi.object({
  paper_id: Joi.number().integer().positive().required(),
  collection_name: Joi.string().max(100).allow('', null)
});

class SavedPaperController {
  static async getAll(req, res) {
    try {
      const papers = await SavedPaper.findByUser(req.user.user_id);
      const papersWithAuthors = await Paper.attachAuthors(papers);
      res.status(200).json({ success: true, data: papersWithAuthors, count: papersWithAuthors.length });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    const { error, value } = saveSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      const paper = await Paper.findById(value.paper_id);
      if (!paper || !Paper.canRead(paper, req.user)) return res.status(404).json({ error: 'Paper not found' });
      await SavedPaper.create(req.user.user_id, value.paper_id, value.collection_name || 'Saved Papers');
      await ResearcherStats.refreshForUser(req.user.user_id).catch(() => undefined);
      res.status(201).json({
        success: true,
        data: {
          user_id: req.user.user_id,
          paper_id: value.paper_id,
          collection_name: value.collection_name || 'Saved Papers'
        }
      });
    } catch (err) {
      if (isDatabaseUnavailable(err)) return sendDatabaseUnavailable(res);
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      await SavedPaper.delete(req.user.user_id, req.params.paperId);
      await ResearcherStats.refreshForUser(req.user.user_id).catch(() => undefined);
      res.status(200).json({ success: true, message: 'Saved paper removed' });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return sendDatabaseUnavailable(res);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = SavedPaperController;
