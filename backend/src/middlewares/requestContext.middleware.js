import crypto from "crypto";

export const attachRequestContext = (req, res, next) => {
    const incomingRequestId = req.headers["x-request-id"];
    const requestId =
        typeof incomingRequestId === "string" && incomingRequestId.trim()
            ? incomingRequestId.trim()
            : crypto.randomUUID();

    req.requestId = requestId;
    res.setHeader("x-request-id", requestId);

    next();
};
