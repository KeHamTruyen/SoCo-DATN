import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import * as aiController from '../controllers/ai.controller.js';
import {
	generatePostTextValidation,
	buyerAssistantChatValidation,
} from '../validators/ai.validator.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI-assisted content generation and buyer support endpoints
 */

/**
 * @swagger
 * /api/ai/posts/generate-text:
 *   post:
 *     summary: Generate social post captions with AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idea
 *             properties:
 *               idea:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 2000
 *                 example: Ao thun nam form regular cho mua he
 *               productDescription:
 *                 type: string
 *                 maxLength: 3000
 *                 nullable: true
 *               productImageUrls:
 *                 type: array
 *                 maxItems: 5
 *                 items:
 *                   type: string
 *                   format: uri
 *               tone:
 *                 type: string
 *                 enum: [professional, friendly, urgent, luxury, playful]
 *               goal:
 *                 type: string
 *                 maxLength: 200
 *               productId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: AI text generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: AI text generated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     primary:
 *                       type: string
 *                     model:
 *                       type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to generate AI text
 */
router.post('/posts/generate-text', protect, generatePostTextValidation, aiController.generatePostText);

/**
 * @swagger
 * /api/ai/chat/buyer-assistant:
 *   post:
 *     summary: Get buyer support response with product suggestions and stock hints
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 1000
 *                 example: Goi y ao thun nam duoi 300k va con size M
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Buyer assistant response generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Buyer assistant response generated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     intent:
 *                       type: string
 *                       enum: [recommend, stock, compare]
 *                     reply:
 *                       type: string
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           title:
 *                             type: string
 *                           slug:
 *                             type: string
 *                           price:
 *                             type: number
 *                           stockQuantity:
 *                             type: integer
 *                           status:
 *                             type: string
 *                           imageUrl:
 *                             type: string
 *                             nullable: true
 *                           category:
 *                             type: string
 *                             nullable: true
 *                           variants:
 *                             type: array
 *                             items:
 *                               type: object
 *                     followUpSuggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to generate buyer assistant response
 */
router.post('/chat/buyer-assistant', protect, buyerAssistantChatValidation, aiController.buyerAssistantChat);

export default router;
