import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import * as voucherController from '../controllers/voucher.controller.js';
import * as voucherValidator from '../validators/voucher.validator.js';

const router = express.Router();

// Create voucher (seller/admin only)
router.post(
  '/',
  protect,
  voucherValidator.createVoucherValidation,
  voucherValidator.validate,
  voucherController.createVoucher,
);

// Apply voucher to cart
router.post(
  '/apply',
  protect,
  voucherValidator.applyVoucherValidation,
  voucherValidator.validate,
  voucherController.applyVoucher,
);

// Get available vouchers for current user
router.get(
  '/me/available',
  protect,
  voucherController.getUserAvailableVouchers,
);

// List vouchers
router.get(
  '/',
  voucherValidator.listVouchersValidation,
  voucherValidator.validate,
  voucherController.listVouchers,
);

// Get voucher by code (public)
router.get(
  '/code/:code',
  voucherController.getVoucherByCode,
);

// Get voucher by ID
router.get(
  '/:id',
  voucherValidator.getVoucherByIdValidation,
  voucherValidator.validate,
  voucherController.getVoucherById,
);

// Update voucher
router.patch(
  '/:id',
  protect,
  voucherValidator.getVoucherByIdValidation,
  voucherValidator.validate,
  voucherController.updateVoucher,
);

// Deactivate voucher
router.delete(
  '/:id',
  protect,
  voucherValidator.getVoucherByIdValidation,
  voucherValidator.validate,
  voucherController.deactivateVoucher,
);

export default router;
