import { Router } from 'express';
import groupController from '../controllers/group.controller.js';
import { protect, optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Create group
router.post('/', protect, groupController.createGroup);

// My groups
router.get('/me', protect, groupController.getMyGroups);

// Browse groups (public)
router.get('/', optionalAuth, groupController.getGroups);

// Get group by slug
router.get('/slug/:slug', optionalAuth, groupController.getGroupBySlug);

// Get group by ID
router.get('/:groupId', optionalAuth, groupController.getGroupById);

// Update / Delete group (admin only)
router.put('/:groupId', protect, groupController.updateGroup);
router.delete('/:groupId', protect, groupController.deleteGroup);

// Join / Leave
router.post('/:groupId/join', protect, groupController.joinGroup);
router.post('/:groupId/leave', protect, groupController.leaveGroup);

// Members
router.get('/:groupId/members', groupController.getMembers);
router.patch('/:groupId/members/:userId/role', protect, groupController.updateMemberRole);
router.delete('/:groupId/members/:userId', protect, groupController.removeMember);

export default router;
