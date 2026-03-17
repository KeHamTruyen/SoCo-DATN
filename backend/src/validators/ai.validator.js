import { body, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array(),
    });
  }
  next();
};

export const generatePostTextValidation = [
  body('idea')
    .trim()
    .notEmpty()
    .withMessage('Idea is required')
    .isLength({ min: 5, max: 2000 })
    .withMessage('Idea must be between 5 and 2000 characters'),
  body('productDescription')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Product description too long'),
  body('productImageUrls')
    .optional()
    .isArray({ max: 5 })
    .withMessage('productImageUrls must be an array with up to 5 URLs'),
  body('productImageUrls.*')
    .optional()
    .isURL()
    .withMessage('Each image URL must be valid'),
  body('tone')
    .optional({ checkFalsy: true })
    .isIn(['professional', 'friendly', 'urgent', 'luxury', 'playful'])
    .withMessage('Invalid tone'),
  body('goal')
    .optional({ checkFalsy: true })
    .isLength({ max: 200 })
    .withMessage('Goal too long'),
  body('productId')
    .optional({ checkFalsy: true })
    .isUUID()
    .withMessage('productId must be a valid UUID'),
  validate,
];

export const buyerAssistantChatValidation = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('message is required')
    .isLength({ min: 2, max: 1000 })
    .withMessage('message must be between 2 and 1000 characters'),
  body('productId')
    .optional({ checkFalsy: true })
    .isUUID()
    .withMessage('productId must be a valid UUID'),
  validate,
];
