function missingVariables(keys) {
    return keys.filter((key) => !process.env[key] || !process.env[key].trim());
}

export function validateEnv() {
    if ((process.env.NODE_ENV || "development") !== "production") {
        return;
    }

    const requiredVariables = [
        "DATABASE_URL",
        "JWT_SECRET",
        "FRONTEND_URL",
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
        "SENSITIVE_DATA_KEY",
    ];

    const missing = missingVariables(requiredVariables);
    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(", ")}`,
        );
    }
}
