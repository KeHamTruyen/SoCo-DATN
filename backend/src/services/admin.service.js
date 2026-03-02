import prisma from "../config/database.js";

class AdminService {
    // ─── UC4.1: Account Management ──────────────────────────────

    async getUsers({ page = 1, limit = 20, search, role, isActive }) {
        const skip = (page - 1) * limit;
        const where = {};

        if (search) {
            where.OR = [
                { fullName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { username: { contains: search, mode: "insensitive" } },
            ];
        }
        if (role) where.role = role;
        if (isActive !== undefined) where.isActive = isActive === "true";

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    username: true,
                    fullName: true,
                    phone: true,
                    avatarUrl: true,
                    role: true,
                    isVerified: true,
                    isActive: true,
                    createdAt: true,
                    lastLogin: true,
                    _count: {
                        select: { products: true, posts: true, orders: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.user.count({ where }),
        ]);

        return { users, total, page, limit };
    }

    async toggleUserActive(userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");

        return prisma.user.update({
            where: { id: userId },
            data: { isActive: !user.isActive },
            select: {
                id: true,
                email: true,
                username: true,
                isActive: true,
                role: true,
            },
        });
    }

    async changeUserRole(userId, newRole) {
        const validRoles = ["BUYER", "SELLER", "ADMIN"];
        if (!validRoles.includes(newRole)) throw new Error("Invalid role");

        return prisma.user.update({
            where: { id: userId },
            data: { role: newRole },
            select: { id: true, email: true, username: true, role: true },
        });
    }

    // ─── UC4.2: Content Management ─────────────────────────────

    async getPosts({ page = 1, limit = 20, status, authorId }) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status) where.status = status;
        if (authorId) where.authorId = authorId;

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true,
                            avatarUrl: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.post.count({ where }),
        ]);

        return { posts, total, page, limit };
    }

    async deletePost(postId) {
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) throw new Error("Post not found");

        await prisma.post.delete({ where: { id: postId } });
        return { id: postId };
    }

    async getProducts({ page = 1, limit = 20, status, sellerId }) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status) where.status = status;
        if (sellerId) where.sellerId = sellerId;

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    seller: {
                        select: { id: true, username: true, fullName: true },
                    },
                    images: { take: 1, orderBy: { displayOrder: "asc" } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.product.count({ where }),
        ]);

        return { products, total, page, limit };
    }

    async deleteProduct(productId) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) throw new Error("Product not found");

        await prisma.product.delete({ where: { id: productId } });
        return { id: productId };
    }

    // ─── UC4.4: Analytics Dashboard ─────────────────────────────

    async getDashboardStats() {
        const [
            totalUsers,
            totalSellers,
            totalBuyers,
            totalProducts,
            totalPosts,
            totalOrders,
            newUsersToday,
            newOrdersToday,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: "SELLER" } }),
            prisma.user.count({ where: { role: "BUYER" } }),
            prisma.product.count(),
            prisma.post.count(),
            prisma.order.count(),
            prisma.user.count({ where: { createdAt: { gte: _startOfDay() } } }),
            prisma.order.count({
                where: { createdAt: { gte: _startOfDay() } },
            }),
        ]);

        const revenueResult = await prisma.order.aggregate({
            _sum: { total: true },
            where: { status: { in: ["COMPLETED", "DELIVERED"] } },
        });

        return {
            totalUsers,
            totalSellers,
            totalBuyers,
            totalProducts,
            totalPosts,
            totalOrders,
            newUsersToday,
            newOrdersToday,
            totalRevenue: revenueResult._sum.total || 0,
        };
    }

    async getGrowthStats(days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const [userGrowth, orderGrowth] = await Promise.all([
            prisma.$queryRaw`
        SELECT DATE(created_at) as date, COUNT(*)::int as count
        FROM users
        WHERE created_at >= ${since}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
            prisma.$queryRaw`
        SELECT DATE(created_at) as date, COUNT(*)::int as count
        FROM orders
        WHERE created_at >= ${since}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
        ]);

        return { userGrowth, orderGrowth };
    }
}

function _startOfDay() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

export default new AdminService();
