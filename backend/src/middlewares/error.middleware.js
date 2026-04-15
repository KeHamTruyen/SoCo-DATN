import { logError } from "../utils/logger.js";

function resolveStatusCode(err) {
    if (Number.isInteger(err.statusCode) && err.statusCode >= 400) {
        return err.statusCode;
    }

    if (err.name === "UnauthorizedError" || err.name === "JsonWebTokenError") {
        return 401;
    }

    if (err.name === "ForbiddenError") {
        return 403;
    }

    if (err.name === "ValidationError" || err.name === "ZodError") {
        return 400;
    }

    if (err.name === "PrismaClientValidationError") {
        return 400;
    }

    if (err.name === "PrismaClientKnownRequestError") {
        return 409;
    }

    return 500;
}

export const errorHandler = (err, req, res, next) => {
    const statusCode = resolveStatusCode(err);
    const message = err.message || "Internal Server Error";
    const requestId = req?.requestId;

    logError("Unhandled request error", {
        requestId,
        method: req?.method,
        path: req?.originalUrl,
        statusCode,
        errorName: err.name,
        message,
    });

    res.status(statusCode).json({
        success: false,
        message,
        code: err.code || (statusCode === 500 ? "INTERNAL_SERVER_ERROR" : null),
        requestId,
        ...(err.data && { data: err.data }),
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

export class ApiError extends Error {
    constructor(statusCode, message, code = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = "ApiError";
    }
}
