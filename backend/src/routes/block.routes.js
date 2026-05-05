import express from 'express';
import * as blockController from '../controllers/block.controller.js';
import * as blockValidator from '../validators/block.validator.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * POST /api/blocks
 * body: { targetUserId }
 */
router.post('/', protect, blockValidator.validateBlock, blockController.block);

/**
 * GET /api/blocks
 */
router.get('/', protect, blockController.list);

/**
 * DELETE /api/blocks/:targetUserId
 */
router.delete('/:targetUserId', protect, blockValidator.validateUnblock, blockController.unblock);

export default router;
