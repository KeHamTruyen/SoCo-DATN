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

export const createScheduledPostValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 5000 })
    .withMessage('Content must not exceed 5000 characters'),
  body('mediaUrls')
    .optional()
    .isArray()
    .withMessage('Media URLs must be an array'),
  body('mediaUrls.*')
    .optional()
    .isURL()
    .withMessage('Each media URL must be a valid URL'),
  body('mediaType')
    .optional()
    .isIn(['IMAGE', 'VIDEO', 'NONE'])
    .withMessage('Media type must be IMAGE, VIDEO, or NONE'),
  body('productId')
    .optional({ nullable: true, checkFalsy: true })
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  body('scheduledTime')
    .notEmpty()
    .withMessage('Scheduled time is required')
    .isISO8601()
    .withMessage('Scheduled time must be a valid ISO date-time'),
  body('timezone')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Timezone must not exceed 50 characters')
];

export const listScheduledPostsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['all', 'scheduled', 'published', 'failed']).withMessage('Status is invalid'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('search').optional().trim().isLength({ max: 200 }).withMessage('Search query must not exceed 200 characters'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid date')
];

export const scheduledPostIdValidation = [
  param('id').isUUID().withMessage('Scheduled post ID must be a valid UUID')
];
