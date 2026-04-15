import { logInfo } from "../utils/logger.js";

export const requestLogger = (req, res, next) => {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
        const elapsedNs = process.hrtime.bigint() - start;
        const durationMs = Number(elapsedNs) / 1_000_000;

        logInfo("HTTP request completed", {
            requestId: req.requestId,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Math.round(durationMs * 100) / 100,
            ip: req.ip,
        });
    });

    next();
};
