import prisma from "../config/database.js";
import { cloudinary, deleteImage, getPublicIdFromUrl } from "../config/cloudinary.js";

const MAX_TAGGED_USERS = 10;

const SCHEDULED_POST_INCLUDE = {
    productTags: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        include: {
            product: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    price: true,
                    images: {
                        where: { isPrimary: true },
                        take: 1,
                        select: { imageUrl: true, altText: true },
                    },
                },
            },
        },
    },
};

function normalizeTaggedUserIds(raw) {
    if (!Array.isArray(raw)) return [];
    const uniq = [...new Set(raw.filter((id) => typeof id === "string" && id.length > 0))];
    return uniq.slice(0, MAX_TAGGED_USERS);
}

function normalizeText(value) {
    return value === undefined || value === null ? null : String(value).trim() || null;
}

function normalizeProductTags(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
        .filter((tag) => tag && typeof tag === "object" && typeof tag.productId === "string")
        .map((tag, index) => ({
            productId: tag.productId,
            anchorType: tag.anchorType || "MEDIA_HOTSPOT",
            positionX: typeof tag.positionX === "number" ? tag.positionX : null,
            positionY: typeof tag.positionY === "number" ? tag.positionY : null,
            blockId: typeof tag.blockId === "string" && tag.blockId.trim() ? tag.blockId.trim() : null,
            startOffset: Number.isInteger(tag.startOffset) ? tag.startOffset : null,
            endOffset: Number.isInteger(tag.endOffset) ? tag.endOffset : null,
            sortOrder: Number.isInteger(tag.sortOrder) ? tag.sortOrder : index,
        }));
}

function buildScheduledPostUpdateData(data, { allowScheduleTime = true } = {}) {
    const updateData = {};
    if (data.content !== undefined) updateData.content = data.content;
    if (data.mediaUrls !== undefined) updateData.mediaUrls = data.mediaUrls;
    if (data.mediaType !== undefined) updateData.mediaType = data.mediaType;
    if (data.location !== undefined) updateData.location = normalizeText(data.location);
    if (data.feeling !== undefined) updateData.feeling = normalizeText(data.feeling);
    if (data.taggedUserIds !== undefined) {
        updateData.taggedUserIds = normalizeTaggedUserIds(data.taggedUserIds);
    }
    if (data.scheduledTime !== undefined && allowScheduleTime) {
        const scheduled = new Date(data.scheduledTime);
        if (scheduled <= new Date()) {
            throw new Error("Scheduled time must be in the future");
        }
        updateData.scheduledTime = scheduled;
    }
    if (data.visibility !== undefined) updateData.visibility = data.visibility;
    return updateData;
}

async function deleteMediaAssets(mediaUrls, mediaType) {
    const urls = Array.isArray(mediaUrls) ? mediaUrls : [];
    if (!urls.length) {
        return;
    }

    const destroyers = urls.map((url) => {
        const publicId = getPublicIdFromUrl(url);
        if (!publicId) {
            return Promise.resolve();
        }

        if (mediaType === "VIDEO") {
            return cloudinary.uploader
                .destroy(publicId, { resource_type: "video" })
                .catch(() => {});
        }

        return deleteImage(publicId).catch(() => {});
    });

    await Promise.all(destroyers);
}

async function attachPublishedMetadata(posts) {
    const publishedPostIds = posts
        .map((post) => post.publishedPostId)
        .filter((postId) => typeof postId === "string" && postId.length > 0);

    if (!publishedPostIds.length) {
        return posts;
    }

    const publishedPosts = await prisma.post.findMany({
        where: { id: { in: publishedPostIds } },
        select: { id: true, publishedAt: true, createdAt: true },
    });
    const publishedMap = new Map(publishedPosts.map((post) => [post.id, post]));

    return posts.map((post) => ({
        ...post,
        publishedPost: post.publishedPostId ? publishedMap.get(post.publishedPostId) ?? null : null,
    }));
}

