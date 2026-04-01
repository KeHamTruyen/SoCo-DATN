import prisma from "../config/database.js";

class ReportService {
    async getReports({ page = 1, limit = 20, status, targetType } = {}) {
        const skip = (page - 1) * limit;
        const where = {
            ...(status && { status }),
            ...(targetType && { targetType }),
        };

        const [reports, total] = await Promise.all([
            prisma.report.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    reporter: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true,
                            avatarUrl: true,
                        },
                    },
                    resolverAdmin: {
                        select: { id: true, username: true, fullName: true },
                    },
                },
            }),
            prisma.report.count({ where }),
        ]);

        const enrichedReports = await Promise.all(
            reports.map((report) => this.#enrichReport(report)),
        );

        return {
            reports: enrichedReports,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getReportById(reportId) {
        const report = await prisma.report.findUnique({
            where: { id: reportId },
            include: {
                reporter: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        avatarUrl: true,
                    },
                },
                resolverAdmin: {
                    select: { id: true, username: true, fullName: true },
                },
            },
        });
        if (!report) throw new Error("Report not found");
        return this.#enrichReport(report);
    }

    async resolveReport(reportId, adminId, data) {
        const { resolution, status } = data;

        const report = await prisma.report.findUnique({ where: { id: reportId } });
        if (!report) throw new Error("Report not found");
        if (report.status !== "pending") {
            throw new Error("Report already resolved");
        }

        return prisma.report.update({
            where: { id: reportId },
            data: {
                status: status || "resolved",
                resolution,
                resolvedBy: adminId,
                resolvedAt: new Date(),
            },
            include: {
                reporter: {
                    select: { id: true, username: true, fullName: true },
                },
                resolverAdmin: {
                    select: { id: true, username: true, fullName: true },
                },
            },
        });
    }

    async #enrichReport(report) {
        const target = await this.#getTargetSnapshot(report.targetType, report.targetId);
        return {
            ...report,
            targetTitle: target.title,
            targetSubtitle: target.subtitle,
            targetPreview: target.preview,
            targetImageUrl: target.imageUrl,
            targetStatus: target.status,
            targetDeleted: target.deleted,
            targetDetail: target.detail,
        };
    }

    async #getTargetSnapshot(targetType, targetId) {
        switch (targetType) {
            case "post": {
                const post = await prisma.post.findUnique({
                    where: { id: targetId },
                    select: {
                        id: true,
                        content: true,
                        mediaUrls: true,
                        status: true,
                        createdAt: true,
                        author: {
                            select: {
                                id: true,
                                username: true,
                                fullName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                });
                if (!post) return this.#missingTargetSnapshot(targetType, targetId);
                return {
                    title: post.author.fullName || `@${post.author.username}`,
                    subtitle: "Post",
                    preview: post.content || "(media only post)",
                    imageUrl: post.mediaUrls[0] || null,
                    status: post.status,
                    deleted: false,
                    detail: {
                        kind: "post",
                        id: post.id,
                        content: post.content,
                        mediaUrls: post.mediaUrls,
                        status: post.status,
                        createdAt: post.createdAt,
                        author: post.author,
                    },
                };
            }
            case "product": {
                const product = await prisma.product.findUnique({
                    where: { id: targetId },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        status: true,
                        price: true,
                        createdAt: true,
                        seller: {
                            select: {
                                id: true,
                                username: true,
                                fullName: true,
                            },
                        },
                        images: {
                            take: 3,
                            orderBy: { displayOrder: "asc" },
                            select: { imageUrl: true },
                        },
                    },
                });
                if (!product) return this.#missingTargetSnapshot(targetType, targetId);
                return {
                    title: product.title,
                    subtitle: product.seller.fullName || `@${product.seller.username}`,
                    preview: product.description || "No description available",
                    imageUrl: product.images[0]?.imageUrl || null,
                    status: product.status,
                    deleted: false,
                    detail: {
                        kind: "product",
                        id: product.id,
                        title: product.title,
                        description: product.description,
                        status: product.status,
                        price: product.price,
                        createdAt: product.createdAt,
                        seller: product.seller,
                        images: product.images,
                    },
                };
            }
            case "user": {
                const user = await prisma.user.findUnique({
                    where: { id: targetId },
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        email: true,
                        avatarUrl: true,
                        bio: true,
                        role: true,
                        isActive: true,
                        createdAt: true,
                    },
                });
                if (!user) return this.#missingTargetSnapshot(targetType, targetId);
                return {
                    title: user.fullName || `@${user.username}`,
                    subtitle: user.email,
                    preview: user.bio || "No profile bio",
                    imageUrl: user.avatarUrl,
                    status: user.isActive ? "active" : "inactive",
                    deleted: false,
                    detail: {
                        kind: "user",
                        id: user.id,
                        username: user.username,
                        fullName: user.fullName,
                        email: user.email,
                        avatarUrl: user.avatarUrl,
                        bio: user.bio,
                        role: user.role,
                        isActive: user.isActive,
                        createdAt: user.createdAt,
                    },
                };
            }
            case "comment": {
                const comment = await prisma.postComment.findUnique({
                    where: { id: targetId },
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        postId: true,
                        user: {
                            select: {
                                id: true,
                                username: true,
                                fullName: true,
                                avatarUrl: true,
                            },
                        },
                        post: {
                            select: {
                                id: true,
                                content: true,
                                mediaUrls: true,
                            },
                        },
                    },
                });
                if (!comment) return this.#missingTargetSnapshot(targetType, targetId);
                return {
                    title: comment.user.fullName || `@${comment.user.username}`,
                    subtitle: "Comment",
                    preview: comment.content,
                    imageUrl: comment.post.mediaUrls[0] || comment.user.avatarUrl || null,
                    status: "published",
                    deleted: false,
                    detail: {
                        kind: "comment",
                        id: comment.id,
                        content: comment.content,
                        createdAt: comment.createdAt,
                        user: comment.user,
                        post: comment.post,
                    },
                };
            }
            default:
                return this.#missingTargetSnapshot(targetType, targetId);
        }
    }

    #missingTargetSnapshot(targetType, targetId) {
        return {
            title: `${targetType} removed`,
            subtitle: `Target ID: ${targetId}`,
            preview: "The reported target no longer exists or cannot be loaded.",
            imageUrl: null,
            status: "unavailable",
            deleted: true,
            detail: null,
        };
    }
}

export default new ReportService();
