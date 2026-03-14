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

export const validateListQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

export const validateUserId = [
  param('userId')
    .isUUID()
    .withMessage('User ID must be a valid UUID')
];

export const validateProductId = [
  param('productId')
    .isUUID()
    .withMessage('Product ID must be a valid UUID')
];

export const validateOrderId = [
  param('orderId')
    .isUUID()
    .withMessage('Order ID must be a valid UUID')
];

export const validateSetUserStatus = [
  ...validateUserId,
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

export const validateVerifySeller = [
  ...validateUserId,
  body('action')
    .isIn(['approve', 'reject'])
    .withMessage('Action must be approve or reject'),
  body('rejectionReason')
    .optional({ nullable: true })
    .isLength({ max: 500 })
    .withMessage('Rejection reason must not exceed 500 characters')
];

export const validateProductStatusUpdate = [
  ...validateProductId,
  body('status')
    .isIn(['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED'])
    .withMessage('Invalid product status')
];

export const validateOrderStatusUpdate = [
  ...validateOrderId,
  body('status')
    .isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED'])
    .withMessage('Invalid order status')
];

export const validateAnalyticsQuery = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid ISO date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid ISO date')
];
