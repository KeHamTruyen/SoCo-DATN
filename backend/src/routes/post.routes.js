import { Router } from 'express';
import * as postController from '../controllers/post.controller.js';
import { protect, optionalAuth } from '../middlewares/auth.middleware.js';
import { ensureNotBlocked } from '../middlewares/block.middleware.js';
import * as postValidator from '../validators/post.validator.js';
import { validate } from '../validators/post.validator.js';

const router = Router();

// Create post
router.post('/', protect, postValidator.createPostValidation, validate, postController.createPost);

// Personalized feed (UC2.1) - authenticated users
router.get('/feed', protect, postController.getPersonalizedFeed);

// Public feed
router.get('/', optionalAuth, postValidator.getPostsValidation, validate, postController.getPosts);

// My posts
router.get('/me', protect, postValidator.getMyPostsValidation, validate, postController.getMyPosts);

// User posts
router.get('/user/:userId', optionalAuth, postValidator.getUserPostsValidation, validate, postController.getUserPosts);

// Single post
router.get('/:id', optionalAuth, postValidator.getPostByIdValidation, validate, postController.getPostById);

// Update / Delete post
router.put('/:id', protect, postValidator.updatePostValidation, validate, postController.updatePost);
router.delete('/:id', protect, postValidator.deletePostValidation, validate, postController.deletePost);

// Like / Share
router.post('/:id/like', protect, ensureNotBlocked, postValidator.likePostValidation, validate, postController.toggleLike);
router.post('/:id/share', protect, ensureNotBlocked, postValidator.likePostValidation, validate, postController.sharePost);

// Comments
router.post('/:id/comments', protect, ensureNotBlocked, postValidator.addCommentValidation, validate, postController.addComment);
router.get('/:id/comments', postValidator.getCommentsValidation, validate, postController.getComments);

// Comment CRUD
router.put('/comments/:commentId', protect, postController.updateComment);
router.delete('/comments/:commentId', protect, postController.deleteComment);
router.get('/comments/:commentId/replies', postController.getReplies);

export default router;
