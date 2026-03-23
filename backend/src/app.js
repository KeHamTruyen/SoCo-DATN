// Must be first: loads `.env` from cwd before any module reads process.env (e.g. email.js via routes).
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import swaggerSpec from "./config/swagger.js";

const app = express();

// Middlewares
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
            "http://localhost:5174",
            process.env.FRONTEND_URL,
        ].filter(Boolean),
        credentials: true,
    }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use("/uploads", express.static("src/uploads"));

// API Documentation (Swagger)
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        customCss: ".swagger-ui .topbar { display: none }",
        customSiteTitle: "Social Commerce API Docs",
    }),
);

// Routes
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Server is running" });
});

// Error handler
app.use(errorHandler);

export default app;
