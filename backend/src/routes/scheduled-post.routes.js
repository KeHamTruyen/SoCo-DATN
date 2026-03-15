import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  createScheduledPost,
  deleteScheduledPost,
  getMyScheduledPosts,
  publishScheduledPostNow
} from '../controllers/scheduled-post.controller.js';
import {
  createScheduledPostValidation,
  listScheduledPostsValidation,
  scheduledPostIdValidation,
  validate
} from '../validators/scheduled-post.validator.js';

const router = Router();

router.use(protect);

/**
 * @swagger
 * /scheduled-posts/me:
 *   get:
 *     summary: Lấy danh sách scheduled posts của tôi
 *     description: Trả về danh sách bài viết đã lập lịch, tự động publish những bài quá hạn trước khi trả về.
 *     tags: [ScheduledPosts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, scheduled, published, failed]
 *           default: all
 *         description: Lọc theo trạng thái scheduled post
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sắp xếp theo scheduledTime
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm trong nội dung bài viết
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Lọc từ ngày (theo scheduledTime)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Lọc đến ngày (theo scheduledTime)
 *     responses:
 *       200:
 *         description: Lấy danh sách scheduled posts thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScheduledPostListResponse'
 *       401:
 *         description: Chưa xác thực
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/me', listScheduledPostsValidation, validate, getMyScheduledPosts);

/**
 * @swagger
 * /scheduled-posts:
 *   post:
 *     summary: Tạo scheduled post
 *     description: Lập lịch đăng bài viết tự động vào thời điểm xác định trong tương lai.
 *     tags: [ScheduledPosts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content, scheduledTime]
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 5000
 *                 example: 'Sắp ra mắt sản phẩm mới!'
 *               mediaUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *               mediaType:
 *                 type: string
 *                 enum: [IMAGE, VIDEO, NONE]
 *                 default: NONE
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: Gắn sản phẩm vào bài viết
 *               scheduledTime:
 *                 type: string
 *                 format: date-time
 *                 description: Thời điểm đăng bài (phải là tương lai)
 *                 example: '2026-04-01T08:00:00.000Z'
 *               timezone:
 *                 type: string
 *                 maxLength: 50
 *                 default: Asia/Ho_Chi_Minh
 *                 example: 'Asia/Ho_Chi_Minh'
 *           example:
 *             content: 'Sắp ra mắt sản phẩm mới! Đừng bỏ lỡ!'
 *             scheduledTime: '2026-04-01T08:00:00.000Z'
 *             timezone: 'Asia/Ho_Chi_Minh'
 *             mediaType: 'IMAGE'
 *             mediaUrls: ['https://res.cloudinary.com/example/image/upload/v1/product.jpg']
 *     responses:
 *       201:
 *         description: Tạo scheduled post thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScheduledPostSingleResponse'
 *       400:
 *         description: Dữ liệu không hợp lệ (thiếu content, scheduledTime không hợp lệ hoặc ở quá khứ)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Chưa xác thực
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', createScheduledPostValidation, validate, createScheduledPost);

/**
 * @swagger
 * /scheduled-posts/{id}/publish-now:
 *   post:
 *     summary: Publish ngay một scheduled post
 *     description: Publish bài viết ngay lập tức thay vì chờ đến scheduledTime. Nếu đã publish rồi sẽ trả về post hiện tại.
 *     tags: [ScheduledPosts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID của scheduled post
 *     responses:
 *       200:
 *         description: Publish thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScheduledPostSingleResponse'
 *       401:
 *         description: Chưa xác thực
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Scheduled post không tồn tại hoặc không thuộc quyền
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/publish-now', scheduledPostIdValidation, validate, publishScheduledPostNow);

/**
 * @swagger
 * /scheduled-posts/{id}:
 *   delete:
 *     summary: Xóa scheduled post
 *     description: Xóa bỗ bài viết đã lập lịch. Chỉ có thể xóa các bài ở trạng thái scheduled hoặc failed.
 *     tags: [ScheduledPosts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID của scheduled post cần xóa
 *     responses:
 *       200:
 *         description: Xóa scheduled post thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Scheduled post deleted'
 *       401:
 *         description: Chưa xác thực
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Scheduled post không tồn tại hoặc không thuộc quyền
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', scheduledPostIdValidation, validate, deleteScheduledPost);

export default router;
