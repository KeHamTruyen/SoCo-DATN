import { Router } from "express";
import reportController from "../controllers/report.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);
router.use(restrictTo("ADMIN"));

router.get("/", (req, res, next) => reportController.getReports(req, res, next));
router.get("/:reportId", (req, res, next) =>
    reportController.getReportById(req, res, next),
);
router.patch("/:reportId/resolve", (req, res, next) =>
    reportController.resolveReport(req, res, next),
);

export default router;
