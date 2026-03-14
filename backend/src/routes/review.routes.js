import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import * as reviewController from '../controllers/review.controller.js';
import * as reviewValidator from '../validators/review.validator.js';

const router = express.Router();

/**
 * @swagger
 * /api/reviews/product/{productId}:
 *   get:
 *     summary: Get published reviews for a product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product reviews retrieved successfully
 */
router.get(
	'/product/:productId',
	reviewValidator.validateProductReviewsQuery,
	reviewValidator.validate,
	reviewController.getProductReviews
);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create review for product
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Review created successfully
 */
router.post(
	'/',
	protect,
	reviewValidator.validateCreateReview,
	reviewValidator.validate,
	reviewController.createReview
);

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Update own review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Review updated successfully
 */
router.put(
	'/:id',
	protect,
	reviewValidator.validateUpdateReview,
	reviewValidator.validate,
	reviewController.updateOwnReview
);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete own review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Review deleted successfully
 */
router.delete(
	'/:id',
	protect,
	reviewValidator.validateReviewId,
	reviewValidator.validate,
	reviewController.deleteOwnReview
);

/**
 * @swagger
 * /api/reviews/seller/me:
 *   get:
 *     summary: Get seller's product reviews
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hasResponse
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by response status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
	'/seller/me',
	protect,
	reviewValidator.validateSellerReviewsQuery,
	reviewValidator.validate,
	reviewController.getMyReviews
);

/**
 * @swagger
 * /api/reviews/{id}/response:
 *   post:
 *     summary: Respond to a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - response
 *             properties:
 *               response:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Response added successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
router.post(
	'/:id/response',
	protect,
	reviewValidator.validateRespondToReview,
	reviewValidator.validate,
	reviewController.respondToReview
);

/**
 * @swagger
 * /api/reviews/{id}/response:
 *   delete:
 *     summary: Delete seller response
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Response deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Review not found
 */
router.delete(
	'/:id/response',
	protect,
	reviewValidator.validateReviewId,
	reviewValidator.validate,
	reviewController.deleteResponse
);

router.get(
	'/admin',
	protect,
	restrictTo('ADMIN'),
	reviewValidator.validateModerationListQuery,
	reviewValidator.validate,
	reviewController.getReviewsForModeration
);

router.patch(
	'/:id/moderation',
	protect,
	restrictTo('ADMIN'),
	reviewValidator.validateModerateReview,
	reviewValidator.validate,
	reviewController.moderateReview
);

export default router;
