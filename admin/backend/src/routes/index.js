import express from "express";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import reportRoutes from "./report.routes.js";
import sellerAdminRoutes from "./sellerAdmin.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/reports", reportRoutes);
router.use("/seller", sellerAdminRoutes);

router.get("/", (req, res) => {
    res.json({
        success: true,
        service: "soco-admin-api",
        endpoints: {
            auth: "/api/auth/login",
            admin: "/api/admin",
            categories: "/api/admin/categories",
            reports: "/api/reports",
            sellerAdmin: "/api/seller",
        },
    });
});

export default router;
