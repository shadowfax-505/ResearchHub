const express = require('express');
const NetworkController = require('../controllers/NetworkController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(AuthMiddleware.verifyToken);

router.get('/recommendations', NetworkController.getRecommendations);

module.exports = router;
