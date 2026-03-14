import express from 'express';
import userController from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile management endpoints
 */

/**
 * Get current user profile
 * GET /api/users/me
 * Requires authentication
 */
router.get('/me', protect, userController.getMyProfile);

/**
 * Update current user profile
 * PUT /api/users/me
 * Requires authentication
 */
router.put('/me', protect, userController.updateProfile);

/**
 * Follow/unfollow and social graph
 */
router.post('/:userId/follow', protect, userController.followUser);
router.delete('/:userId/follow', protect, userController.unfollowUser);
router.get('/:userId/followers', userController.getFollowers);
router.get('/:userId/following', userController.getFollowing);

/**
 * Search users
 * GET /api/users/search?q=keyword&role=SELLER
 * Public route
 */
router.get('/search', userController.searchUsers);

/**
 * Get user profile by username
 * GET /api/users/username/:username
 * Public route
 */
router.get('/username/:username', userController.getUserByUsername);

/**
 * Get user profile by ID
 * GET /api/users/:userId
 * Public route
 */
router.get('/:userId', userController.getUserById);

export default router;
