const express = require('express');
const ReviewController = require('../controllers/ReviewController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/paper/:paperId', ReviewController.getByPaper);
router.post('/', AuthMiddleware.verifyToken, ReviewController.create);
router.put('/:reviewId', AuthMiddleware.verifyToken, ReviewController.update);
router.delete('/:reviewId', AuthMiddleware.verifyToken, ReviewController.delete);

module.exports = router;
