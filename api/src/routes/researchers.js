const express = require('express');
const ResearcherProfileController = require('../controllers/ResearcherProfileController');
const AuthMiddleware = require('../middleware/auth');
const multer = require('multer');

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
});

const router = express.Router();

router.post('/me', AuthMiddleware.verifyToken, ResearcherProfileController.ensureMine);
router.get('/me', AuthMiddleware.verifyToken, ResearcherProfileController.getMine);
router.put('/me', AuthMiddleware.verifyToken, ResearcherProfileController.updateMine);
router.get('/me/verification-status', AuthMiddleware.verifyToken, ResearcherProfileController.verificationStatus);
router.post('/me/verification-request', AuthMiddleware.verifyToken, ResearcherProfileController.requestVerification);
router.post('/me/avatar', AuthMiddleware.verifyToken, avatarUpload.single('file'), require('../controllers/UploadController').uploadAvatar);
router.get('/institutions/rankings', ResearcherProfileController.getInstitutionalRankings);
router.get('/', ResearcherProfileController.listResearchers);
router.get('/:slug/contributions', ResearcherProfileController.contributions);
router.get('/:slug', ResearcherProfileController.getPublic);

router.post('/:userId/follow', AuthMiddleware.verifyToken, ResearcherProfileController.follow);
router.delete('/:userId/follow', AuthMiddleware.verifyToken, ResearcherProfileController.unfollow);
router.get('/:userId/following', AuthMiddleware.verifyToken, ResearcherProfileController.isFollowing);
router.get('/:userId/following-list', AuthMiddleware.verifyToken, ResearcherProfileController.getFollowingList);
router.get('/:userId/followers', AuthMiddleware.verifyToken, ResearcherProfileController.getFollowersList);

router.post('/me/education', AuthMiddleware.verifyToken, ResearcherProfileController.addEducation);
router.delete('/me/education/:id', AuthMiddleware.verifyToken, ResearcherProfileController.deleteEducation);
router.post('/me/experience', AuthMiddleware.verifyToken, ResearcherProfileController.addExperience);
router.delete('/me/experience/:id', AuthMiddleware.verifyToken, ResearcherProfileController.deleteExperience);
router.post('/me/skills', AuthMiddleware.verifyToken, ResearcherProfileController.addSkill);
router.delete('/me/skills/:id', AuthMiddleware.verifyToken, ResearcherProfileController.deleteSkill);
router.post('/me/languages', AuthMiddleware.verifyToken, ResearcherProfileController.addLanguage);
router.delete('/me/languages/:id', AuthMiddleware.verifyToken, ResearcherProfileController.deleteLanguage);
router.post('/me/disciplines', AuthMiddleware.verifyToken, ResearcherProfileController.addDiscipline);
router.delete('/me/disciplines/:id', AuthMiddleware.verifyToken, ResearcherProfileController.deleteDiscipline);

module.exports = router;
