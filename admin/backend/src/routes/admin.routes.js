import express from "express";
import adminController from "../controllers/admin.controller.js";
import categoryController from "../controllers/category.controller.js";
import {
    protect,
    restrictTo,
    authorize,
} from "../middlewares/auth.middleware.js";
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

router.get(
    "/users",
    authorize("read", "User"),
    (req, res, next) => adminController.getUsers(req, res, next),
);
router.patch(
    "/users/:id/toggle-active",
    authorize("update", "User"),
    (req, res, next) => adminController.toggleUserActive(req, res, next),
);
router.patch(
    "/users/:id/role",
    authorize("update", "User"),
    (req, res, next) => adminController.changeUserRole(req, res, next),
);

router.get(
    "/posts",
    authorize("read", "Post"),
    (req, res, next) => adminController.getPosts(req, res, next),
);
router.delete(
    "/posts/:id",
    authorize("delete", "Post"),
    (req, res, next) => adminController.deletePost(req, res, next),
);
router.get(
    "/products",
    authorize("read", "Product"),
    (req, res, next) => adminController.getProducts(req, res, next),
);
router.delete(
    "/products/:id",
    authorize("delete", "Product"),
    (req, res, next) => adminController.deleteProduct(req, res, next),
);

router.get(
    "/dashboard",
    authorize("read", "Dashboard"),
    (req, res, next) => adminController.getDashboard(req, res, next),
);
router.get(
    "/dashboard/growth",
    authorize("read", "Dashboard"),
    (req, res, next) => adminController.getGrowthStats(req, res, next),
);

/** Super-only: upsert Try-demo guest + backfill legacy admin profiles. */
router.post(
    "/ensure-demo",
    authorize("manage", "all"),
    (req, res, next) => adminController.ensureDemoAdmin(req, res, next),
);

router.get(
    "/categories",
    authorize("read", "Category"),
    adminListCategoriesValidation,
    validateCategory,
    (req, res, next) => categoryController.adminListCategories(req, res, next),
);
router.get(
    "/categories/:id",
    authorize("read", "Category"),
    categoryIdParamValidation,
    validateCategory,
    (req, res, next) => categoryController.adminGetCategory(req, res, next),
);
router.post(
    "/categories",
    authorize("manage", "Category"),
    createCategoryValidation,
    validateCategory,
    (req, res, next) => categoryController.adminCreateCategory(req, res, next),
);
router.put(
    "/categories/:id",
    authorize("manage", "Category"),
    categoryIdParamValidation,
    updateCategoryValidation,
    validateCategory,
    (req, res, next) => categoryController.adminUpdateCategory(req, res, next),
);
router.delete(
    "/categories/:id",
    authorize("manage", "Category"),
    categoryIdParamValidation,
    validateCategory,
    (req, res, next) =>
        categoryController.adminDeactivateCategory(req, res, next),
);

export default router;
