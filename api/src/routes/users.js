/**
 * User Routes
 * API endpoints for user operations
 */

const express = require('express');
const UserController = require('../controllers/UserController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// Protected routes (require authentication)
router.get('/', AuthMiddleware.verifyToken, UserController.getAll);
router.get('/stats', AuthMiddleware.verifyToken, UserController.getStats);
router.get('/:userId', AuthMiddleware.verifyToken, UserController.getById);
router.put('/:userId', AuthMiddleware.verifyToken, UserController.update);
router.delete('/:userId', AuthMiddleware.verifyToken, UserController.delete);

module.exports = router;
