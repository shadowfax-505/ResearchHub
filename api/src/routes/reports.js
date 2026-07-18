const express = require('express');
const AuthMiddleware = require('../middleware/auth');
const ReportController = require('../controllers/ReportController');

const router = express.Router();
router.use(AuthMiddleware.verifyToken);
router.post('/', ReportController.create);
router.get('/mine', ReportController.getMine);

module.exports = router;
