import { body, query, param } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

export const createProductValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),
  
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('compareAtPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Compare at price must be a positive number'),
  
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID'),
  
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  
  body('sku')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('SKU must not exceed 100 characters'),
  
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('images.*.url')
    .optional()
    .isURL()
    .withMessage('Invalid image URL'),
  
  body('variants')
    .optional()
    .isArray()
    .withMessage('Variants must be an array'),
  
  body('variants.*.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Variant name is required'),
  
  body('variants.*.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Variant price must be a positive number'),
  
  body('variants.*.stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Variant stock quantity must be a non-negative integer')
];

export const updateProductValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('compareAtPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Compare at price must be a positive number'),
  
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID'),
  
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  
  body('status')
    .optional()
    .isIn(['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED'])
    .withMessage('Invalid status')
];

export const getProductsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'price', 'viewsCount', 'salesCount', 'title'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  query('status')
    .optional()
    .isIn(['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED'])
    .withMessage('Invalid status')
];

export const productIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Product ID is required')
];

export const addImagesValidation = [
  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one image is required'),
  
  body('images.*.url')
    .isURL()
    .withMessage('Invalid image URL'),
  
  body('images.*.altText')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Alt text must not exceed 200 characters')
];

// Import validationResult at the top
import { validationResult } from 'express-validator';
