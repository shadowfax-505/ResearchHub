const express = require('express');
const QuestionController = require('../controllers/QuestionController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', AuthMiddleware.optionalToken, QuestionController.getAll);
router.get('/me', AuthMiddleware.verifyToken, QuestionController.getMyQuestions);
router.get('/:questionId', QuestionController.getById);
router.post('/', AuthMiddleware.verifyToken, QuestionController.create);
router.post('/:questionId/answers', AuthMiddleware.verifyToken, QuestionController.answer);
router.post('/answers/:answerId/upvote', AuthMiddleware.verifyToken, QuestionController.upvoteAnswer);

module.exports = router;
