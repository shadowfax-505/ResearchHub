const express = require('express');
const ResearchRequestController = require('../controllers/ResearchRequestController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(AuthMiddleware.verifyToken);
router.get('/', ResearchRequestController.getAll);
router.post('/', ResearchRequestController.create);
router.get('/received', ResearchRequestController.getReceived);
router.put('/:id/status', ResearchRequestController.updateStatus);

module.exports = router;
