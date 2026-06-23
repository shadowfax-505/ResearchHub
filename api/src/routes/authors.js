/**
 * Author Routes
 * API endpoints for author operations
 */

const express = require('express');
const AuthorController = require('../controllers/AuthorController');

const router = express.Router();

router.get('/top', AuthorController.getTopAuthors);
router.get('/stats', AuthorController.getStats);
router.get('/search', AuthorController.search);
router.get('/:authorId', AuthorController.getById);
router.get('/', AuthorController.getAll);

module.exports = router;
