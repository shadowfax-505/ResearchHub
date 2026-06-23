/**
 * Journal Routes
 * API endpoints for journal operations
 */

const express = require('express');
const JournalController = require('../controllers/JournalController');

const router = express.Router();

router.get('/top', JournalController.getTopJournals);
router.get('/stats', JournalController.getStats);
router.get('/search', JournalController.search);
router.get('/:journalId', JournalController.getById);
router.get('/', JournalController.getAll);

module.exports = router;
