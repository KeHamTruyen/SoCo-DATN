// Must be first: loads `.env` from cwd before any module reads process.env (e.g. email.js via routes).
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

const adminOrigin = process.env.ADMIN_CORS_ORIGIN || "http://localhost:5174";

app.use(
    cors({
        origin: [adminOrigin, process.env.ADMIN_CORS_ORIGIN_EXTRA].filter(
            Boolean,
        ),
        credentials: true,
    }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", routes);

app.get("/health", (req, res) => {
    res.json({ status: "OK", service: "admin-api" });
});

app.use(errorHandler);

export default app;
