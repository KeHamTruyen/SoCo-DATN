import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import * as sellerController from '../controllers/seller.controller.js';
import * as sellerValidator from '../validators/seller.validator.js';
import { uploadSellerVerification } from '../config/cloudinary.js';

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

/**
 * @swagger
 * /api/seller/verification:
 *   get:
 *     summary: Get current seller verification status and saved data
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller verification status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SellerVerificationStatusResponse'
 *       401:
 *         description: Unauthorized
 */
router.get('/verification', protect, sellerController.getVerificationStatus);

/**
 * @swagger
 * /api/seller/verification/upload:
 *   post:
 *     summary: Upload a seller verification document to Cloudinary
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [documentType, file]
 *             properties:
 *               documentType:
 *                 type: string
 *                 enum: [idCardFront, idCardBack, businessLicense]
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Verification document uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SellerVerificationUploadResponse'
 *       400:
 *         description: Invalid document type or missing file
 *       401:
 *         description: Unauthorized
 */
router.post(
	'/verification/upload',
	protect,
	uploadSellerVerification.single('file'),
	sellerValidator.validateUploadDocument,
	sellerValidator.validate,
	sellerController.uploadVerificationFile
);

/**
 * @swagger
 * /api/seller/verification/step-1:
 *   put:
 *     summary: Save seller verification personal information
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idCardNumber, idCardFrontUrl, idCardBackUrl, dateOfBirth, address]
 *             properties:
 *               idCardNumber:
 *                 type: string
 *               idCardFrontUrl:
 *                 type: string
 *                 format: uri
 *               idCardBackUrl:
 *                 type: string
 *                 format: uri
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Seller verification step 1 saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SellerVerificationMutationResponse'
 */
router.put(
	'/verification/step-1',
	protect,
	sellerValidator.validateStep1,
	sellerValidator.validate,
	sellerController.submitStep1
);

/**
 * @swagger
 * /api/seller/verification/step-2:
 *   put:
 *     summary: Save seller verification business information
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [businessName, businessType]
 *             properties:
 *               businessName:
 *                 type: string
 *               businessType:
 *                 type: string
 *               businessLicenseNumber:
 *                 type: string
 *                 nullable: true
 *               businessLicenseUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *               taxCode:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Seller verification step 2 saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SellerVerificationMutationResponse'
 */
router.put(
	'/verification/step-2',
	protect,
	sellerValidator.validateStep2,
	sellerValidator.validate,
	sellerController.submitStep2
);

/**
 * @swagger
 * /api/seller/verification/step-3:
 *   put:
 *     summary: Save seller verification bank information
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bankName, bankAccountNumber, bankAccountName]
 *             properties:
 *               bankName:
 *                 type: string
 *               bankAccountNumber:
 *                 type: string
 *               bankAccountName:
 *                 type: string
 *               bankBranch:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Seller verification step 3 saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SellerVerificationMutationResponse'
 */
router.put(
	'/verification/step-3',
	protect,
	sellerValidator.validateStep3,
	sellerValidator.validate,
	sellerController.submitStep3
);

/**
 * @swagger
 * /api/seller/verification/submit:
 *   post:
 *     summary: Submit completed seller verification for admin review
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Seller verification submitted for review
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SellerVerificationMutationResponse'
 *       400:
 *         description: Verification data is incomplete or already approved
 *       401:
 *         description: Unauthorized
 */
router.post('/verification/submit', protect, sellerController.submitVerificationForReview);

export default router;
