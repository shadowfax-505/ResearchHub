

const express = require('express');
const PaperController = require('../controllers/PaperController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/search', PaperController.search);
router.get('/feed', AuthMiddleware.verifyToken, PaperController.getFeed);
router.get('/top-cited', PaperController.getTopCited);
router.get('/trending', PaperController.getTrending);
router.get('/stats', PaperController.getStats);
router.get('/trending-fields', PaperController.getTrendingFields);
router.post('/:paperId/request-fulltext', AuthMiddleware.verifyToken, PaperController.requestFullText);
router.post('/:paperId/recommend', AuthMiddleware.verifyToken, PaperController.recommend);
router.delete('/:paperId/recommend', AuthMiddleware.verifyToken, PaperController.unrecommend);
router.get('/author/:authorId', PaperController.getByAuthor);
router.get('/:paperId', PaperController.getById);

router.post('/', AuthMiddleware.verifyToken, PaperController.create);

module.exports = router;
