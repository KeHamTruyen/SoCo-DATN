const LOG_LEVELS = {
    error: "ERROR",
    info: "INFO",
    warn: "WARN",
};

function stringifyLog(payload) {
    try {
        return JSON.stringify(payload);
    } catch {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            level: LOG_LEVELS.warn,
            message: "Failed to serialize log payload",
        });
    }
}

export function logInfo(message, metadata = {}) {
    console.log(
        stringifyLog({
            timestamp: new Date().toISOString(),
            level: LOG_LEVELS.info,
            message,
            ...metadata,
        }),
    );
}

export function logError(message, metadata = {}) {
    console.error(
        stringifyLog({
            timestamp: new Date().toISOString(),
            level: LOG_LEVELS.error,
            message,
            ...metadata,
        }),
    );
}
