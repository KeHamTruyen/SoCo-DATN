import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/database.js";

const ADMIN_SAFE_SELECT = {
    id: true,
    email: true,
    username: true,
    fullName: true,
    phone: true,
    avatarUrl: true,
    role: true,
    isVerified: true,
    isActive: true,
    createdAt: true,
};

class AdminAuthService {
    /**
     * Admin-only login. Issues JWT signed with ADMIN_JWT_SECRET.
     */
    async login(email, password) {
        if (!email || !password) {
            throw Object.assign(new Error("Email and password required"), {
                statusCode: 400,
            });
        }

        const user = await prisma.user.findFirst({
            where: { email: email.trim().toLowerCase() },
            select: { ...ADMIN_SAFE_SELECT, passwordHash: true },
        });

        if (!user?.passwordHash) {
            throw Object.assign(new Error("Invalid credentials"), {
                statusCode: 401,
            });
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            throw Object.assign(new Error("Invalid credentials"), {
                statusCode: 401,
            });
        }

        if (user.role !== "ADMIN") {
            throw Object.assign(
                new Error(
                    "This portal is for administrators only. Please sign in on the main application.",
                ),
                { statusCode: 403 },
            );
        }

        if (!user.isActive) {
            throw Object.assign(new Error("Account is deactivated"), {
                statusCode: 403,
            });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        const { passwordHash: _p, ...safeUser } = user;
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.ADMIN_JWT_SECRET,
            { expiresIn: process.env.ADMIN_JWT_EXPIRE || "7d" },
        );

        return { user: safeUser, accessToken: token };
    }
}

export default new AdminAuthService();
