import express from 'express';
import categoryController from '../controllers/category.controller.js';

const router = express.Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/', categoryController.getCategories);

/**
 * @swagger
 * /categories/root:
 *   get:
 *     summary: Get root categories only
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Root categories retrieved successfully
 */
router.get('/root', categoryController.getRootCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID or slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       404:
 *         description: Category not found
 */
router.get('/:id', categoryController.getCategory);

export default router;
