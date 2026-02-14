import { body, param, query, validationResult } from 'express-validator';

/**
 * Validation middleware - checks for validation errors
 */
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

/**
 * Validation for creating a new post
 */
export const createPostValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 5000 })
    .withMessage('Content must not exceed 5000 characters'),

  body('mediaUrls')
    .optional()
    .isArray()
    .withMessage('Media URLs must be an array')
    .custom((urls) => {
      if (urls.length > 10) {
        throw new Error('Maximum 10 media files allowed');
      }
      return true;
    }),

  body('mediaUrls.*')
    .optional()
    .isURL()
    .withMessage('Each media URL must be a valid URL'),

  body('mediaType')
    .optional()
    .isIn(['IMAGE', 'VIDEO', 'NONE'])
    .withMessage('Media type must be IMAGE, VIDEO, or NONE'),

  body('productId')
    .optional()
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),

  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED'])
    .withMessage('Status must be DRAFT or PUBLISHED'),

  body('visibility')
    .optional()
    .isIn(['PUBLIC', 'FOLLOWERS', 'PRIVATE'])
    .withMessage('Visibility must be PUBLIC, FOLLOWERS, or PRIVATE'),
];

/**
 * Validation for updating a post
 */
export const updatePostValidation = [
  param('id')
    .isUUID()
    .withMessage('Post ID must be a valid UUID'),

  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Content cannot be empty')
    .isLength({ max: 5000 })
    .withMessage('Content must not exceed 5000 characters'),

  body('mediaUrls')
    .optional()
    .isArray()
    .withMessage('Media URLs must be an array')
    .custom((urls) => {
      if (urls.length > 10) {
        throw new Error('Maximum 10 media files allowed');
      }
      return true;
    }),

  body('mediaUrls.*')
    .optional()
    .isURL()
    .withMessage('Each media URL must be a valid URL'),

  body('mediaType')
    .optional()
    .isIn(['IMAGE', 'VIDEO', 'NONE'])
    .withMessage('Media type must be IMAGE, VIDEO, or NONE'),

  body('productId')
    .optional()
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),

  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    .withMessage('Status must be DRAFT, PUBLISHED, or ARCHIVED'),

  body('visibility')
    .optional()
    .isIn(['PUBLIC', 'FOLLOWERS', 'PRIVATE'])
    .withMessage('Visibility must be PUBLIC, FOLLOWERS, or PRIVATE'),
];

/**
 * Validation for getting a post by ID
 */
export const getPostByIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Post ID must be a valid UUID'),
];

/**
 * Validation for deleting a post
 */
export const deletePostValidation = [
  param('id')
    .isUUID()
    .withMessage('Post ID must be a valid UUID'),
];

/**
 * Validation for liking a post
 */
export const likePostValidation = [
  param('id')
    .isUUID()
    .withMessage('Post ID must be a valid UUID'),
];

/**
 * Validation for adding a comment
 */
export const addCommentValidation = [
  param('id')
    .isUUID()
    .withMessage('Post ID must be a valid UUID'),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 1000 })
    .withMessage('Comment must not exceed 1000 characters'),

  body('parentId')
    .optional()
    .isUUID()
    .withMessage('Parent ID must be a valid UUID'),
];

/**
 * Validation for getting comments
 */
export const getCommentsValidation = [
  param('id')
    .isUUID()
    .withMessage('Post ID must be a valid UUID'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

/**
 * Validation for getting posts feed
 */
export const getPostsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('authorId')
    .optional()
    .isUUID()
    .withMessage('Author ID must be a valid UUID'),

  query('productId')
    .optional()
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),

  query('visibility')
    .optional()
    .isIn(['PUBLIC', 'FOLLOWERS', 'PRIVATE'])
    .withMessage('Visibility must be PUBLIC, FOLLOWERS, or PRIVATE'),

  query('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    .withMessage('Status must be DRAFT, PUBLISHED, or ARCHIVED'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Search query must not exceed 200 characters'),
];

/**
 * Validation for getting user posts
 */
export const getUserPostsValidation = [
  param('userId')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    .withMessage('Status must be DRAFT, PUBLISHED, or ARCHIVED'),
];

/**
 * Validation for getting my posts
 */
export const getMyPostsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    .withMessage('Status must be DRAFT, PUBLISHED, or ARCHIVED'),
];
