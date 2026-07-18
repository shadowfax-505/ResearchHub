const express = require('express');
const AuthorController = require('../controllers/AuthorController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/top', AuthorController.getTopAuthors);
router.get('/stats', AuthorController.getStats);
router.get('/search', AuthorController.search);
router.post('/:authorId/claim', AuthMiddleware.verifyToken, AuthorController.requestClaim);
router.patch('/claims/:claimId', AuthMiddleware.verifyToken, AuthMiddleware.verifyRole('admin', 'moderator'), AuthorController.reviewClaim);
router.get('/:authorId', AuthorController.getById);
router.get('/', AuthorController.getAll);

router.post('/:authorId/follow', AuthMiddleware.verifyToken, AuthorController.follow);
router.delete('/:authorId/follow', AuthMiddleware.verifyToken, AuthorController.unfollow);
router.get('/:authorId/following', AuthMiddleware.verifyToken, AuthorController.isFollowing);

module.exports = router;
