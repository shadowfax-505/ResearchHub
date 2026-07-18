const Joi = require('joi');
const SavedPaper = require('../models/SavedPaper');
const Paper = require('../models/Paper');
const ResearcherStats = require('../models/ResearcherStats');
const { demoSavedPapers, isDatabaseUnavailable } = require('../utils/demoData');

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
      if (isDatabaseUnavailable(error)) {
        return res.status(200).json({ success: true, source: 'demo', data: demoSavedPapers, count: demoSavedPapers.length });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    const { error, value } = saveSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
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
      if (isDatabaseUnavailable(err)) {
        return res.status(201).json({
          success: true,
          source: 'demo',
          data: {
            user_id: req.user.user_id,
            paper_id: value.paper_id,
            collection_name: value.collection_name || 'Saved Papers'
          }
        });
      }
      res.status(500).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      await SavedPaper.delete(req.user.user_id, req.params.paperId);
      await ResearcherStats.refreshForUser(req.user.user_id).catch(() => undefined);
      res.status(200).json({ success: true, message: 'Saved paper removed' });
    } catch (error) {
      if (isDatabaseUnavailable(error)) return res.status(200).json({ success: true, source: 'demo', message: 'Saved paper removed' });
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = SavedPaperController;
