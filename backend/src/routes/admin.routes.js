import express from "express";
import adminAuthController from "../controllers/adminAuth.controller.js";
import sellerController from "../controllers/seller.controller.js";
import categoryController from "../controllers/category.controller.js";
import * as postController from "../controllers/post.controller.js";
import { protectAdmin } from "../middlewares/auth.middleware.js";
import { loginValidation, validate } from "../validators/auth.validator.js";
import {
    adminListCategoriesValidation,
    categoryIdParamValidation,
    createCategoryValidation,
    updateCategoryValidation,
    validate as validateCategory,
} from "../validators/category.validator.js";

const router = express.Router();

router.post("/auth/login", loginValidation, validate, adminAuthController.login);
router.post("/auth/logout", adminAuthController.logout);
router.get("/auth/me", protectAdmin, adminAuthController.me);

// ─── Seller verification & sensitive change (platform admin) ───
router.get("/seller/applications", protectAdmin, sellerController.listApplications);
router.patch("/seller/applications/:id/approve", protectAdmin, sellerController.approve);
router.patch("/seller/applications/:id/reject", protectAdmin, sellerController.reject);

router.get(
    "/seller/sensitive-change-requests",
    protectAdmin,
    sellerController.listSensitiveChangeRequestsAdmin,
);
router.patch(
    "/seller/sensitive-change-requests/:id/approve",
    protectAdmin,
    sellerController.approveSensitiveChangeRequest,
);
router.patch(
    "/seller/sensitive-change-requests/:id/reject",
    protectAdmin,
    sellerController.rejectSensitiveChangeRequest,
);

router.delete("/posts/:id", protectAdmin, postController.adminDeletePost);
router.delete(
    "/posts/:postId/comments/:commentId",
    protectAdmin,
    postController.adminDeleteComment,
);

// ─── Categories (platform catalog) ───
router.get(
    "/categories",
    protectAdmin,
    adminListCategoriesValidation,
    validateCategory,
    categoryController.adminListCategories,
);
router.get(
    "/categories/:id",
    protectAdmin,
    categoryIdParamValidation,
    validateCategory,
    categoryController.adminGetCategory,
);
router.post(
    "/categories",
    protectAdmin,
    createCategoryValidation,
    validateCategory,
    categoryController.adminCreateCategory,
);
router.put(
    "/categories/:id",
    protectAdmin,
    categoryIdParamValidation,
    updateCategoryValidation,
    validateCategory,
    categoryController.adminUpdateCategory,
);
router.delete(
    "/categories/:id",
    protectAdmin,
    categoryIdParamValidation,
    validateCategory,
    categoryController.adminDeactivateCategory,
);

export default router;
