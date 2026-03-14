import { body, param, query } from 'express-validator';

export const createConversationValidator = [
  body('recipientId')
    .notEmpty()
    .withMessage('Recipient ID is required')
    .isString()
    .withMessage('Recipient ID must be a string')
    .trim()
];

export const sendMessageValidator = [
  param('conversationId')
    .notEmpty()
    .withMessage('Conversation ID is required')
    .isString()
    .withMessage('Conversation ID must be a string'),
  body('content')
    .optional({ nullable: true })
    .isString()
    .withMessage('Message content must be a string')
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Message content must not exceed 5000 characters'),
  body('attachmentUrl')
    .optional()
    .isURL()
    .withMessage('Attachment URL must be a valid URL'),
  body('mediaUrl')
    .optional()
    .isURL()
    .withMessage('Media URL must be a valid URL'),
  body('messageType')
    .optional()
    .isIn(['TEXT', 'IMAGE', 'VIDEO', 'FILE', 'PRODUCT', 'ORDER'])
    .withMessage('Invalid message type'),
  body()
    .custom((payload) => {
      const rawContent = payload?.content;
      const content = typeof rawContent === 'string' ? rawContent.trim() : '';
      const hasMedia = Boolean(payload?.mediaUrl || payload?.attachmentUrl);

      if (!content && !hasMedia) {
        throw new Error('Message must include content or attachment');
      }

      return true;
    })
];

export const conversationIdValidator = [
  param('conversationId')
    .notEmpty()
    .withMessage('Conversation ID is required')
    .isString()
    .withMessage('Conversation ID must be a string')
];

export const messageIdValidator = [
  param('messageId')
    .notEmpty()
    .withMessage('Message ID is required')
    .isString()
    .withMessage('Message ID must be a string')
];

export const paginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

export const searchQueryValidator = [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isString()
    .withMessage('Search query must be a string')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
];
