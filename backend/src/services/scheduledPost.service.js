import prisma from "../config/database.js";

class ScheduledPostService {
    /**
     * UC6.1 – Schedule a post for future publishing
     */
    async schedulePost(
        userId,
        { content, mediaUrls, mediaType, productId, scheduledTime, timezone },
    ) {
        const scheduled = new Date(scheduledTime);
        if (scheduled <= new Date()) {
            throw new Error("Scheduled time must be in the future");
        }

        return prisma.scheduledPost.create({
            data: {
                userId,
                content,
                mediaUrls: mediaUrls || [],
                mediaType: mediaType || null,
                productId: productId || null,
                scheduledTime: scheduled,
                timezone: timezone || "Asia/Ho_Chi_Minh",
                status: "scheduled",
            },
        });
    }

    /**
     * UC6.2 – Get all scheduled posts for a user
     */
    async getScheduledPosts(userId, { page = 1, limit = 20 } = {}) {
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            prisma.scheduledPost.findMany({
                where: { userId },
                include: {
                    product: { select: { id: true, title: true, slug: true } },
                },
                orderBy: { scheduledTime: "asc" },
                skip,
                take: limit,
            }),
            prisma.scheduledPost.count({ where: { userId } }),
        ]);

        return { posts, total, page, limit };
    }

    /**
     * UC6.2 – Update a scheduled post
     */
    async updateScheduledPost(id, userId, data) {
        const existing = await prisma.scheduledPost.findFirst({
            where: { id, userId, status: "scheduled" },
        });
        if (!existing)
            throw new Error("Scheduled post not found or already published");

        const updateData = {};
        if (data.content !== undefined) updateData.content = data.content;
        if (data.mediaUrls !== undefined) updateData.mediaUrls = data.mediaUrls;
        if (data.mediaType !== undefined) updateData.mediaType = data.mediaType;
        if (data.productId !== undefined) updateData.productId = data.productId;
        if (data.scheduledTime) {
            const scheduled = new Date(data.scheduledTime);
            if (scheduled <= new Date())
                throw new Error("Scheduled time must be in the future");
            updateData.scheduledTime = scheduled;
        }

        return prisma.scheduledPost.update({ where: { id }, data: updateData });
    }

    /**
     * UC6.2 – Publish a scheduled post immediately
     */
    async publishNow(id, userId) {
        const existing = await prisma.scheduledPost.findFirst({
            where: { id, userId, status: "scheduled" },
        });
        if (!existing)
            throw new Error("Scheduled post not found or already published");

        const post = await prisma.post.create({
            data: {
                authorId: userId,
                content: existing.content,
                mediaUrls: existing.mediaUrls,
                mediaType: existing.mediaType,
                productId: existing.productId,
                status: "PUBLISHED",
                visibility: "PUBLIC",
                publishedAt: new Date(),
            },
        });

        await prisma.scheduledPost.update({
            where: { id },
            data: { status: "published", publishedPostId: post.id },
        });

        return post;
    }

    /**
     * UC6.2 – Delete a scheduled post
     */
    async deleteScheduledPost(id, userId) {
        const existing = await prisma.scheduledPost.findFirst({
            where: { id, userId, status: "scheduled" },
        });
        if (!existing)
            throw new Error("Scheduled post not found or already published");

        return prisma.scheduledPost.delete({ where: { id } });
    }
}

export default new ScheduledPostService();
