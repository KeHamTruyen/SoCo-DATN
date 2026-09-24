import express from "express";
import sellerController from "../../../../backend/src/controllers/seller.controller.js";
import {
    protect,
    restrictTo,
    authorize,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.use(restrictTo("ADMIN"));

router.get(
    "/applications",
    authorize("read", "SellerApplication"),
    (req, res, next) => sellerController.listApplications(req, res, next),
);
router.post(
    "/applications/:id/approve",
    authorize("review", "SellerApplication"),
    (req, res, next) => sellerController.approve(req, res, next),
);
router.post(
    "/applications/:id/reject",
    authorize("review", "SellerApplication"),
    (req, res, next) => sellerController.reject(req, res, next),
);

router.get(
    "/admin/sensitive-change-requests",
    authorize("read", "SensitiveChange"),
    (req, res, next) =>
        sellerController.listSensitiveChangeRequestsAdmin(req, res, next),
);
router.post(
    "/admin/sensitive-change-requests/:id/approve",
    authorize("review", "SensitiveChange"),
    (req, res, next) =>
        sellerController.approveSensitiveChangeRequest(req, res, next),
);
router.post(
    "/admin/sensitive-change-requests/:id/reject",
    authorize("review", "SensitiveChange"),
    (req, res, next) =>
        sellerController.rejectSensitiveChangeRequest(req, res, next),
);

export default router;
