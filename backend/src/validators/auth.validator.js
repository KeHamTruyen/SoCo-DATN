import { body, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({ field: err.path, message: err.msg })),
    });
  }
  next();
};

export const registerValidation = [
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and a number'),
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 100 }),
  body('phone').optional().trim().matches(/^[0-9]{10,15}$/).withMessage('Phone must be 10-15 digits'),
  body('role').optional().isIn(['BUYER', 'SELLER']).withMessage('Invalid role'),
];

export const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email or username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const verify2FAValidation = [
  body('tempToken').notEmpty().withMessage('Temporary token is required'),
  body('otpCode').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits').isNumeric(),
];

export const forgotPasswordValidation = [
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
];

export const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and a number'),
  body('confirmPassword').custom((val, { req }) => val === req.body.newPassword).withMessage('Passwords do not match'),
];

export const updateProfileValidation = [
  body('email').optional().trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('username').optional().trim().isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores'),
  body('fullName').optional().trim().isLength({ max: 100 }),
  body('phone').optional().trim().matches(/^[0-9]{10,15}$/),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('avatarUrl').optional().trim().isURL().withMessage('Avatar URL must be a valid URL'),
];

export const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Must contain uppercase, lowercase, and a number'),
  body('confirmPassword').custom((val, { req }) => val === req.body.newPassword).withMessage('Passwords do not match'),
];

export const privacyValidation = [
  body('profileVisibility').optional().isIn(['public', 'followers', 'private']),
  body('postVisibility').optional().isIn(['public', 'followers', 'private']),
  body('messagePermission').optional().isIn(['everyone', 'followers', 'nobody']),
];

export const enable2FAOtpValidation = [
  body('otpCode').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits').isNumeric(),
];

export const disable2FAValidation = [
  body('password').notEmpty().withMessage('Password is required to disable 2FA'),
];

export const verifyEmailValidation = [
  body('token').notEmpty().withMessage('Verification token is required'),
];

export const resendVerificationValidation = [
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
];
