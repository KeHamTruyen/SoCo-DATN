import prisma from "../config/database.js";

const MAX_TAGGED_USERS = 10;

function normalizeTaggedUserIds(raw) {
    if (!Array.isArray(raw)) return [];
    const uniq = [...new Set(raw.filter((id) => typeof id === "string" && id.length > 0))];
    return uniq.slice(0, MAX_TAGGED_USERS);
}

class ScheduledPostService {
    /**
     * UC6.1 – Schedule a post for future publishing
     */
    async schedulePost(
        userId,
        {
            content,
            mediaUrls,
            mediaType,
            productId,
            scheduledTime,
            timezone,
            location,
            feeling,
            taggedUserIds,
        },
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
                location:
                    location === undefined || location === null
                        ? null
                        : String(location).trim() || null,
                feeling:
                    feeling === undefined || feeling === null
                        ? null
                        : String(feeling).trim() || null,
                taggedUserIds: normalizeTaggedUserIds(taggedUserIds),
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
        if (data.location !== undefined) {
            updateData.location =
                data.location === null ? null : String(data.location).trim() || null;
        }
        if (data.feeling !== undefined) {
            updateData.feeling =
                data.feeling === null ? null : String(data.feeling).trim() || null;
        }
        if (data.taggedUserIds !== undefined) {
            updateData.taggedUserIds = normalizeTaggedUserIds(data.taggedUserIds);
        }
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
                location: existing.location,
                feeling: existing.feeling,
                taggedUserIds: existing.taggedUserIds || [],
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
