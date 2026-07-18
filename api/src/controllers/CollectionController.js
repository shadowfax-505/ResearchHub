const Joi = require('joi');
const Collection = require('../models/Collection');
const { demoCollections, demoSavedPapers, isDatabaseUnavailable } = require('../utils/demoData');
const SavedPaper = require('../models/SavedPaper');

const collectionSchema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().max(500).allow('', null)
});

class CollectionController {
  static async getAll(req, res) {
    try {
      const collections = await Collection.findByUser(req.user.user_id);
      res.status(200).json({ success: true, data: collections, count: collections.length });
    } catch (error) {
      if (isDatabaseUnavailable(error)) {
        return res.status(200).json({ success: true, source: 'demo', data: demoCollections, count: demoCollections.length });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    const { error, value } = collectionSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      await Collection.create(req.user.user_id, value.name, value.description || null);
      res.status(201).json({
        success: true,
        data: {
          user_id: req.user.user_id,
          name: value.name,
          description: value.description || null
        }
      });
    } catch (err) {
      if (isDatabaseUnavailable(err)) {
        return res.status(201).json({
          success: true,
          source: 'demo',
          data: {
            user_id: req.user.user_id,
            name: value.name,
            description: value.description || null
          }
        });
      }
      res.status(500).json({ error: err.message });
    }
  }

  static async getPapers(req, res) {
    try {
      const collectionName = req.params.name;
      const papers = await SavedPaper.findByCollection(req.user.user_id, collectionName);
      res.status(200).json({ success: true, data: papers, count: papers.length });
    } catch (error) {
      if (isDatabaseUnavailable(error)) {
        return res.status(200).json({ success: true, source: 'demo', data: demoSavedPapers, count: demoSavedPapers.length });
      }
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = CollectionController;
