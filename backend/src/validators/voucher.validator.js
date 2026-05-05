import { body, param, query, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

export const createVoucherValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Voucher code is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Code must be 3-50 characters')
    .toUpperCase(),

  body('type')
    .isIn(['FIXED_AMOUNT', 'PERCENTAGE', 'FREE_SHIPPING'])
    .withMessage('Invalid voucher type'),

  body('value')
    .isFloat({ min: 0 })
    .withMessage('Value must be a positive number'),

  body('minOrderAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order amount must be positive'),

  body('maxDiscount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max discount must be positive'),

  body('maxUses')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max uses must be at least 1'),

  body('maxUsesPerUser')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max uses per user must be at least 1')
    .toInt(),

  body('applicableCategories')
    .optional()
    .isArray()
    .withMessage('Applicable categories must be an array'),

  body('applicableProductIds')
    .optional()
    .isArray()
    .withMessage('Applicable products must be an array'),

  body('applicableSellers')
    .optional()
    .isArray()
    .withMessage('Applicable sellers must be an array'),

  body('excludedUserIds')
    .optional()
    .isArray()
    .withMessage('Excluded users must be an array'),

  body('startsAt')
    .isISO8601()
    .withMessage('Start date must be valid ISO8601 date'),

  body('expiresAt')
    .isISO8601()
    .withMessage('Expiry date must be valid ISO8601 date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startsAt)) {
        throw new Error('Expiry date must be after start date');
      }
      return true;
    }),
];

export const applyVoucherValidation = [
  body('voucherCode')
    .trim()
    .notEmpty()
    .withMessage('Voucher code is required')
    .isLength({ max: 50 })
    .withMessage('Invalid code length'),

  body('subtotal')
    .isFloat({ min: 0 })
    .withMessage('Subtotal must be a positive number'),

  body('categoryIds')
    .optional()
    .isArray()
    .withMessage('Category IDs must be an array'),

  body('productIds')
    .optional()
    .isArray()
    .withMessage('Product IDs must be an array'),

  body('sellerId')
    .optional()
    .isUUID()
    .withMessage('Seller ID must be valid UUID'),
];

export const listVouchersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be 1-100'),

  query('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'EXPIRED'])
    .withMessage('Invalid status'),

  query('type')
    .optional()
    .isIn(['FIXED_AMOUNT', 'PERCENTAGE', 'FREE_SHIPPING'])
    .withMessage('Invalid type'),
];

export const getVoucherByIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid voucher ID'),
];