function parseAnalyticsRange(range) {
    switch (range) {
        case "7d":
            return 7;
        case "90d":
            return 90;
        case "30d":
        default:
            return 30;
    }
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
            productTags,
            scheduledTime,
            timezone,
            location,
            feeling,
            taggedUserIds,
            visibility,
        },
    ) {
        const scheduled = new Date(scheduledTime);
        if (scheduled <= new Date()) {
            throw new Error("Scheduled time must be in the future");
        }

        const normalizedTags = normalizeProductTags(productTags);
        return prisma.scheduledPost.create({
            data: {
                userId,
                content,
                mediaUrls: mediaUrls || [],
                mediaType: mediaType || null,
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
                ...(normalizedTags.length
                    ? {
                          productTags: {
                              create: normalizedTags,
                          },
                      }
                    : {}),
            },
            include: SCHEDULED_POST_INCLUDE,
        });
    }

    /**
     * UC6.2 – Get all scheduled posts for a user
     */
    async getScheduledPosts(userId, { status, page = 1, limit = 20 } = {}) {
        const skip = (page - 1) * limit;
        const normalizedStatus =
            typeof status === "string" && status.trim().length > 0
                ? status.trim().toLowerCase()
                : undefined;
        const where = {
            userId,
            ...(normalizedStatus ? { status: normalizedStatus } : {}),
        };

        if (normalizedStatus === "published") {
            const [posts, total] = await Promise.all([
                prisma.scheduledPost.findMany({
                    where,
                    include: SCHEDULED_POST_INCLUDE,
                    orderBy: { updatedAt: "desc" },
                    skip,
                    take: limit,
                }),
                prisma.scheduledPost.count({ where }),
            ]);
            const enrichedPosts = await attachPublishedMetadata(posts);
            return {
                posts: enrichedPosts,
                total,
                page,
                limit,
                hasMore: page * limit < total,
            };
        }

        const [posts, total] = await Promise.all([
            prisma.scheduledPost.findMany({
                where,
                include: SCHEDULED_POST_INCLUDE,
                orderBy: { scheduledTime: "desc" },
                skip,
                take: limit,
            }),
            prisma.scheduledPost.count({ where }),
        ]);

        return { posts, total, page, limit, hasMore: page * limit < total };
    }

    async getScheduledPostsAnalytics(userId, { range = "30d" } = {}) {
        const days = parseAnalyticsRange(range);
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - (days - 1));

        const scheduledPosts = await prisma.scheduledPost.findMany({
            where: {
                userId,
                status: "published",
                publishedPostId: { not: null },
            },
            include: SCHEDULED_POST_INCLUDE,
        });

        const publishedPostIds = scheduledPosts
            .map((post) => post.publishedPostId)
            .filter((postId) => typeof postId === "string" && postId.length > 0);

        if (!publishedPostIds.length) {
            return {
                summary: {
                    publishedCount: 0,
                    views: 0,
                    likes: 0,
                    comments: 0,
                    shares: 0,
                    engagement: 0,
                    engagementRate: 0,
                },
                series: [],
                topPosts: [],
                range,
            };
        }

        const publishedPosts = await prisma.post.findMany({
            where: {
                id: { in: publishedPostIds },
                authorId: userId,
                publishedAt: { gte: startDate },
            },
            select: {
                id: true,
                content: true,
                mediaUrls: true,
                mediaType: true,
                likesCount: true,
                commentsCount: true,
                sharesCount: true,
                viewsCount: true,
                publishedAt: true,
            },
        });

        const publishedMap = new Map(publishedPosts.map((post) => [post.id, post]));
        const analyticsPosts = scheduledPosts
            .map((scheduledPost) => {
                const publishedPost = scheduledPost.publishedPostId
                    ? publishedMap.get(scheduledPost.publishedPostId)
                    : undefined;
                if (!publishedPost) {
                    return null;
                }
                const engagement =
                    publishedPost.likesCount +
                    publishedPost.commentsCount +
                    publishedPost.sharesCount;
                return {
                    scheduledPostId: scheduledPost.id,
                    publishedPostId: publishedPost.id,
                    content: publishedPost.content ?? scheduledPost.content ?? "",
                    mediaUrls: publishedPost.mediaUrls,
                    mediaType: publishedPost.mediaType,
                    scheduledTime: scheduledPost.scheduledTime,
                    publishedAt: publishedPost.publishedAt,
                    viewsCount: publishedPost.viewsCount,
                    likesCount: publishedPost.likesCount,
                    commentsCount: publishedPost.commentsCount,
                    sharesCount: publishedPost.sharesCount,
                    engagement,
                    engagementRate:
                        publishedPost.viewsCount > 0
                            ? engagement / publishedPost.viewsCount
                            : 0,
                };
            })
            .filter(Boolean);

        const summary = analyticsPosts.reduce(
            (acc, post) => {
                acc.publishedCount += 1;
                acc.views += post.viewsCount;
                acc.likes += post.likesCount;
                acc.comments += post.commentsCount;
                acc.shares += post.sharesCount;
                acc.engagement += post.engagement;
                return acc;
            },
            {
                publishedCount: 0,
                views: 0,
                likes: 0,
                comments: 0,
                shares: 0,
                engagement: 0,
            },
        );

        const seriesMap = new Map();
        for (let i = 0; i < days; i += 1) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const key = date.toISOString().slice(0, 10);
            seriesMap.set(key, {
                date: key,
                publishedCount: 0,
                views: 0,
                engagement: 0,
            });
        }

        analyticsPosts.forEach((post) => {
            const key = new Date(post.publishedAt).toISOString().slice(0, 10);
            const bucket = seriesMap.get(key);
            if (!bucket) {
                return;
            }
            bucket.publishedCount += 1;
            bucket.views += post.viewsCount;
            bucket.engagement += post.engagement;
        });

        const topPosts = [...analyticsPosts]
            .sort((a, b) => b.engagement - a.engagement || b.viewsCount - a.viewsCount)
            .slice(0, 5);

        return {
            summary: {
                ...summary,
                engagementRate: summary.views > 0 ? summary.engagement / summary.views : 0,
            },
            series: Array.from(seriesMap.values()),
            topPosts,
            range,
        };
    }

    /**
     * UC6.2 – Update a scheduled post
     */
    async updateScheduledPost(id, userId, data) {
        const existing = await prisma.scheduledPost.findFirst({
            where: { id, userId },
            include: SCHEDULED_POST_INCLUDE,
        });
        if (!existing) {
            throw new Error("Scheduled post not found");
        }

        if (existing.status === "scheduled") {
            const updateData = buildScheduledPostUpdateData(data);
            const normalizedTags =
                data.productTags !== undefined ? normalizeProductTags(data.productTags) : null;
            return prisma.$transaction(async (tx) => {
                if (normalizedTags !== null) {
                    await tx.scheduledPostProductTag.deleteMany({ where: { scheduledPostId: id } });
                    if (normalizedTags.length > 0) {
                        await tx.scheduledPostProductTag.createMany({
                            data: normalizedTags.map((tag) => ({ ...tag, scheduledPostId: id })),
                        });
                    }
                }
                return tx.scheduledPost.update({
                    where: { id },
                    data: updateData,
                    include: SCHEDULED_POST_INCLUDE,
                });
            });
        }

        if (existing.status === "published" && existing.publishedPostId) {
            const scheduledUpdateData = buildScheduledPostUpdateData(data, {
                allowScheduleTime: false,
            });
            const postUpdateData = {
                ...(data.content !== undefined && { content: data.content }),
                ...(data.mediaUrls !== undefined && { mediaUrls: data.mediaUrls }),
                ...(data.mediaType !== undefined && { mediaType: data.mediaType }),
                ...(data.location !== undefined && { location: normalizeText(data.location) }),
                ...(data.feeling !== undefined && { feeling: normalizeText(data.feeling) }),
                ...(data.taggedUserIds !== undefined && {
                    taggedUserIds: normalizeTaggedUserIds(data.taggedUserIds),
                }),
                ...(data.visibility !== undefined && { visibility: data.visibility }),
            };

            const normalizedTags =
                data.productTags !== undefined ? normalizeProductTags(data.productTags) : null;
            const updatedScheduledPost = await prisma.$transaction(async (tx) => {
                const publishedPost = await tx.post.findFirst({
                    where: { id: existing.publishedPostId, authorId: userId },
                    select: { id: true, publishedAt: true, createdAt: true },
                });
                if (!publishedPost) {
                    throw new Error("Published post not found");
                }

                if (normalizedTags !== null) {
                    await tx.scheduledPostProductTag.deleteMany({ where: { scheduledPostId: id } });
                    if (normalizedTags.length > 0) {
                        await tx.scheduledPostProductTag.createMany({
                            data: normalizedTags.map((tag) => ({ ...tag, scheduledPostId: id })),
                        });
                    }
                }
                await tx.post.update({
                    where: { id: existing.publishedPostId },
                    data: postUpdateData,
                });
                if (normalizedTags !== null) {
                    await tx.postProductTag.deleteMany({ where: { postId: existing.publishedPostId } });
                    if (normalizedTags.length > 0) {
                        await tx.postProductTag.createMany({
                            data: normalizedTags.map((tag) => ({ ...tag, postId: existing.publishedPostId })),
                        });
                    }
                }
                const updated = await tx.scheduledPost.update({
                    where: { id },
                    data: scheduledUpdateData,
                    include: SCHEDULED_POST_INCLUDE,
                });
                return {
                    ...updated,
                    publishedPost,
                };
            });

            return updatedScheduledPost;
        }

        throw new Error("Scheduled post cannot be updated");
    }

    /**
     * UC6.2 – Publish a scheduled post immediately
     */
    async publishNow(id, userId) {
        const existing = await prisma.scheduledPost.findFirst({
            where: { id, userId, status: "scheduled" },
            include: SCHEDULED_POST_INCLUDE,
        });
        if (!existing)
            throw new Error("Scheduled post not found or already published");

        const post = await prisma.$transaction(async (tx) => {
            const created = await tx.post.create({
                data: {
                    authorId: userId,
                    content: existing.content,
                    mediaUrls: existing.mediaUrls,
                    mediaType: existing.mediaType,
                    location: existing.location,
                    feeling: existing.feeling,
                    taggedUserIds: existing.taggedUserIds || [],
                    status: "PUBLISHED",
                    visibility: existing.visibility || "PUBLIC",
                    publishedAt: new Date(),
                },
            });
            if (existing.productTags?.length) {
                await tx.postProductTag.createMany({
                    data: existing.productTags.map((tag) => ({
                        postId: created.id,
                        productId: tag.productId,
                        anchorType: tag.anchorType,
                        positionX: tag.positionX,
                        positionY: tag.positionY,
                        blockId: tag.blockId,
                        startOffset: tag.startOffset,
                        endOffset: tag.endOffset,
                        sortOrder: tag.sortOrder,
                    })),
                });
            }
            await tx.scheduledPost.update({
                where: { id },
                data: { status: "published", publishedPostId: created.id },
            });
            return created;
        });

        return post;
    }

    /**
     * UC6.2 – Delete a scheduled post
     */
    async deleteScheduledPost(id, userId) {
        const existing = await prisma.scheduledPost.findFirst({
            where: { id, userId },
        });
        if (!existing) {
            throw new Error("Scheduled post not found");
        }

        if (existing.status === "scheduled") {
            await deleteMediaAssets(existing.mediaUrls, existing.mediaType);
            return prisma.scheduledPost.delete({ where: { id } });
        }

        if (existing.status === "published" && existing.publishedPostId) {
            return prisma.$transaction(async (tx) => {
                const publishedPost = await tx.post.findFirst({
                    where: { id: existing.publishedPostId, authorId: userId },
                    select: { id: true, groupId: true },
                });
                if (!publishedPost) {
                    throw new Error("Published post not found");
                }

                await deleteMediaAssets(existing.mediaUrls, existing.mediaType);
                await tx.post.delete({ where: { id: publishedPost.id } });
                if (publishedPost.groupId) {
                    await tx.group.update({
                        where: { id: publishedPost.groupId },
                        data: { postsCount: { decrement: 1 } },
                    });
                }
                return tx.scheduledPost.delete({ where: { id } });
            });
        }

        throw new Error("Scheduled post cannot be deleted");
    }
}

export default new ScheduledPostService();
