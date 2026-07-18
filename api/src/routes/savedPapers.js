const express = require('express');
const SavedPaperController = require('../controllers/SavedPaperController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(AuthMiddleware.verifyToken);
router.get('/', SavedPaperController.getAll);
router.post('/', SavedPaperController.create);
router.delete('/:paperId', SavedPaperController.delete);

module.exports = router;
