import express from "express";
import authController from "../controllers/auth.controller.js";
import { adminLoginLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

router.post("/login", adminLoginLimiter, (req, res, next) =>
    authController.adminLogin(req, res, next),
);

export default router;
