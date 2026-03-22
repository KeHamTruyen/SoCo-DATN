import express from "express";
import sellerController from "../../../../backend/src/controllers/seller.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.use(restrictTo("ADMIN"));

router.get("/applications", (req, res, next) =>
    sellerController.listApplications(req, res, next),
);
router.post("/applications/:id/approve", (req, res, next) =>
    sellerController.approve(req, res, next),
);
router.post("/applications/:id/reject", (req, res, next) =>
    sellerController.reject(req, res, next),
);

router.get("/admin/sensitive-change-requests", (req, res, next) =>
    sellerController.listSensitiveChangeRequestsAdmin(req, res, next),
);
router.post("/admin/sensitive-change-requests/:id/approve", (req, res, next) =>
    sellerController.approveSensitiveChangeRequest(req, res, next),
);
router.post("/admin/sensitive-change-requests/:id/reject", (req, res, next) =>
    sellerController.rejectSensitiveChangeRequest(req, res, next),
);

export default router;
