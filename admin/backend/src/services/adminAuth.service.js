import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/database.js";

/** Fields persisted on `admins` (platform admin table — not `users`). */
const ADMIN_DB_SELECT = {
    id: true,
    email: true,
    username: true,
    fullName: true,
    phone: true,
    department: true,
    jobTitle: true,
    permissions: true,
    isActive: true,
    createdAt: true,
    lastLogin: true,
};

/**
 * Shape expected by admin SPA ([AdminUser]).
 */
function toSpaUser(admin) {
    return {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        fullName: admin.fullName,
        role: "ADMIN",
        avatarUrl: null,
    };
}

class AdminAuthService {
    /**
     * Platform admin login (`admins` table). JWT signed with ADMIN_JWT_SECRET.
     */
    async login(email, password) {
        if (!email || !password) {
            throw Object.assign(new Error("Email and password required"), {
                statusCode: 400,
            });
        }

        const normalized = email.trim();
        const admin = await prisma.admin.findFirst({
            where: {
                OR: [
                    { email: normalized.toLowerCase() },
                    { username: normalized },
                ],
            },
            select: { ...ADMIN_DB_SELECT, passwordHash: true },
        });

        if (!admin?.passwordHash) {
            throw Object.assign(new Error("Invalid credentials"), {
                statusCode: 401,
            });
        }

        const ok = await bcrypt.compare(password, admin.passwordHash);
        if (!ok) {
            throw Object.assign(new Error("Invalid credentials"), {
                statusCode: 401,
            });
        }

        if (!admin.isActive) {
            throw Object.assign(new Error("Account is deactivated"), {
                statusCode: 403,
            });
        }

        await prisma.admin.update({
            where: { id: admin.id },
            data: { lastLogin: new Date() },
        });

        const { passwordHash: _p, ...safe } = admin;
        const user = toSpaUser(safe);

        const secret = process.env.ADMIN_JWT_SECRET;
        if (!secret) {
            throw Object.assign(
                new Error("Server misconfiguration: ADMIN_JWT_SECRET is not set"),
                { statusCode: 500 },
            );
        }

        const accessToken = jwt.sign(
            { id: admin.id, role: "ADMIN", principal: "admin" },
            secret,
            { expiresIn: process.env.ADMIN_JWT_EXPIRE || "7d" },
        );

        return { user, accessToken };
    }
}

export default new AdminAuthService();
