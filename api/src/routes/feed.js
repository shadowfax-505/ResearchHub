const express = require('express');
const router = express.Router();
const feedController = require('../controllers/FeedController');
const AuthMiddleware = require('../middleware/auth');
const FeedActionController = require('../controllers/FeedActionController');

// GET /api/v1/feed
router.get('/', AuthMiddleware.optionalToken, feedController.getGlobalFeed);
router.post('/actions', AuthMiddleware.verifyToken, FeedActionController.create);

module.exports = router;
