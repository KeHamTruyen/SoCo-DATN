import express from 'express';
import groupController from '../controllers/group.controller.js';
import { protect, optionalAuth } from '../middlewares/auth.middleware.js';
import {
  listGroupsValidation,
  createGroupValidation,
  groupIdValidation,
  listMembersValidation,
  validate
} from '../validators/group.validator.js';

const router = express.Router();

router.get('/', optionalAuth, listGroupsValidation, validate, groupController.listGroups);
router.get('/my', protect, listGroupsValidation, validate, groupController.getMyGroups);
router.post('/', protect, createGroupValidation, validate, groupController.createGroup);
router.get('/:id', optionalAuth, groupIdValidation, validate, groupController.getGroupById);
router.get('/:id/members', optionalAuth, listMembersValidation, validate, groupController.getGroupMembers);
router.post('/:id/join', protect, groupIdValidation, validate, groupController.joinGroup);
router.delete('/:id/join', protect, groupIdValidation, validate, groupController.leaveGroup);

export default router;
