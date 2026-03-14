import { query, validationResult } from 'express-validator';

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

const paginationValidators = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50')
];

export const validateSearchAll = [
  query('q').optional().trim().isLength({ max: 200 }).withMessage('q must not exceed 200 characters'),
  query('limit').optional().isInt({ min: 1, max: 10 }).withMessage('limit must be between 1 and 10')
];

export const validateProductSearch = [
  ...paginationValidators,
  query('q').optional().trim().isLength({ max: 200 }).withMessage('q must not exceed 200 characters'),
  query('categoryId').optional().isUUID().withMessage('categoryId must be a valid UUID'),
  query('sellerId').optional().isUUID().withMessage('sellerId must be a valid UUID'),
  query('status').optional().isIn(['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED']).withMessage('invalid status'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice must be >= 0'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be >= 0'),
  query('sortBy').optional().isIn(['createdAt', 'price', 'viewsCount', 'salesCount', 'title']).withMessage('invalid sortBy'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc')
];

export const validateUserSearch = [
  ...paginationValidators,
  query('q').optional().trim().isLength({ max: 200 }).withMessage('q must not exceed 200 characters'),
  query('role').optional().isIn(['BUYER', 'SELLER', 'ADMIN']).withMessage('invalid role'),
  query('verified').optional().isIn(['true', 'false']).withMessage('verified must be true or false')
];

export const validatePostSearch = [
  ...paginationValidators,
  query('q').optional().trim().isLength({ max: 200 }).withMessage('q must not exceed 200 characters'),
  query('authorId').optional().isUUID().withMessage('authorId must be a valid UUID'),
  query('dateFrom').optional().isISO8601().withMessage('dateFrom must be a valid ISO date'),
  query('dateTo').optional().isISO8601().withMessage('dateTo must be a valid ISO date')
];