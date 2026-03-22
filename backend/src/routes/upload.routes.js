import express from 'express';
import prisma from '../config/database.js';
import { protect, protectUserOrAdmin } from '../middlewares/auth.middleware.js';
import {
  uploadProduct,
  uploadAvatar,
  uploadPost,
  uploadShopLogo,
  uploadShopCover,
  uploadSellerIdDoc,
  signedAuthenticatedImageUrl,
} from '../config/cloudinary.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload endpoints
 */

/**
 * @swagger
 * /api/upload/product:
 *   post:
 *     tags: [Upload]
 *     summary: Upload single product image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (max 5MB)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
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
 *                   example: Image uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/v1234567890/social-commerce/products/abc123.jpg
 *                     publicId:
 *                       type: string
 *                       example: social-commerce/products/abc123
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 */
router.post('/product', protect, uploadProduct.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.filename,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/upload/products:
 *   post:
 *     tags: [Upload]
 *     summary: Upload multiple product images (max 10)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Multiple image files (max 5MB each)
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                           publicId:
 *                             type: string
 */
router.post('/products', protect, uploadProduct.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    const uploadedImages = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
    }));

    res.json({
      success: true,
      message: `${req.files.length} images uploaded successfully`,
      data: {
        images: uploadedImages,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/upload/avatar:
 *   post:
 *     tags: [Upload]
 *     summary: Upload user avatar
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image (max 2MB, 400x400)
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 */
router.post('/shop-logo', protect, uploadShopLogo.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    res.json({
      success: true,
      message: 'Shop logo uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.filename,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload shop logo',
      error: error.message,
    });
  }
});

router.post('/shop-cover', protect, uploadShopCover.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    res.json({
      success: true,
      message: 'Shop cover uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.filename,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload shop cover',
      error: error.message,
    });
  }
});

/**
 * Signed URL for authenticated ID uploads (owner or admin).
 * Query: publicId
 */
router.get('/seller-id-doc/signed', protectUserOrAdmin, async (req, res, next) => {
  try {
    const publicId = req.query.publicId;
    if (!publicId || typeof publicId !== 'string') {
      return res.status(400).json({ success: false, message: 'publicId is required' });
    }

    let allowed = false;
    if (req.admin) {
      allowed = publicId.includes('seller-id-docs');
    } else {
      const v = await prisma.sellerVerification.findUnique({ where: { userId: req.user.id } });
      const owned = [v?.idCardFrontPublicId, v?.idCardBackPublicId].filter(Boolean);
      if (owned.includes(publicId)) allowed = true;
      if (!allowed) {
        const pending = await prisma.sellerSensitiveChangeRequest.findFirst({
          where: { userId: req.user.id, status: 'PENDING' },
        });
        if (pending) {
          const pids = [pending.idCardFrontPublicId, pending.idCardBackPublicId].filter(Boolean);
          if (pids.includes(publicId)) allowed = true;
        }
      }
    }

    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Not allowed to access this asset' });
    }

    const url = signedAuthenticatedImageUrl(publicId);
    if (!url) {
      return res.status(400).json({ success: false, message: 'Could not generate signed URL' });
    }

    res.json({ success: true, data: { url } });
  } catch (error) {
    next(error);
  }
});

/** Seller KYC — front or back of ID / passport (field: image). */
router.post('/seller-id-doc', protect, uploadSellerIdDoc.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    res.json({
      success: true,
      message: 'ID document image uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.filename,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload ID document',
      error: error.message,
    });
  }
});

router.post('/avatar', protect, uploadAvatar.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.filename,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /api/upload/post:
 *   post:
 *     tags: [Upload]
 *     summary: Upload post media (image or video)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: Media file (max 10MB)
 *     responses:
 *       200:
 *         description: Media uploaded successfully
 */
router.post('/post', protect, uploadPost.single('media'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    res.json({
      success: true,
      message: 'Media uploaded successfully',
      data: {
        url: req.file.path,
        publicId: req.file.filename,
        resourceType: req.file.resource_type,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload media',
      error: error.message,
    });
  }
});

export default router;
