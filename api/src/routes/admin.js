const express = require('express');
const AdminController = require('../controllers/AdminController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(AuthMiddleware.verifyToken, AuthMiddleware.verifyRole('admin', 'moderator'));

router.get('/dashboard', AdminController.getDashboard);
router.get('/users', AdminController.getUsers);
router.post('/stats/recalculate', AdminController.recalculateStats);
router.get('/moderation/cases', AdminController.getModerationCases);
router.post('/moderation/cases/:caseId/actions', AdminController.applyModerationAction);
router.get('/audit-logs', AdminController.getAuditLogs);
router.get('/email-queue', AdminController.getEmailQueue);
router.post('/email-queue/:emailId/retry', AdminController.retryEmail);
router.patch('/users/:userId/status', AdminController.setUserStatus);
router.post('/users/:userId/roles', AdminController.assignRole);
router.get('/activity', AdminController.getPlatformActivity);
router.get('/unverified-users', AdminController.getUnverifiedUsers);
router.get('/author-claims', AdminController.getAuthorClaims);
router.put('/users/:userId/verify', AdminController.verifyUser);
router.get('/verification-requests', AdminController.getVerificationRequests);
router.put('/verification-requests/:requestId', AdminController.decideVerification);

module.exports = router;
