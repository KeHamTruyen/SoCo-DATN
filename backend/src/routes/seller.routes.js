import express from 'express';
import sellerController from '../controllers/seller.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

// ─── Buyer: apply to become seller (UC1.8) ────────────────────
router.post('/apply', sellerController.startApplication);
router.get('/status', sellerController.getStatus);
router.put('/step1', sellerController.submitStep1);
router.put('/step2', sellerController.submitStep2);
router.put('/step3', sellerController.submitStep3);

// ─── Admin: manage seller applications ────────────────────────
router.get('/applications', restrictTo('ADMIN'), sellerController.listApplications);
router.post('/applications/:id/approve', restrictTo('ADMIN'), sellerController.approve);
router.post('/applications/:id/reject', restrictTo('ADMIN'), sellerController.reject);

export default router;
