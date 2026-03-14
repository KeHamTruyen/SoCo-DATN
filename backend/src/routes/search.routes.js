import express from 'express';
import { optionalAuth } from '../middlewares/auth.middleware.js';
import * as searchController from '../controllers/search.controller.js';
import * as searchValidator from '../validators/search.validator.js';

const router = express.Router();

router.get(
  '/',
  optionalAuth,
  searchValidator.validateSearchAll,
  searchValidator.validate,
  searchController.searchAll
);

router.get(
  '/products',
  searchValidator.validateProductSearch,
  searchValidator.validate,
  searchController.searchProducts
);

router.get(
  '/users',
  searchValidator.validateUserSearch,
  searchValidator.validate,
  searchController.searchUsers
);

router.get(
  '/posts',
  optionalAuth,
  searchValidator.validatePostSearch,
  searchValidator.validate,
  searchController.searchPosts
);

export default router;