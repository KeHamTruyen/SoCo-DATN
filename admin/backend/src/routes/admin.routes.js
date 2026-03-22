import express from "express";
import adminController from "../controllers/admin.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

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

export default router;
