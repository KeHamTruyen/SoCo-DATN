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

export const listGroupsValidation = [
  query('q').optional().trim().isLength({ max: 200 }).withMessage('Search query must not exceed 200 characters'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('membership')
    .optional()
    .isIn(['all', 'joined', 'discover'])
    .withMessage('Membership must be all, joined, or discover')
];

export const createGroupValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Group name is required')
    .isLength({ min: 3, max: 120 })
    .withMessage('Group name must be between 3 and 120 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('privacy')
    .optional()
    .isIn(['PUBLIC', 'PRIVATE', 'SECRET'])
    .withMessage('Privacy must be PUBLIC, PRIVATE, or SECRET'),
  body('coverImageUrl').optional().isURL().withMessage('Cover image URL must be valid'),
  body('avatarUrl').optional().isURL().withMessage('Avatar URL must be valid')
];

export const groupIdValidation = [
  param('id').isUUID().withMessage('Group ID must be a valid UUID')
];

export const listMembersValidation = [
  ...groupIdValidation,
  query('q').optional().trim().isLength({ max: 100 }).withMessage('Search query must not exceed 100 characters'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
];
