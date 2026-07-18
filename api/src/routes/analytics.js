const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/AnalyticsController');
const AuthMiddleware = require('../middleware/auth');

router.get('/my-stats', AuthMiddleware.verifyToken, AnalyticsController.getMyStats);
router.get('/platform', AnalyticsController.getPlatformStats);

module.exports = router;
