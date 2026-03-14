import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import * as analyticsController from '../controllers/analytics.controller.js';
import * as analyticsValidator from '../validators/analytics.validator.js';

const router = express.Router();

router.get(
  '/seller/dashboard',
  protect,
  restrictTo('SELLER', 'ADMIN'),
  analyticsValidator.validateDateRangeQuery,
  analyticsValidator.validate,
  analyticsController.getSellerDashboard
);

router.get(
  '/seller/stats/daily',
  protect,
  restrictTo('SELLER', 'ADMIN'),
  analyticsValidator.validateStatsHistoryQuery,
  analyticsValidator.validate,
  analyticsController.getSellerStatsHistory
);

router.get(
  '/platform/overview',
  protect,
  restrictTo('ADMIN'),
  analyticsValidator.validateDateRangeQuery,
  analyticsValidator.validate,
  analyticsController.getPlatformOverview
);

router.post(
  '/seller-stats/aggregate',
  protect,
  restrictTo('ADMIN'),
  analyticsValidator.validateAggregateDailyPayload,
  analyticsValidator.validate,
  analyticsController.aggregateSellerStatsDaily
);

export default router;