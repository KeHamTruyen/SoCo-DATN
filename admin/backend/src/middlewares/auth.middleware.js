import jwt from "jsonwebtoken";
import prisma from "../config/database.js";

/**
 * Verify admin JWT (ADMIN_JWT_SECRET) and attach req.user for restrictTo("ADMIN").
 * Principal is `admins` table — same source as backend seed (prisma.admin).
 */
export const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies?.adminToken) {
            token = req.cookies.adminToken;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized to access this route",
            });
        }

        const secret = process.env.ADMIN_JWT_SECRET;
        if (!secret) {
            return res.status(500).json({
                success: false,
                message: "Server misconfiguration",
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, secret);
        } catch {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token",
            });
        }

        if (decoded.principal && decoded.principal !== "admin") {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token",
            });
        }

        const admin = await prisma.admin.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                username: true,
                fullName: true,
                phone: true,
                isActive: true,
            },
        });

        if (!admin || !admin.isActive) {
            return res.status(401).json({
                success: false,
                message: "Admin account no longer exists or is deactivated",
            });
        }

        req.user = {
            id: admin.id,
            email: admin.email,
            username: admin.username,
            fullName: admin.fullName,
            role: "ADMIN",
            avatarUrl: null,
        };

        next();
    } catch (error) {
        next(error);
    }
};

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to perform this action",
            });
        }
        next();
    };
};
