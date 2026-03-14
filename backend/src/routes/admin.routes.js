import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import * as adminController from '../controllers/admin.controller.js';
import * as adminValidator from '../validators/admin.validator.js';

const router = express.Router();

router.use(protect, restrictTo('ADMIN'));

router.get('/dashboard', adminController.getDashboard);

router.get('/users', adminValidator.validateListQuery, adminValidator.validate, adminController.getUsers);
router.patch('/users/:userId/status', adminValidator.validateSetUserStatus, adminValidator.validate, adminController.setUserStatus);
router.patch('/users/:userId/verify-seller', adminValidator.validateVerifySeller, adminValidator.validate, adminController.verifySeller);

router.get('/products', adminValidator.validateListQuery, adminValidator.validate, adminController.getProducts);
router.patch('/products/:productId/status', adminValidator.validateProductStatusUpdate, adminValidator.validate, adminController.updateProductStatus);

router.get('/orders', adminValidator.validateListQuery, adminValidator.validate, adminController.getOrders);
router.patch('/orders/:orderId/status', adminValidator.validateOrderStatusUpdate, adminValidator.validate, adminController.updateOrderStatus);

router.get('/reports/summary', adminValidator.validateAnalyticsQuery, adminValidator.validate, adminController.getReportsSummary);

export default router;
