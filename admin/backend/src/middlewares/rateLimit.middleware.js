import rateLimit from "express-rate-limit";

/** Login attempts — shared by password + Try demo. */
export const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Try again in 15 minutes.",
    },
});

/** Mutating admin API calls (approve, delete, resolve, …). */
export const adminWriteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many admin actions. Try again in 15 minutes.",
    },
});
