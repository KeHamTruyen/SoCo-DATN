import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import * as analyticsController from '../controllers/analytics.controller.js';
import * as analyticsValidator from '../validators/analytics.validator.js';

const router = express.Router();

/**
 * @swagger
 * /analytics/seller/dashboard:
 *   get:
 *     summary: Lấy dashboard analytics của seller
 *     description: Trả về tổng quan doanh số, lượt xem, sản phẩm, followers trong khoảng thời gian nhất định.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Ngày bắt đầu lọc (ISO 8601)
 *         example: '2026-01-01T00:00:00.000Z'
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Ngày kết thúc lọc (ISO 8601)
 *         example: '2026-03-31T23:59:59.999Z'
 *     responses:
 *       200:
 *         description: Lấy dashboard thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SellerDashboardResponse'
 *             example:
 *               success: true
 *               data:
 *                 period:
 *                   startDate: '2026-01-01T00:00:00.000Z'
 *                   endDate: '2026-03-31T23:59:59.999Z'
 *                 summary:
 *                   products: { total: 12, active: 10 }
 *                   audience: { totalFollowers: 340, newFollowers: 8 }
 *                   traffic: { totalViews: 1500 }
 *                   sales: { totalOrders: 25, totalItemsSold: 60, grossRevenue: 4500000 }
 *                 topProducts: []
 *       400:
 *         description: Tham số ngày không hợp lệ
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
 *         description: Không có quyền seller/admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/seller/dashboard',
  protect,
  restrictTo('SELLER', 'ADMIN'),
  analyticsValidator.validateDateRangeQuery,
  analyticsValidator.validate,
  analyticsController.getSellerDashboard
);

/**
 * @swagger
 * /analytics/seller/stats/daily:
 *   get:
 *     summary: Lấy lịch sử thống kê hằng ngày của seller
 *     description: Trả về mảng dữ liệu thống kê theo từng ngày trong N ngày gần nhất.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *         description: Số ngày gần nhất cần lấy (1–365, mặc định 30)
 *         example: 30
 *     responses:
 *       200:
 *         description: Lấy lịch sử thống kê thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SellerStatsHistoryResponse'
 *       401:
 *         description: Chưa xác thực
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Không có quyền seller/admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/seller/stats/daily',
  protect,
  restrictTo('SELLER', 'ADMIN'),
  analyticsValidator.validateStatsHistoryQuery,
  analyticsValidator.validate,
  analyticsController.getSellerStatsHistory
);

/**
 * @swagger
 * /analytics/platform/overview:
 *   get:
 *     summary: Lấy tổng quan analytics toàn nền tảng (admin)
 *     description: Trả về thống kê tổng hợp toàn nền tảng bao gồm users, đơn hàng, doanh thu và top sellers.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Ngày bắt đầu lọc (ISO 8601)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Ngày kết thúc lọc (ISO 8601)
 *     responses:
 *       200:
 *         description: Lấy overview thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlatformOverviewResponse'
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
  '/platform/overview',
  protect,
  restrictTo('ADMIN'),
  analyticsValidator.validateDateRangeQuery,
  analyticsValidator.validate,
  analyticsController.getPlatformOverview
);

/**
 * @swagger
 * /analytics/seller-stats/aggregate:
 *   post:
 *     summary: Chạy job tổng hợp seller stats theo ngày (admin)
 *     description: Tổng hợp dữ liệu doanh thu, đơn hàng, followers cho tất cả sellers trong một ngày cụ thể.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Nếu không truyền sẽ dùng ngày hiện tại
 *                 example: '2026-03-15T00:00:00.000Z'
 *     responses:
 *       200:
 *         description: Tổng hợp thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AggregateJobResponse'
 *       400:
 *         description: Date không hợp lệ
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
 */
router.post(
  '/seller-stats/aggregate',
  protect,
  restrictTo('ADMIN'),
  analyticsValidator.validateAggregateDailyPayload,
  analyticsValidator.validate,
  analyticsController.aggregateSellerStatsDaily
);

export default router;