import express from "express";
import authController from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", (req, res, next) => authController.adminLogin(req, res, next));

export default router;
