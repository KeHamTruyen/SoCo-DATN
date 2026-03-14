import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import * as reportController from '../controllers/report.controller.js';
import * as reportValidator from '../validators/report.validator.js';

const router = express.Router();

router.post(
  '/',
  protect,
  reportValidator.validateCreateReport,
  reportValidator.validate,
  reportController.createReport
);

router.get(
  '/me',
  protect,
  reportValidator.validateMyReportsQuery,
  reportValidator.validate,
  reportController.getMyReports
);

router.get(
  '/admin',
  protect,
  restrictTo('ADMIN'),
  reportValidator.validateAdminReportsQuery,
  reportValidator.validate,
  reportController.getReportsForAdmin
);

router.patch(
  '/:id/status',
  protect,
  restrictTo('ADMIN'),
  reportValidator.validateUpdateReportStatus,
  reportValidator.validate,
  reportController.updateReportStatus
);

export default router;
