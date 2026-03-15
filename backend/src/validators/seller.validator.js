import { body, validationResult } from 'express-validator';

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

export const validateStep1 = [
  body('idCardNumber')
    .trim()
    .notEmpty()
    .withMessage('idCardNumber is required')
    .isLength({ max: 20 })
    .withMessage('idCardNumber must not exceed 20 characters'),
  body('idCardFrontUrl')
    .trim()
    .notEmpty()
    .withMessage('idCardFrontUrl is required')
    .isURL()
    .withMessage('idCardFrontUrl must be a valid URL'),
  body('idCardBackUrl')
    .trim()
    .notEmpty()
    .withMessage('idCardBackUrl is required')
    .isURL()
    .withMessage('idCardBackUrl must be a valid URL'),
  body('dateOfBirth')
    .notEmpty()
    .withMessage('dateOfBirth is required')
    .isISO8601()
    .withMessage('dateOfBirth must be a valid ISO date'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('address is required')
    .isLength({ max: 500 })
    .withMessage('address must not exceed 500 characters')
];

export const validateStep2 = [
  body('businessName')
    .trim()
    .notEmpty()
    .withMessage('businessName is required')
    .isLength({ max: 255 })
    .withMessage('businessName must not exceed 255 characters'),
  body('businessType')
    .trim()
    .notEmpty()
    .withMessage('businessType is required')
    .isLength({ max: 50 })
    .withMessage('businessType must not exceed 50 characters'),
  body('businessLicenseNumber')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('businessLicenseNumber must not exceed 50 characters'),
  body('businessLicenseUrl')
    .optional({ nullable: true })
    .trim()
    .isURL()
    .withMessage('businessLicenseUrl must be a valid URL'),
  body('taxCode')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('taxCode must not exceed 50 characters')
];

export const validateStep3 = [
  body('bankName')
    .trim()
    .notEmpty()
    .withMessage('bankName is required')
    .isLength({ max: 100 })
    .withMessage('bankName must not exceed 100 characters'),
  body('bankAccountNumber')
    .trim()
    .notEmpty()
    .withMessage('bankAccountNumber is required')
    .isLength({ max: 50 })
    .withMessage('bankAccountNumber must not exceed 50 characters'),
  body('bankAccountName')
    .trim()
    .notEmpty()
    .withMessage('bankAccountName is required')
    .isLength({ max: 255 })
    .withMessage('bankAccountName must not exceed 255 characters'),
  body('bankBranch')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage('bankBranch must not exceed 255 characters')
];

export const validateUploadDocument = [
  body('documentType')
    .trim()
    .isIn(['idCardFront', 'idCardBack', 'businessLicense'])
    .withMessage('documentType must be one of: idCardFront, idCardBack, businessLicense')
];
