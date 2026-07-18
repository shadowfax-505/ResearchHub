const express = require('express');
const CitationController = require('../controllers/CitationController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(AuthMiddleware.verifyToken);
router.get('/export', CitationController.export);

module.exports = router;
