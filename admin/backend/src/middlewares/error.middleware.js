export const errorHandler = (err, req, res, next) => {
    console.error("Admin API error:", err);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        message,
        ...(err.code && { code: err.code }),
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
