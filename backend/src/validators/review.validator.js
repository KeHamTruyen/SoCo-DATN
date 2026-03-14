import { body, param, query, validationResult } from 'express-validator';

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

export const validateProductReviewsQuery = [
  param('productId')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

export const validateCreateReview = [
  body('productId')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),

  body('orderItemId')
    .optional({ nullable: true })
    .isUUID()
    .withMessage('Order item ID must be a valid UUID'),

  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('title')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),

  body('content')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Content must not exceed 2000 characters'),

  body('images')
    .optional({ nullable: true })
    .isArray({ max: 10 })
    .withMessage('Images must be an array with maximum 10 items'),

  body('images.*')
    .optional({ nullable: true })
    .isURL()
    .withMessage('Each review image must be a valid URL')
];

export const validateUpdateReview = [
  param('id')
    .isUUID()
    .withMessage('Review ID must be a valid UUID'),

  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('title')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),

  body('content')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Content must not exceed 2000 characters'),

  body('images')
    .optional({ nullable: true })
    .isArray({ max: 10 })
    .withMessage('Images must be an array with maximum 10 items'),

  body('images.*')
    .optional({ nullable: true })
    .isURL()
    .withMessage('Each review image must be a valid URL'),

  body()
    .custom((payload) => {
      const hasAnyUpdatableField =
        Object.prototype.hasOwnProperty.call(payload, 'rating') ||
        Object.prototype.hasOwnProperty.call(payload, 'title') ||
        Object.prototype.hasOwnProperty.call(payload, 'content') ||
        Object.prototype.hasOwnProperty.call(payload, 'images');

      if (!hasAnyUpdatableField) {
        throw new Error('At least one field is required: rating, title, content, images');
      }

      return true;
    })
];

export const validateReviewId = [
  param('id')
    .isUUID()
    .withMessage('Review ID must be a valid UUID')
];

export const validateSellerReviewsQuery = [
  query('hasResponse')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('hasResponse must be true or false'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

export const validateRespondToReview = [
  param('id')
    .isUUID()
    .withMessage('Review ID must be a valid UUID'),

  body('response')
    .trim()
    .notEmpty()
    .withMessage('Response is required')
    .isLength({ max: 1000 })
    .withMessage('Response must be less than 1000 characters')
];

export const validateModerationListQuery = [
  query('q')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('q must not exceed 200 characters'),

  query('isPublished')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isPublished must be true or false'),

  query('hasResponse')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('hasResponse must be true or false'),

  query('productId')
    .optional()
    .isUUID()
    .withMessage('productId must be a valid UUID'),

  query('userId')
    .optional()
    .isUUID()
    .withMessage('userId must be a valid UUID'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

export const validateModerateReview = [
  param('id')
    .isUUID()
    .withMessage('Review ID must be a valid UUID'),

  body('isPublished')
    .isBoolean()
    .withMessage('isPublished must be a boolean')
];
