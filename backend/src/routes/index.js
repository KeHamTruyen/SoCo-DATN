import express from "express";
import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import categoryRoutes from "./category.routes.js";
import uploadRoutes from "./upload.routes.js";
import postRoutes from "./post.routes.js";
import cartRoutes from "./cart.routes.js";
import orderRoutes from "./order.routes.js";
import userRoutes from "./user.routes.js";
import notificationRoutes from "./notification.routes.js";
import aiRoutes from "./ai.routes.js";
import scheduledPostRoutes from "./scheduledPost.routes.js";
import sellerRoutes from "./seller.routes.js";
import messageRoutes from "./message.routes.js";
import groupRoutes from "./group.routes.js";
import reportRoutes from "./report.routes.js";
import reviewRoutes from "./review.routes.js";
import savedItemRoutes from "./savedItem.routes.js";
import adminRoutes from "./admin.routes.js";

const router = express.Router();

// Core routes
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/upload", uploadRoutes);
router.use("/posts", postRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/reviews", reviewRoutes);
router.use("/saved-items", savedItemRoutes);

// Infrastructure routes
router.use("/notifications", notificationRoutes);
router.use("/ai", aiRoutes);
router.use("/scheduled-posts", scheduledPostRoutes);
router.use("/seller", sellerRoutes);

// Module 2 - Social & Content
router.use("/messages", messageRoutes);
router.use("/groups", groupRoutes);
router.use("/reports", reportRoutes);

router.get("/", (req, res) => {
    res.json({
        message: "Welcome to Social Commerce API",
        version: "1.0.0",
        endpoints: {
            auth: "/api/auth",
            users: "/api/users",
            products: "/api/products",
            orders: "/api/orders",
            reviews: "/api/reviews",
            cart: "/api/cart",
            posts: "/api/posts",
            notifications: "/api/notifications",
            ai: "/api/ai",
            scheduledPosts: "/api/scheduled-posts",
            seller: "/api/seller",
            messages: "/api/messages",
            groups: "/api/groups",
            reports: "/api/reports",
            savedItems: "/api/saved-items",
            admin: "/api/admin",
        },
    });
});

export default router;
