import express from 'express';
import productController from '../controllers/product.controller.js';
import { protect, restrictTo, optionalAuth } from '../middlewares/auth.middleware.js';
import {
  validate,
  createProductValidation,
  updateProductValidation,
  getProductsValidation,
  getTrendingProductsValidation,
  productIdValidation,
  addImagesValidation
} from '../validators/product.validator.js';
import { optimizeAndUploadProductImages, uploadProductImagesMulter } from '../middlewares/product-image-upload.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products with filters
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, price, viewsCount, salesCount, title]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get('/', getProductsValidation, validate, productController.getProducts);

/**
 * @swagger
 * /products/trending:
 *   get:
 *     summary: Get trending products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 12
 *     responses:
 *       200:
 *         description: Trending products retrieved successfully
 */
router.get('/trending', getTrendingProductsValidation, validate, productController.getTrendingProducts);

/**
 * @swagger
 * /products/seller/me:
 *   get:
 *     summary: Get current seller's products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, ACTIVE, OUT_OF_STOCK, ARCHIVED]
 *     responses:
 *       200:
 *         description: Seller products retrieved successfully
 */
router.get('/seller/me', protect, restrictTo('SELLER', 'ADMIN'), productController.getMyProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID or slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found
 */
router.get('/:id', optionalAuth, productIdValidation, validate, productController.getProduct);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create new product (Verified seller or admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     description: Sellers must have an approved seller verification before they can create products. Admins can create products without seller verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               compareAtPrice:
 *                 type: number
 *               categoryId:
 *                 type: string
 *               stockQuantity:
 *                 type: integer
 *               sku:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     altText:
 *                       type: string
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Product created successfully
 *       403:
 *         description: Seller verification approval is required to create products
 */
router.post(
  '/',
  protect,
  restrictTo('SELLER', 'ADMIN'),
  createProductValidation,
  validate,
  productController.createProduct
);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update product (Seller only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Product updated successfully
 */
router.put(
  '/:id',
  protect,
  restrictTo('SELLER', 'ADMIN'),
  productIdValidation,
  updateProductValidation,
  validate,
  productController.updateProduct
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete product (Seller only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 */
router.delete(
  '/:id',
  protect,
  restrictTo('SELLER', 'ADMIN'),
  productIdValidation,
  validate,
  productController.deleteProduct
);

/**
 * @swagger
 * /products/{id}/publish:
 *   post:
 *     summary: Publish product (Seller only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product published successfully
 */
router.post(
  '/:id/publish',
  protect,
  restrictTo('SELLER', 'ADMIN'),
  productIdValidation,
  validate,
  productController.publishProduct
);

/**
 * @swagger
 * /products/{id}/images:
 *   post:
 *     summary: Add product images (Seller only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     altText:
 *                       type: string
 *     responses:
 *       200:
 *         description: Images added successfully
 */
router.post(
  '/:id/images',
  protect,
  restrictTo('SELLER', 'ADMIN'),
  productIdValidation,
  addImagesValidation,
  validate,
  productController.addProductImages
);

/**
 * @swagger
 * /products/{id}/images/upload:
 *   post:
 *     summary: Upload and attach product images (Seller only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *               altTexts:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Product images uploaded successfully
 */
router.post(
  '/:id/images/upload',
  protect,
  restrictTo('SELLER', 'ADMIN'),
  productIdValidation,
  validate,
  uploadProductImagesMulter.array('images', 10),
  optimizeAndUploadProductImages,
  productController.uploadProductImages
);

/**
 * @swagger
 * /products/{id}/images/{imageId}:
 *   delete:
 *     summary: Delete product image (Seller only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image deleted successfully
 */
router.delete(
  '/:id/images/:imageId',
  protect,
  restrictTo('SELLER', 'ADMIN'),
  productIdValidation,
  validate,
  productController.deleteProductImage
);

export default router;
