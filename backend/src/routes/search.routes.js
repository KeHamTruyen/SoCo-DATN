import express from 'express';
import { optionalAuth } from '../middlewares/auth.middleware.js';
import * as searchController from '../controllers/search.controller.js';
import * as searchValidator from '../validators/search.validator.js';

const router = express.Router();

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Tìm kiếm tổng hợp (products, users, posts)
 *     description: Trả về kết quả tìm kiếm nhanh từ 3 loại nội dung cùng lúc, mỗi loại giới hạn theo `limit`.
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           maxLength: 200
 *         description: Từ khóa tìm kiếm
 *         example: 'áo thún handmade'
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           default: 5
 *         description: Số kết quả mỗi loại (tối đa 10)
 *     responses:
 *       200:
 *         description: Tìm kiếm tổng hợp thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchAllResponse'
 *             example:
 *               success: true
 *               data:
 *                 products: []
 *                 users: []
 *                 posts: []
 */
router.get(
  '/',
  optionalAuth,
  searchValidator.validateSearchAll,
  searchValidator.validate,
  searchController.searchAll
);

/**
 * @swagger
 * /search/products:
 *   get:
 *     summary: Tìm kiếm sản phẩm
 *     description: Tìm kiếm sản phẩm có phân trang, hỗ trợ lọc theo category, seller, giá, trạng thái và sắp xếp.
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm trong tiêu đề / mô tả
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lọc theo UUID danh mục
 *       - in: query
 *         name: sellerId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lọc theo UUID seller
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, ACTIVE, OUT_OF_STOCK, ARCHIVED]
 *           default: ACTIVE
 *         description: Trạng thái sản phẩm (mặc định ACTIVE)
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Giá thấp nhất (VND)
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Giá cao nhất (VND)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, price, viewsCount, salesCount, title]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *     responses:
 *       200:
 *         description: Tìm kiếm sản phẩm thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchProductsResponse'
 */
router.get(
  '/products',
  searchValidator.validateProductSearch,
  searchValidator.validate,
  searchController.searchProducts
);

/**
 * @swagger
 * /search/users:
 *   get:
 *     summary: Tìm kiếm người dùng
 *     description: Tìm kiếm người dùng theo tên, role và trạng thái xác minh.
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Từ khóa tìm theo username / fullName / bio
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [BUYER, SELLER, ADMIN]
 *         description: Lọc theo role
 *       - in: query
 *         name: verified
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Lọc theo trạng thái xác minh seller
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *     responses:
 *       200:
 *         description: Tìm kiếm users thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchUsersResponse'
 */
router.get(
  '/users',
  searchValidator.validateUserSearch,
  searchValidator.validate,
  searchController.searchUsers
);

/**
 * @swagger
 * /search/posts:
 *   get:
 *     summary: Tìm kiếm bài viết
 *     description: Tìm kiếm bài viết PUBLIC đã đăng (PUBLISHED), hỗ trợ lọc theo tác giả và khỏung thời gian.
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm trong nội dung bài viết
 *       - in: query
 *         name: authorId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lọc bài viết của một user cụ thể
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Lọc bài viết từ ngày
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Lọc bài viết đến ngày
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *     responses:
 *       200:
 *         description: Tìm kiếm posts thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchPostsResponse'
 */
router.get(
  '/posts',
  optionalAuth,
  searchValidator.validatePostSearch,
  searchValidator.validate,
  searchController.searchPosts
);

export default router;