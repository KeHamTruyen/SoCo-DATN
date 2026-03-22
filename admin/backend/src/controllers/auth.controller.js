import adminAuthService from "../services/adminAuth.service.js";

class AuthController {
    async adminLogin(req, res, next) {
        try {
            const { email, password } = req.body;
            const { user, accessToken } = await adminAuthService.login(
                email,
                password,
            );
            res.json({
                success: true,
                message: "Admin login successful",
                data: { user, accessToken },
            });
        } catch (error) {
            const status = error.statusCode || 500;
            if (status >= 400 && status < 500) {
                return res.status(status).json({
                    success: false,
                    message: error.message,
                });
            }
            next(error);
        }
    }
}

export default new AuthController();
