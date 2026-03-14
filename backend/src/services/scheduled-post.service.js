import prisma from '../config/database.js';
import { ApiError } from '../middlewares/error.middleware.js';
import { createPost as createFeedPost } from './post.service.js';

const MAX_LIMIT = 50;

const buildScheduledPostPayload = (data = {}) => ({
  content: data.content ? String(data.content).trim() : '',
  mediaUrls: Array.isArray(data.mediaUrls) ? data.mediaUrls : [],
  mediaType: data.mediaType || 'NONE',
  productId: data.productId || null,
  visibility: data.visibility || 'PUBLIC'
});

const toScheduledPostResponse = (scheduledPost) => ({
  id: scheduledPost.id,
  userId: scheduledPost.userId,
  content: scheduledPost.content || '',
  mediaUrls: scheduledPost.mediaUrls || [],
  mediaType: scheduledPost.mediaType || 'NONE',
  productId: scheduledPost.productId,
  scheduledTime: scheduledPost.scheduledTime,
  timezone: scheduledPost.timezone,
  status: scheduledPost.status,
  publishedPostId: scheduledPost.publishedPostId,
  errorMessage: scheduledPost.errorMessage,
  createdAt: scheduledPost.createdAt,
  updatedAt: scheduledPost.updatedAt,
  product: scheduledPost.product || null
});

export const publishScheduledPostRecord = async (scheduledPostId, userId) => {
  const scheduledPost = await prisma.scheduledPost.findFirst({
    where: {
      id: scheduledPostId,
      userId
    }
  });

  if (!scheduledPost) {
    throw new ApiError(404, 'Scheduled post not found');
  }

  if (scheduledPost.status === 'published' && scheduledPost.publishedPostId) {
    const existing = await prisma.scheduledPost.findUnique({
      where: { id: scheduledPost.id },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            images: {
              take: 1,
              orderBy: { displayOrder: 'asc' },
              select: { imageUrl: true }
            }
          }
        }
      }
    });
    return toScheduledPostResponse(existing);
  }

  const payload = buildScheduledPostPayload(scheduledPost);

  try {
    const createdPost = await createFeedPost(userId, {
      ...payload,
      status: 'PUBLISHED'
    });

    const updated = await prisma.scheduledPost.update({
      where: { id: scheduledPost.id },
      data: {
        status: 'published',
        publishedPostId: createdPost.id,
        errorMessage: null
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            images: {
              take: 1,
              orderBy: { displayOrder: 'asc' },
              select: { imageUrl: true }
            }
          }
        }
      }
    });

    return toScheduledPostResponse(updated);
  } catch (error) {
    await prisma.scheduledPost.update({
      where: { id: scheduledPost.id },
      data: {
        status: 'failed',
        errorMessage: error.message || 'Failed to publish scheduled post'
      }
    });
    throw error;
  }
};

export const syncDueScheduledPosts = async (userId) => {
  const duePosts = await prisma.scheduledPost.findMany({
    where: {
      userId,
      status: 'scheduled',
      scheduledTime: {
        lte: new Date()
      }
    },
    select: { id: true }
  });

  for (const scheduledPost of duePosts) {
    try {
      await publishScheduledPostRecord(scheduledPost.id, userId);
    } catch (error) {
      // Failed records are marked in publishScheduledPostRecord.
    }
  }
};

export const syncAllDueScheduledPosts = async () => {
  const duePosts = await prisma.scheduledPost.findMany({
    where: {
      status: 'scheduled',
      scheduledTime: {
        lte: new Date()
      }
    },
    select: {
      id: true,
      userId: true
    }
  });

  for (const scheduledPost of duePosts) {
    try {
      await publishScheduledPostRecord(scheduledPost.id, scheduledPost.userId);
    } catch (error) {
      // Failed records are marked in publishScheduledPostRecord.
    }
  }

  return duePosts.length;
};

export const createScheduledPost = async (userId, data) => {
  const payload = buildScheduledPostPayload(data);

  if (!payload.content) {
    throw new ApiError(400, 'Content is required');
  }

  const scheduledTime = new Date(data.scheduledTime);
  if (Number.isNaN(scheduledTime.getTime())) {
    throw new ApiError(400, 'Scheduled time is invalid');
  }

  if (scheduledTime.getTime() <= Date.now()) {
    throw new ApiError(400, 'Scheduled time must be in the future');
  }

  const scheduledPost = await prisma.scheduledPost.create({
    data: {
      userId,
      content: payload.content,
      mediaUrls: payload.mediaUrls,
      mediaType: payload.mediaType,
      productId: payload.productId,
      scheduledTime,
      timezone: data.timezone || 'Asia/Ho_Chi_Minh',
      status: 'scheduled'
    },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          images: {
            take: 1,
            orderBy: { displayOrder: 'asc' },
            select: { imageUrl: true }
          }
        }
      }
    }
  });

  return toScheduledPostResponse(scheduledPost);
};

export const getScheduledPosts = async (userId, filters = {}) => {
  await syncDueScheduledPosts(userId);

  const page = Math.max(parseInt(filters.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(filters.limit, 10) || 20, 1), MAX_LIMIT);
  const skip = (page - 1) * limit;
  const status = filters.status && filters.status !== 'all' ? filters.status : undefined;
  const search = String(filters.search || '').trim();
  const startDate = filters.startDate ? new Date(filters.startDate) : null;
  const endDate = filters.endDate ? new Date(filters.endDate) : null;
  const sortOrder = filters.sortOrder === 'desc' ? 'desc' : 'asc';

  const where = {
    userId,
    ...(status && { status }),
    ...(search && {
      content: {
        contains: search,
        mode: 'insensitive'
      }
    }),
    ...((startDate || endDate) && {
      scheduledTime: {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate })
      }
    })
  };

  const [items, total, counts] = await Promise.all([
    prisma.scheduledPost.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        scheduledTime: sortOrder
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            images: {
              take: 1,
              orderBy: { displayOrder: 'asc' },
              select: { imageUrl: true }
            }
          }
        }
      }
    }),
    prisma.scheduledPost.count({ where }),
    prisma.scheduledPost.groupBy({
      by: ['status'],
      where: { userId },
      _count: {
        status: true
      }
    })
  ]);

  const statusCounts = counts.reduce(
    (acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    },
    { scheduled: 0, published: 0, failed: 0 }
  );

  return {
    items: items.map(toScheduledPostResponse),
    counts: {
      all: statusCounts.scheduled + statusCounts.published + statusCounts.failed,
      scheduled: statusCounts.scheduled,
      published: statusCounts.published,
      failed: statusCounts.failed
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1)
    }
  };
};

export const deleteScheduledPost = async (scheduledPostId, userId) => {
  const scheduledPost = await prisma.scheduledPost.findFirst({
    where: {
      id: scheduledPostId,
      userId
    }
  });

  if (!scheduledPost) {
    throw new ApiError(404, 'Scheduled post not found');
  }

  await prisma.scheduledPost.delete({
    where: { id: scheduledPostId }
  });

  return { id: scheduledPostId, deleted: true };
};
