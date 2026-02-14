import { Router } from 'express';
import * as postController from '../controllers/post.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import * as postValidator from '../validators/post.validator.js';
import { validate } from '../validators/post.validator.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Social media posts management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         content:
 *           type: string
 *         mediaUrls:
 *           type: array
 *           items:
 *             type: string
 *         mediaType:
 *           type: string
 *           enum: [IMAGE, VIDEO, NONE]
 *         status:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *         visibility:
 *           type: string
 *           enum: [PUBLIC, FOLLOWERS, PRIVATE]
 *         likesCount:
 *           type: integer
 *         commentsCount:
 *           type: integer
 *         sharesCount:
 *           type: integer
 *         viewsCount:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         author:
 *           $ref: '#/components/schemas/UserBasic'
 *         product:
 *           $ref: '#/components/schemas/ProductBasic'
 *     
 *     PostComment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         content:
 *           type: string
 *         likesCount:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         user:
 *           $ref: '#/components/schemas/UserBasic'
 *         replies:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PostComment'
 *     
 *     CreatePostInput:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           minLength: 1
 *         mediaUrls:
 *           type: array
 *           items:
 *             type: string
 *           maxItems: 10
 *         mediaType:
 *           type: string
 *           enum: [IMAGE, VIDEO, NONE]
 *           default: NONE
 *         productId:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [DRAFT, PUBLISHED]
 *           default: PUBLISHED
 *         visibility:
 *           type: string
 *           enum: [PUBLIC, FOLLOWERS, PRIVATE]
 *           default: PUBLIC
 *     
 *     UpdatePostInput:
 *       type: object
 *       properties:
 *         content:
 *           type: string
 *         mediaUrls:
 *           type: array
 *           items:
 *             type: string
 *         mediaType:
 *           type: string
 *           enum: [IMAGE, VIDEO, NONE]
 *         productId:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *         visibility:
 *           type: string
 *           enum: [PUBLIC, FOLLOWERS, PRIVATE]
 *     
 *     CommentInput:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           minLength: 1
 *         parentId:
 *           type: string
 *           format: uuid
 *           description: ID of parent comment for replies
 */

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostInput'
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     post:
 *                       $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized
 */
router.post('/', protect, postValidator.createPostValidation, validate, postController.createPost);

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts (Feed)
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: authorId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: [PUBLIC, FOLLOWERS, PRIVATE]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *           default: PUBLISHED
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 */
router.get('/', postValidator.getPostsValidation, validate, postController.getPosts);

/**
 * @swagger
 * /api/posts/me:
 *   get:
 *     summary: Get my posts (logged in user)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *     responses:
 *       200:
 *         description: My posts retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', protect, postValidator.getMyPostsValidation, validate, postController.getMyPosts);

/**
 * @swagger
 * /api/posts/user/{userId}:
 *   get:
 *     summary: Get posts by specific user
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PUBLISHED]
 *           default: PUBLISHED
 *     responses:
 *       200:
 *         description: User posts retrieved successfully
 */
router.get('/user/:userId', postValidator.getUserPostsValidation, validate, postController.getUserPosts);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get single post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     post:
 *                       $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 */
router.get('/:id', postValidator.getPostByIdValidation, validate, postController.getPostById);

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePostInput'
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not post author
 *       404:
 *         description: Post not found
 */
router.put('/:id', protect, postValidator.updatePostValidation, validate, postController.updatePost);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not post author
 *       404:
 *         description: Post not found
 */
router.delete('/:id', protect, postValidator.deletePostValidation, validate, postController.deletePost);

/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: Like or unlike a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Post liked/unliked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     liked:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/like', protect, postValidator.likePostValidation, validate, postController.toggleLike);

/**
 * @swagger
 * /api/posts/{id}/comments:
 *   post:
 *     summary: Add comment to post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentInput'
 *     responses:
 *       201:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     comment:
 *                       $ref: '#/components/schemas/PostComment'
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/comments', protect, postValidator.addCommentValidation, validate, postController.addComment);

/**
 * @swagger
 * /api/posts/{id}/comments:
 *   get:
 *     summary: Get comments for a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PostComment'
 *                 pagination:
 *                   type: object
 */
router.get('/:id/comments', postValidator.getCommentsValidation, validate, postController.getComments);

export default router;
