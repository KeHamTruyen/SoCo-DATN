import express from 'express';
import groupController from '../controllers/group.controller.js';
import { protect, optionalAuth } from '../middlewares/auth.middleware.js';
import {
  listGroupsValidation,
  createGroupValidation,
  groupIdValidation,
  listMembersValidation,
  validate
} from '../validators/group.validator.js';

const router = express.Router();

/**
 * @swagger
 * /groups:
 *   get:
 *     summary: Lấy danh sách nhóm
 *     description: Trả về danh sách nhóm có phân trang, hỗ trợ lọc theo từ khóa và loại membership.
 *     tags: [Groups]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm theo tên / mô tả nhóm
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
 *         name: membership
 *         schema:
 *           type: string
 *           enum: [all, joined, discover]
 *           default: all
 *         description: Lọc theo trạng thái tham gia (chỉ có tác dụng khi đã đăng nhập)
 *     responses:
 *       200:
 *         description: Lấy danh sách nhóm thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupListResponse'
 *   post:
 *     summary: Tạo nhóm mới
 *     description: Tạo nhóm mới với người tạo tự động trở thành ADMIN của nhóm.
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 120
 *                 example: 'Hội Handmade Việt Nam'
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: 'Cộng đồng chia sẻ sản phẩm thủ công mỹ nghệ'
 *               privacy:
 *                 type: string
 *                 enum: [PUBLIC, PRIVATE, SECRET]
 *                 default: PUBLIC
 *               coverImageUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Tạo nhóm thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupDetailResponse'
 *       400:
 *         description: Dữ liệu không hợp lệ
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
router.get('/', optionalAuth, listGroupsValidation, validate, groupController.listGroups);
router.get('/my', protect, listGroupsValidation, validate, groupController.getMyGroups);
router.post('/', protect, createGroupValidation, validate, groupController.createGroup);

/**
 * @swagger
 * /groups/my:
 *   get:
 *     summary: Lấy danh sách nhóm tôi đã tham gia
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm trong các nhóm đã tham gia
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
 *         description: Lấy danh sách nhóm của tôi thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupListResponse'
 *       401:
 *         description: Chưa xác thực
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /groups/{id}:
 *   get:
 *     summary: Lấy chi tiết nhóm theo ID
 *     description: Trả về thông tin chi tiết nhóm, kèm 8 thành viên đầu tiên và trạng thái membership của người xem.
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID của nhóm
 *     responses:
 *       200:
 *         description: Lấy chi tiết nhóm thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupDetailResponse'
 *       404:
 *         description: Không tìm thấy nhóm
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', optionalAuth, groupIdValidation, validate, groupController.getGroupById);

/**
 * @swagger
 * /groups/{id}/members:
 *   get:
 *     summary: Lấy danh sách thành viên nhóm
 *     description: Trả về danh sách thành viên có phân trang, hỗ trợ tìm kiếm theo tên.
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID của nhóm
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên thành viên
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
 *         description: Lấy danh sách thành viên thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupMembersListResponse'
 *       404:
 *         description: Không tìm thấy nhóm
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id/members', optionalAuth, listMembersValidation, validate, groupController.getGroupMembers);

/**
 * @swagger
 * /groups/{id}/join:
 *   post:
 *     summary: Tham gia nhóm
 *     description: Người dùng tham gia nhóm PUBLIC. Nếu đã là thành viên sẽ trả về thông tin membership hiện tại.
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID của nhóm cần tham gia
 *     responses:
 *       200:
 *         description: Tham gia nhóm thành công (hoặc đã là thành viên)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupActionResponse'
 *       401:
 *         description: Chưa xác thực
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy nhóm
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Rời nhóm
 *     description: Người dùng rời khỏi nhóm. Admin của nhóm không thể tự rời nhóm nếu là thành viên duy nhất.
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID của nhóm cần rời
 *     responses:
 *       200:
 *         description: Rời nhóm thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupActionResponse'
 *       401:
 *         description: Chưa xác thực
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Không tìm thấy nhóm hoặc chưa là thành viên
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/join', protect, groupIdValidation, validate, groupController.joinGroup);
router.delete('/:id/join', protect, groupIdValidation, validate, groupController.leaveGroup);

export default router;
