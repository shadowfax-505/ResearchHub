

const express = require('express');
const UserController = require('../controllers/UserController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/logout', UserController.logout);
router.post('/me/resend-verification', AuthMiddleware.verifyToken, UserController.resendVerification);
router.get('/verify-email', UserController.verifyEmail);
router.post('/verify-email', UserController.verifyEmail);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);

router.get('/', AuthMiddleware.verifyToken, AuthMiddleware.verifyRole('admin'), UserController.getAll);
router.get('/stats', AuthMiddleware.verifyToken, AuthMiddleware.verifyRole('admin'), UserController.getStats);
router.get('/me/stats', AuthMiddleware.verifyToken, UserController.getMyStats);
router.get('/:userId', AuthMiddleware.verifyToken, UserController.getById);
router.put('/:userId', AuthMiddleware.verifyToken, UserController.update);
router.delete('/:userId', AuthMiddleware.verifyToken, UserController.delete);

module.exports = router;
