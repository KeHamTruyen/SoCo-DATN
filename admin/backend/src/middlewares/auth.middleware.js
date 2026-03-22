import jwt from "jsonwebtoken";
import prisma from "../config/database.js";

/**
 * Verify admin JWT (ADMIN_JWT_SECRET) and attach req.user (Prisma User subset).
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

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
        } catch {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token",
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                username: true,
                fullName: true,
                role: true,
                isActive: true,
                avatarUrl: true,
            },
        });

        if (!user || !user.isActive || user.role !== "ADMIN") {
            return res.status(401).json({
                success: false,
                message: "User no longer exists or is not an admin",
            });
        }

        req.user = user;
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
