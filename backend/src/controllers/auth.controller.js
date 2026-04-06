import authService from "../services/auth.service.js";

class AuthController {
    // ─── UC1.1 – Register ───────────────────────────────────────

    async register(req, res, next) {
        try {
            const { email, username, password, fullName, phone, role } =
                req.body;
            const result = await authService.register({
                email,
                username,
                password,
                fullName,
                phone,
                role,
            });
            res.status(201).json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    // ─── UC1.1 – Verify email ──────────────────────────────────

    async verifyEmail(req, res, next) {
        try {
            const { tempToken, otpCode } = req.body;
            const result = await authService.verifyEmail(tempToken, otpCode);

            res.cookie("token", result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.json({
                success: true,
                message: "Email verified successfully",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    // ─── UC1.1 – Resend verification ───────────────────────────

    async resendVerification(req, res, next) {
        try {
            const { email } = req.body;
            const result = await authService.resendVerification(email);
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    // ─── UC1.2 – Login ─────────────────────────────────────────

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService.login({ email, password });

            if (result.requires2FA) {
                return res.json({ success: true, data: result });
            }

            res.cookie("token", result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.json({
                success: true,
                message: "Login successful",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    // ─── UC1.3 – Verify 2FA OTP ────────────────────────────────

    async verify2FA(req, res, next) {
        try {
            const { tempToken, otpCode } = req.body;
            const result = await authService.verify2FA(tempToken, otpCode);

            res.cookie("token", result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.json({
                success: true,
                message: "Login successful",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    // ─── UC1.3 – Enable 2FA ────────────────────────────────────

    async enable2FA(req, res, next) {
        try {
            const result = await authService.enable2FA(req.user.id);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async confirm2FAEnable(req, res, next) {
        try {
            const { otpCode } = req.body;
            const result = await authService.confirm2FAEnable(
                req.user.id,
                otpCode,
            );
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // ─── UC1.3 – Disable 2FA ───────────────────────────────────

    async disable2FA(req, res, next) {
        try {
            const { password } = req.body;
            const result = await authService.disable2FA(req.user.id, password);
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    // ─── UC1.3 – Get 2FA status ─────────────────────────────────

    async get2FAStatus(req, res, next) {
        try {
            const result = await authService.get2FAStatus(req.user.id);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    // ─── UC1.4 – Forgot password ───────────────────────────────

    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const result = await authService.forgotPassword(email);
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    // ─── UC1.4 – Reset password ────────────────────────────────

    async resetPassword(req, res, next) {
        try {
            const { token, newPassword } = req.body;
            const result = await authService.resetPassword(token, newPassword);
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    // ─── UC1.5 – Logout ────────────────────────────────────────

    async logout(req, res) {
        let token = null;
        if (req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies.token) {
            token = req.cookies.token;
        }

        authService.logout(token);
        res.clearCookie("token");
        res.json({ success: true, message: "Logout successful" });
    }

    // ─── UC1.6 – Profile ───────────────────────────────────────

    async getMe(req, res, next) {
        try {
            const user = await authService.getProfile(req.user.id);
            res.json({ success: true, data: { user } });
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req, res, next) {
        try {
            const user = await authService.updateProfile(req.user.id, req.body);
            res.json({
                success: true,
                message: "Profile updated successfully",
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    }

    // ─── UC1.6 – Change password ────────────────────────────────

    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;
            const result = await authService.changePassword(
                req.user.id,
                currentPassword,
                newPassword,
            );
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }

    // ─── UC1.7 – Privacy ───────────────────────────────────────

    async getPrivacy(req, res, next) {
        try {
            const settings = await authService.getPrivacySettings(req.user.id);
            res.json({ success: true, data: settings });
        } catch (error) {
            next(error);
        }
    }

    async updatePrivacy(req, res, next) {
        try {
            const settings = await authService.updatePrivacySettings(
                req.user.id,
                req.body,
            );
            res.json({
                success: true,
                message: "Privacy settings updated",
                data: settings,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();
