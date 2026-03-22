import express from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import * as reviewController from "../controllers/review.controller.js";
import * as reviewValidator from "../validators/review.validator.js";

const router = express.Router();

router.get(
    "/product/:productId",
    reviewValidator.validateGetProductReviews,
    reviewController.getProductReviews,
);

router.post(
    "/",
    protect,
    reviewValidator.validateCreateReview,
    reviewController.createReview,
);

router.post(
    "/:reviewId/reply",
    protect,
    restrictTo("SELLER"),
    reviewValidator.validateReplyReview,
    reviewController.replyReview,
);

export default router;
