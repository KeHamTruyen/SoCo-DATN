import { AsyncLocalStorage } from "async_hooks";

const requestMetricsStorage = new AsyncLocalStorage();

function createDefaultMetrics(requestId) {
    return {
        requestId,
        queryCount: 0,
        totalQueryDurationMs: 0,
        slowQueries: [],
    };
}

export function runWithRequestMetrics(requestId, callback) {
    requestMetricsStorage.run(createDefaultMetrics(requestId), callback);
}

export function getRequestMetrics() {
    return requestMetricsStorage.getStore() ?? null;
}

export function addQueryMetrics({ model, action, durationMs }) {
    const metrics = getRequestMetrics();
    if (!metrics) {
        return;
    }

    metrics.queryCount += 1;
    metrics.totalQueryDurationMs += durationMs;

    const slowQueryThresholdMs = Number(process.env.SLOW_QUERY_THRESHOLD_MS ?? 200);
    if (durationMs >= slowQueryThresholdMs) {
        metrics.slowQueries.push({ model, action, durationMs });
    }
}
