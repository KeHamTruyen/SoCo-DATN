import rateLimit from "express-rate-limit";

function toInt(value, fallback) {
    const parsed = Number.parseInt(value ?? "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function createRateLimitHandler(message) {
    return (req, res) => {
        res.status(429).json({
            success: false,
            message,
            code: "RATE_LIMIT_EXCEEDED",
            requestId: req.requestId,
        });
    };
}

const standardRateLimitConfig = {
    standardHeaders: true,
    legacyHeaders: false,
};

export const apiRateLimiter = rateLimit({
    ...standardRateLimitConfig,
    windowMs: toInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toInt(process.env.RATE_LIMIT_MAX, 300),
    handler: createRateLimitHandler("Too many requests. Please try again later."),
});

export const authRateLimiter = rateLimit({
    ...standardRateLimitConfig,
    windowMs: toInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 10 * 60 * 1000),
    max: toInt(process.env.AUTH_RATE_LIMIT_MAX, 25),
    handler: createRateLimitHandler(
        "Too many authentication attempts. Please try again later.",
    ),
});

export const authSensitiveRateLimiter = rateLimit({
    ...standardRateLimitConfig,
    windowMs: toInt(
        process.env.AUTH_SENSITIVE_RATE_LIMIT_WINDOW_MS,
        10 * 60 * 1000,
    ),
    max: toInt(process.env.AUTH_SENSITIVE_RATE_LIMIT_MAX, 10),
    handler: createRateLimitHandler(
        "Too many sensitive authentication requests. Please try again later.",
    ),
});
