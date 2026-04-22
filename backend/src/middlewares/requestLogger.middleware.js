import { logInfo } from "../utils/logger.js";
import { getRequestMetrics } from "../observability/requestMetrics.js";

export const requestLogger = (req, res, next) => {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
        const elapsedNs = process.hrtime.bigint() - start;
        const durationMs = Number(elapsedNs) / 1_000_000;
        const metrics = getRequestMetrics();
        const contentLengthHeader = res.getHeader("content-length");
        const responseBytes =
            typeof contentLengthHeader === "string" ? Number(contentLengthHeader) : null;
        const perfLevel =
            durationMs >= 1000 ? "slow" : durationMs >= 300 ? "elevated" : "normal";

        logInfo("HTTP request completed", {
            requestId: req.requestId,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Math.round(durationMs * 100) / 100,
            ip: req.ip,
            responseBytes,
            perfLevel,
            prismaQueryCount: metrics?.queryCount ?? 0,
            prismaTotalQueryDurationMs: Math.round(
                (metrics?.totalQueryDurationMs ?? 0) * 100,
            ) / 100,
            prismaSlowQueryCount: metrics?.slowQueries.length ?? 0,
            prismaSlowQueries: metrics?.slowQueries.slice(0, 3) ?? [],
        });
    });

    next();
};
