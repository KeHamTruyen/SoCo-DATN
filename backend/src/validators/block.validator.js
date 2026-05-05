import { body, param, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation error', errors: errors.array() });
  }
  next();
};

export const validateBlock = [
  body('targetUserId').notEmpty().withMessage('targetUserId is required').isUUID().withMessage('Invalid user id'),
  validate,
];

export const validateUnblock = [
  param('targetUserId').notEmpty().withMessage('targetUserId is required').isUUID().withMessage('Invalid user id'),
  validate,
];
