/**
 * Keyword Routes
 * API endpoints for keyword operations
 */

const express = require('express');
const KeywordController = require('../controllers/KeywordController');

const router = express.Router();

router.get('/top', KeywordController.getTopKeywords);
router.get('/stats', KeywordController.getStats);
router.get('/search', KeywordController.search);
router.get('/:keywordId', KeywordController.getById);
router.get('/', KeywordController.getAll);

module.exports = router;
