import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import * as reportController from '../controllers/report.controller.js';
import * as reportValidator from '../validators/report.validator.js';

const router = express.Router();

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Tạo báo cáo vi phạm mới
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportCreateRequest'
 *           example:
 *             targetType: POST
 *             targetId: 8a1b6f9a-cd07-4f01-90d3-96a0f548f20a
 *             reason: SPAM
 *             description: This post repeatedly shares scam links.
 *     responses:
 *       201:
 *         description: Tạo báo cáo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportSingleResponse'
 *             example:
 *               success: true
 *               message: Report submitted successfully
 *               data:
 *                 id: 0f36903a-b60f-4af8-9ab5-a4b5dfd2dc99
 *                 reporterId: 3645b02f-95b8-4c3e-bbd4-1764d9d5fe96
 *                 targetType: POST
 *                 targetId: 8a1b6f9a-cd07-4f01-90d3-96a0f548f20a
 *                 reason: SPAM
 *                 description: This post repeatedly shares scam links.
 *                 status: PENDING
 *                 resolutionNote: null
 *                 resolvedBy: null
 *                 resolvedAt: null
 *                 createdAt: '2026-03-16T08:00:00.000Z'
 *                 updatedAt: '2026-03-16T08:00:00.000Z'
 *                 reporter:
 *                   id: 3645b02f-95b8-4c3e-bbd4-1764d9d5fe96
 *                   username: reporter123
 *                   fullName: Reporter User
 *                   avatarUrl: null
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc tự report chính mình
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
 *       404:
 *         description: Đối tượng bị báo cáo không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Đã có báo cáo active cho target này
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/',
  protect,
  reportValidator.validateCreateReport,
  reportValidator.validate,
  reportController.createReport
);

/**
 * @swagger
 * /reports/me:
 *   get:
 *     summary: Lấy danh sách report do tôi tạo
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: targetType
 *         schema:
 *           type: string
 *           enum: [POST, USER, PRODUCT, SHOP]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_REVIEW, RESOLVED, REJECTED]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Lấy danh sách report thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportListResponse'
 *       401:
 *         description: Chưa xác thực
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/me',
  protect,
  reportValidator.validateMyReportsQuery,
  reportValidator.validate,
  reportController.getMyReports
);

/**
 * @swagger
 * /reports/admin:
 *   get:
 *     summary: Admin lấy danh sách báo cáo vi phạm
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *           maxLength: 200
 *       - in: query
 *         name: targetType
 *         schema:
 *           type: string
 *           enum: [POST, USER, PRODUCT, SHOP]
 *       - in: query
 *         name: reason
 *         schema:
 *           type: string
 *           enum: [SPAM, FRAUD, FAKE_INFO, HARASSMENT, INAPPROPRIATE_CONTENT, COPYRIGHT, OTHER]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_REVIEW, RESOLVED, REJECTED]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Lấy danh sách report thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportListResponse'
 *       401:
 *         description: Chưa xác thực
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Không có quyền admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/admin',
  protect,
  restrictTo('ADMIN'),
  reportValidator.validateAdminReportsQuery,
  reportValidator.validate,
  reportController.getReportsForAdmin
);

/**
 * @swagger
 * /reports/{id}/status:
 *   patch:
 *     summary: Admin cập nhật trạng thái report
 *     tags: [Reports]
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
 *             $ref: '#/components/schemas/ReportStatusUpdateRequest'
 *           example:
 *             status: RESOLVED
 *             resolutionNote: Confirmed spam behavior and warning issued.
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportSingleResponse'
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
 *       403:
 *         description: Không có quyền admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Report không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  '/:id/status',
  protect,
  restrictTo('ADMIN'),
  reportValidator.validateUpdateReportStatus,
  reportValidator.validate,
  reportController.updateReportStatus
);

export default router;
