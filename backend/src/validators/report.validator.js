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

const REPORT_TARGET_TYPES = ['POST', 'USER', 'PRODUCT', 'SHOP'];
const REPORT_REASONS = [
  'SPAM',
  'FRAUD',
  'FAKE_INFO',
  'HARASSMENT',
  'INAPPROPRIATE_CONTENT',
  'COPYRIGHT',
  'OTHER'
];
const REPORT_STATUSES = ['PENDING', 'IN_REVIEW', 'RESOLVED', 'REJECTED'];

export const validateCreateReport = [
  body('targetType')
    .isIn(REPORT_TARGET_TYPES)
    .withMessage('targetType must be one of POST, USER, PRODUCT, SHOP'),

  body('targetId')
    .isUUID()
    .withMessage('targetId must be a valid UUID'),

  body('reason')
    .isIn(REPORT_REASONS)
    .withMessage('reason is invalid'),

  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('description must not exceed 2000 characters')
];

export const validateMyReportsQuery = [
  query('targetType')
    .optional()
    .isIn(REPORT_TARGET_TYPES)
    .withMessage('targetType is invalid'),

  query('status')
    .optional()
    .isIn(REPORT_STATUSES)
    .withMessage('status is invalid'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100')
];

export const validateAdminReportsQuery = [
  query('q')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('q must not exceed 200 characters'),

  query('targetType')
    .optional()
    .isIn(REPORT_TARGET_TYPES)
    .withMessage('targetType is invalid'),

  query('reason')
    .optional()
    .isIn(REPORT_REASONS)
    .withMessage('reason is invalid'),

  query('status')
    .optional()
    .isIn(REPORT_STATUSES)
    .withMessage('status is invalid'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100')
];

export const validateUpdateReportStatus = [
  param('id')
    .isUUID()
    .withMessage('report id must be a valid UUID'),

  body('status')
    .isIn(['IN_REVIEW', 'RESOLVED', 'REJECTED'])
    .withMessage('status must be IN_REVIEW, RESOLVED or REJECTED'),

  body('resolutionNote')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('resolutionNote must not exceed 2000 characters'),

  body()
    .custom((payload) => {
      if (payload.status === 'REJECTED' && !payload.resolutionNote) {
        throw new Error('resolutionNote is required when status is REJECTED');
      }

      return true;
    })
];
