/**
 * Paper Routes
 * API endpoints for paper operations
 */

const express = require('express');
const PaperController = require('../controllers/PaperController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

// Public routes (no authentication required)
router.get('/search', PaperController.search);
router.get('/top-cited', PaperController.getTopCited);
router.get('/trending', PaperController.getTrending);
router.get('/stats', PaperController.getStats);
router.get('/:paperId', PaperController.getById);

// Protected routes (require authentication)
router.post('/', AuthMiddleware.verifyToken, PaperController.create);

module.exports = router;
