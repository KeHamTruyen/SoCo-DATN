import express from 'express';
import userController from '../controllers/user.controller.js';
import { protect, optionalAuth } from '../middlewares/auth.middleware.js';
import { ensureNotBlocked } from '../middlewares/block.middleware.js';

const router = express.Router();

// Protected routes (must be before /:userId)
router.get('/me', protect, userController.getMyProfile);
router.put('/me', protect, userController.updateProfile);
router.get('/suggested', protect, userController.getSuggestedUsers);
router.get('/search', optionalAuth, userController.searchUsers);

router.post('/:userId/follow', protect, ensureNotBlocked, userController.follow);
router.delete('/:userId/follow', protect, ensureNotBlocked, userController.unfollow);

// Follow lists
router.get('/:userId/followers', userController.getFollowers);
router.get('/:userId/following', userController.getFollowing);

// Public profile
router.get('/username/:username', optionalAuth, userController.getUserByUsername);
router.get('/:userId', optionalAuth, userController.getUserById);

export default router;
