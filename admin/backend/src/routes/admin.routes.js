import express from "express";
import adminController from "../controllers/admin.controller.js";
import categoryController from "../controllers/category.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import {
    adminListCategoriesValidation,
    categoryIdParamValidation,
    createCategoryValidation,
    updateCategoryValidation,
    validate as validateCategory,
} from "../validators/category.validator.js";

const router = express.Router();

router.use(protect);
router.use(restrictTo("ADMIN"));

router.get("/users", (req, res, next) => adminController.getUsers(req, res, next));
router.patch("/users/:id/toggle-active", (req, res, next) =>
    adminController.toggleUserActive(req, res, next),
);
router.patch("/users/:id/role", (req, res, next) =>
    adminController.changeUserRole(req, res, next),
);

router.get("/posts", (req, res, next) => adminController.getPosts(req, res, next));
router.delete("/posts/:id", (req, res, next) => adminController.deletePost(req, res, next));
router.get("/products", (req, res, next) => adminController.getProducts(req, res, next));
router.delete("/products/:id", (req, res, next) =>
    adminController.deleteProduct(req, res, next),
);

router.get("/dashboard", (req, res, next) => adminController.getDashboard(req, res, next));
router.get("/dashboard/growth", (req, res, next) =>
    adminController.getGrowthStats(req, res, next),
);

router.get(
    "/categories",
    adminListCategoriesValidation,
    validateCategory,
    (req, res, next) => categoryController.adminListCategories(req, res, next),
);
router.get(
    "/categories/:id",
    categoryIdParamValidation,
    validateCategory,
    (req, res, next) => categoryController.adminGetCategory(req, res, next),
);
router.post(
    "/categories",
    createCategoryValidation,
    validateCategory,
    (req, res, next) => categoryController.adminCreateCategory(req, res, next),
);
router.put(
    "/categories/:id",
    categoryIdParamValidation,
    updateCategoryValidation,
    validateCategory,
    (req, res, next) => categoryController.adminUpdateCategory(req, res, next),
);
router.delete(
    "/categories/:id",
    categoryIdParamValidation,
    validateCategory,
    (req, res, next) => categoryController.adminDeactivateCategory(req, res, next),
);

export default router;
