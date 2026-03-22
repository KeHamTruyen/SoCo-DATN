import authService from "../services/auth.service.js";

class AdminAuthController {
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService.adminLogin({ email, password });

            res.cookie("adminToken", result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.json({
                success: true,
                message: "Login successful",
                data: {
                    admin: result.admin,
                    accessToken: result.accessToken,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async me(req, res, next) {
        try {
            res.json({ success: true, data: { admin: req.admin } });
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            let token;
            if (req.headers.authorization?.startsWith("Bearer")) {
                token = req.headers.authorization.split(" ")[1];
            } else if (req.cookies.adminToken) {
                token = req.cookies.adminToken;
            }
            const result = authService.logout(token);
            res.clearCookie("adminToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }
}

export default new AdminAuthController();
