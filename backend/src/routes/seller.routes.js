import express from 'express';
import multer from 'multer';
import sellerController from '../controllers/seller.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

const sellerRegistrationUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|pjpeg|png|webp)$/i.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(Object.assign(new Error('Only JPEG, PNG, and WebP images are allowed'), { statusCode: 400 }));
    }
  },
});

router.use(protect);

router.get('/stats', restrictTo('SELLER', 'ADMIN'), sellerController.getDashboardStats);

// ─── Buyer: apply to become seller (UC1.8) ────────────────────
router.post('/apply', sellerController.startApplication);
router.post(
  '/register-with-uploads',
  (req, res, next) => {
    sellerRegistrationUpload.fields([
      { name: 'idFront', maxCount: 1 },
      { name: 'idBack', maxCount: 1 },
      { name: 'shopLogo', maxCount: 1 },
      { name: 'shopCover', maxCount: 1 },
    ])(req, res, (err) => {
      if (err) {
        const status = err.statusCode || (err.code === 'LIMIT_FILE_SIZE' ? 400 : 400);
        return res.status(status).json({
          success: false,
          message: err.message || 'File upload failed',
        });
      }
      next();
    });
  },
  sellerController.completeRegistrationWithUploads,
);
router.get('/status', sellerController.getStatus);
router.post('/application/withdraw', sellerController.withdrawReviewingApplication);
router.put('/step1', sellerController.submitStep1);
router.put('/step2', sellerController.submitStep2);
router.put('/step3', sellerController.submitStep3);

// ─── Seller: sensitive KYC / bank (after APPROVED) ──────────────
router.post('/sensitive/reauth', restrictTo('SELLER'), sellerController.verifySensitiveReauth);
router.post('/sensitive/masked-summary', restrictTo('SELLER'), sellerController.getMaskedSensitiveSummary);
router.post('/sensitive/change-request', restrictTo('SELLER'), sellerController.submitSensitiveChangeRequest);
router.get('/sensitive/change-request', restrictTo('SELLER'), sellerController.getMyPendingSensitiveChange);

// ─── Admin: manage seller applications ────────────────────────
router.get('/applications', restrictTo('ADMIN'), sellerController.listApplications);
router.post('/applications/:id/approve', restrictTo('ADMIN'), sellerController.approve);
router.post('/applications/:id/reject', restrictTo('ADMIN'), sellerController.reject);

router.get(
  '/admin/sensitive-change-requests',
  restrictTo('ADMIN'),
  sellerController.listSensitiveChangeRequestsAdmin,
);
router.post(
  '/admin/sensitive-change-requests/:id/approve',
  restrictTo('ADMIN'),
  sellerController.approveSensitiveChangeRequest,
);
router.post(
  '/admin/sensitive-change-requests/:id/reject',
  restrictTo('ADMIN'),
  sellerController.rejectSensitiveChangeRequest,
);

export default router;
