const express = require('express');
const MessageController = require('../controllers/MessageController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(AuthMiddleware.verifyToken);

router.get('/', MessageController.getConversations);
router.get('/search-users', MessageController.searchUsers);
router.get('/requests', MessageController.getRequests);
router.post('/requests', MessageController.createRequest);
router.put('/requests/:id', MessageController.updateRequest);
router.get('/:userId', MessageController.getConversationWithUser);
router.post('/', MessageController.sendMessage);
router.put('/:messageId/read', MessageController.markAsRead);

module.exports = router;
