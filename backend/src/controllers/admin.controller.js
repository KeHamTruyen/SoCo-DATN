import adminService from "../services/admin.service.js";

class AdminController {
    // ─── UC4.1: Account Management ──────────────────────────────

    /**
     * GET /api/admin/users
     */
    async getUsers(req, res, next) {
        try {
            const { page, limit, search, role, isActive } = req.query;
            const data = await adminService.getUsers({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                search,
                role,
                isActive,
            });
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/admin/users/:id/toggle-active
     */
    async toggleUserActive(req, res, next) {
        try {
            const user = await adminService.toggleUserActive(req.params.id);
            res.json({
                success: true,
                message: `User ${user.isActive ? "activated" : "deactivated"}`,
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/admin/users/:id/role
     */
    async changeUserRole(req, res, next) {
        try {
            const { role } = req.body;
            const user = await adminService.changeUserRole(req.params.id, role);
            res.json({
                success: true,
                message: "User role updated",
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    }

    // ─── UC4.2: Content Management ─────────────────────────────

    /**
     * GET /api/admin/posts
     */
    async getPosts(req, res, next) {
        try {
            const { page, limit, status, authorId } = req.query;
            const data = await adminService.getPosts({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                status,
                authorId,
            });
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/admin/posts/:id
     */
    async deletePost(req, res, next) {
        try {
            await adminService.deletePost(req.params.id);
            res.json({ success: true, message: "Post deleted" });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/admin/products
     */
    async getProducts(req, res, next) {
        try {
            const { page, limit, status, sellerId } = req.query;
            const data = await adminService.getProducts({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                status,
                sellerId,
            });
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/admin/products/:id
     */
    async deleteProduct(req, res, next) {
        try {
            await adminService.deleteProduct(req.params.id);
            res.json({ success: true, message: "Product deleted" });
        } catch (error) {
            next(error);
        }
    }

    // ─── UC4.4: Analytics ──────────────────────────────────────

    /**
     * GET /api/admin/dashboard
     */
    async getDashboard(req, res, next) {
        try {
            const stats = await adminService.getDashboardStats();
            res.json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/admin/dashboard/growth?days=30
     */
    async getGrowthStats(req, res, next) {
        try {
            const days = parseInt(req.query.days) || 30;
            const data = await adminService.getGrowthStats(days);
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }
}

export default new AdminController();
