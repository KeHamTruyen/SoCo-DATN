import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import * as sellerController from '../controllers/seller.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/seller/stats:
 *   get:
 *     summary: Get seller statistics
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', protect, sellerController.getStats);

export default router;
