import express from 'express';
import * as orderController from '../controllers/order.controller.js';
import * as orderValidator from '../validators/order.validator.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create new order from cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingName
 *               - shippingPhone
 *               - shippingAddress
 *               - paymentMethod
 *             properties:
 *               shippingName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               shippingPhone:
 *                 type: string
 *                 pattern: '^[0-9]{10,11}$'
 *               shippingAddress:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *               shippingCity:
 *                 type: string
 *                 maxLength: 100
 *               shippingDistrict:
 *                 type: string
 *                 maxLength: 100
 *               shippingWard:
 *                 type: string
 *                 maxLength: 100
 *               shippingNote:
 *                 type: string
 *                 maxLength: 500
 *               paymentMethod:
 *                 type: string
 *                 enum: [COD, BANK_TRANSFER, MOMO, VNPAY, ZALOPAY]
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Bad request (cart empty, insufficient stock, etc.)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  protect,
  orderValidator.validateCreateOrder,
  orderController.createOrder
);

/**
 * @swagger
 * /api/orders/my/purchases:
 *   get:
 *     summary: Get user's orders (as buyer)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, PROCESSING, SHIPPING, DELIVERED, COMPLETED, CANCELLED, REFUNDED]
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
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  '/my/purchases',
  protect,
  orderValidator.validateGetOrders,
  orderController.getMyOrders
);

/**
 * @swagger
 * /api/orders/my/sales:
 *   get:
 *     summary: Get seller's orders (as seller)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, PROCESSING, SHIPPING, DELIVERED, COMPLETED, CANCELLED, REFUNDED]
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
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Sales retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  '/my/sales',
  protect,
  orderValidator.validateGetOrders,
  orderController.getMySales
);

router.get(
  '/my/refund-requests',
  protect,
  orderValidator.validateGetOrders,
  orderController.getMyRefundRequests
);

router.get(
  '/seller/refunds',
  protect,
  orderValidator.validateGetOrders,
  orderController.getSellerRefundRequests
);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not order owner or seller)
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:orderId',
  protect,
  orderValidator.validateOrderId,
  orderController.getOrder
);

/**
 * @swagger
 * /api/orders/{orderId}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, PROCESSING, SHIPPING, DELIVERED, COMPLETED, CANCELLED, REFUNDED]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Bad request (invalid status transition)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:orderId/status',
  protect,
  orderValidator.validateUpdateOrderStatus,
  orderController.updateOrderStatus
);

/**
 * @swagger
 * /api/orders/{orderId}/cancel:
 *   post:
 *     summary: Cancel order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Bad request (order cannot be cancelled)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not order owner)
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.post(
  '/:orderId/cancel',
  protect,
  orderValidator.validateCancelOrder,
  orderController.cancelOrder
);

/**
 * @swagger
 * /api/orders/{orderId}/payment/confirm:
 *   post:
 *     summary: Confirm payment (mock for development)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 *       400:
 *         description: Payment already confirmed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.post(
  '/:orderId/payment/confirm',
  protect,
  orderValidator.validateOrderId,
  orderController.confirmPayment
);

router.post(
  '/:orderId/refund-request',
  protect,
  orderValidator.validateRequestRefund,
  orderController.requestRefund
);

router.post(
  '/:orderId/refund',
  protect,
  orderValidator.validateProcessRefund,
  orderController.processRefund
);

export default router;
