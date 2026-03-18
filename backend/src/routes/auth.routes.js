import express from "express";
import authController from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import {
    validate,
    registerValidation,
    loginValidation,
    verify2FAValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    updateProfileValidation,
    changePasswordValidation,
    privacyValidation,
    enable2FAOtpValidation,
    disable2FAValidation,
    verifyEmailValidation,
    resendVerificationValidation,
} from "../validators/auth.validator.js";

const router = express.Router();

// ─── Public routes ────────────────────────────────────────────

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới (UC1.1)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, username, password, fullName]
 *             properties:
 *               email: { type: string, format: email }
 *               username: { type: string, minLength: 3 }
 *               password: { type: string, minLength: 8 }
 *               fullName: { type: string }
 *               phone: { type: string }
 *               role: { type: string, enum: [BUYER, SELLER], default: BUYER }
 *     responses:
 *       201: { description: Đăng ký thành công, cần xác thực email }
 *       409: { description: Email/username đã tồn tại }
 */
router.post("/register", registerValidation, validate, authController.register);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: Xác thực email sau đăng ký (UC1.1)
 *     tags: [Authentication]
 */
router.post(
    "/verify-email",
    verifyEmailValidation,
    validate,
    authController.verifyEmail,
);

/**
 * @swagger
 * /auth/resend-verification:
 *   post:
 *     summary: Gửi lại email xác thực (UC1.1)
 *     tags: [Authentication]
 */
router.post(
    "/resend-verification",
    resendVerificationValidation,
    validate,
    authController.resendVerification,
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Đăng nhập (UC1.2). Nếu 2FA bật, trả về tempToken thay vì JWT.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, description: Email hoặc username }
 *               password: { type: string }
 *     responses:
 *       200: { description: Đăng nhập thành công hoặc yêu cầu 2FA }
 *       401: { description: Sai thông tin }
 *       403: { description: Tài khoản chưa xác thực / bị khóa }
 */
router.post("/login", loginValidation, validate, authController.login);

/**
 * @swagger
 * /auth/verify-2fa:
 *   post:
 *     summary: Xác thực OTP 2FA (UC1.3)
 *     tags: [Authentication]
 */
router.post(
    "/verify-2fa",
    verify2FAValidation,
    validate,
    authController.verify2FA,
);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Gửi link đặt lại mật khẩu (UC1.4)
 *     tags: [Authentication]
 */
router.post(
    "/forgot-password",
    forgotPasswordValidation,
    validate,
    authController.forgotPassword,
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu bằng token (UC1.4)
 *     tags: [Authentication]
 */
router.post(
    "/reset-password",
    resetPasswordValidation,
    validate,
    authController.resetPassword,
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Đăng xuất, blacklist JWT (UC1.5)
 *     tags: [Authentication]
 */
router.post("/logout", authController.logout);

// ─── Protected routes ─────────────────────────────────────────

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại (UC1.6)
 *     tags: [Authentication]
 *     security: [{ bearerAuth: [] }]
 */
router.get("/me", protect, authController.getMe);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Cập nhật hồ sơ cá nhân (UC1.6)
 *     tags: [Authentication]
 *     security: [{ bearerAuth: [] }]
 */
router.put(
    "/profile",
    protect,
    updateProfileValidation,
    validate,
    authController.updateProfile,
);

/**
 * @swagger
 * /auth/password:
 *   put:
 *     summary: Đổi mật khẩu (UC1.6)
 *     tags: [Authentication]
 *     security: [{ bearerAuth: [] }]
 */
router.put(
    "/password",
    protect,
    changePasswordValidation,
    validate,
    authController.changePassword,
);

/**
 * @swagger
 * /auth/privacy:
 *   get:
 *     summary: Xem cài đặt quyền riêng tư (UC1.7)
 *     tags: [Authentication]
 *     security: [{ bearerAuth: [] }]
 *   put:
 *     summary: Cập nhật quyền riêng tư (UC1.7)
 *     tags: [Authentication]
 *     security: [{ bearerAuth: [] }]
 */
router.get("/privacy", protect, authController.getPrivacy);
router.put(
    "/privacy",
    protect,
    privacyValidation,
    validate,
    authController.updatePrivacy,
);

/**
 * @swagger
 * /auth/2fa/enable:
 *   post:
 *     summary: Bắt đầu bật 2FA – gửi OTP (UC1.3)
 *     tags: [Authentication]
 *     security: [{ bearerAuth: [] }]
 */
router.post("/2fa/enable", protect, authController.enable2FA);

/**
 * @swagger
 * /auth/2fa/confirm:
 *   post:
 *     summary: Xác nhận bật 2FA bằng OTP (UC1.3)
 *     tags: [Authentication]
 *     security: [{ bearerAuth: [] }]
 */
router.post(
    "/2fa/confirm",
    protect,
    enable2FAOtpValidation,
    validate,
    authController.confirm2FAEnable,
);

/**
 * @swagger
 * /auth/2fa/disable:
 *   post:
 *     summary: Tắt 2FA – yêu cầu mật khẩu (UC1.3)
 *     tags: [Authentication]
 *     security: [{ bearerAuth: [] }]
 */
router.post(
    "/2fa/disable",
    protect,
    disable2FAValidation,
    validate,
    authController.disable2FA,
);

export default router;
