import prisma from '../config/database.js';
import notificationService from './notification.service.js';
import {
  orderBySearchIds,
  searchPosts as searchPostsWithElasticsearch,
} from './elasticsearch.service.js';

const MAX_TAGGED_USERS = 10;

function normalizeTaggedUserIds(raw) {
  if (!Array.isArray(raw)) return [];
  const uniq = [...new Set(raw.filter((id) => typeof id === 'string' && id.length > 0))];
  return uniq.slice(0, MAX_TAGGED_USERS);
}

const AUTHOR_SELECT = {
  id: true,
  username: true,
  fullName: true,
  avatarUrl: true,
  isVerified: true,
  role: true,
};

const POST_INCLUDE = {
  author: { select: AUTHOR_SELECT },
  productTags: {
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: {
      product: {
        select: {
          id: true,
          title: true,
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
  group: {
    select: { id: true, name: true, avatarUrl: true, coverImageUrl: true },
  },
  _count: { select: { likes: true, comments: true } },
  comments: {
    where: { parentId: null },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: {
      user: {
        select: { id: true, username: true, fullName: true, avatarUrl: true, isVerified: true },
      },
      _count: { select: { replies: true } },
    },
  },
};

function normalizeProductTags(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((tag) => tag && typeof tag === 'object' && typeof tag.productId === 'string')
    .map((tag, index) => ({
      productId: tag.productId,
      anchorType: tag.anchorType || 'MEDIA_HOTSPOT',
      positionX: typeof tag.positionX === 'number' ? tag.positionX : null,
      positionY: typeof tag.positionY === 'number' ? tag.positionY : null,
      blockId: typeof tag.blockId === 'string' && tag.blockId.trim() ? tag.blockId.trim() : null,
      startOffset: Number.isInteger(tag.startOffset) ? tag.startOffset : null,
      endOffset: Number.isInteger(tag.endOffset) ? tag.endOffset : null,
      sortOrder: Number.isInteger(tag.sortOrder) ? tag.sortOrder : index,
    }));
}

// ─── Create post (UC2.2) ───────────────────────────────

export const createPost = async (authorId, data) => {
  const {
    content,
    mediaUrls,
    mediaType,
    productTags,
    groupId,
    visibility,
    status,
    location,
    feeling,
    taggedUserIds,
  } = data;

  if (groupId) {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new Error('Group not found');
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: authorId } },
    });
    if (!membership) throw new Error('Must be a group member to post');
  }

  const normalizedTags = normalizeProductTags(productTags);
  const post = await prisma.post.create({
    data: {
      authorId,
      content: content === undefined || content === null ? null : String(content).trim() || null,
      mediaUrls: mediaUrls || [],
      mediaType,
      groupId: groupId || null,
      location: location === undefined || location === null ? null : String(location).trim() || null,
      feeling: feeling === undefined || feeling === null ? null : String(feeling).trim() || null,
      taggedUserIds: normalizeTaggedUserIds(taggedUserIds),
      visibility: visibility || 'PUBLIC',
      status: status || 'PUBLISHED',
      publishedAt: status === 'PUBLISHED' || !status ? new Date() : null,
      ...(normalizedTags.length
        ? {
            productTags: {
              create: normalizedTags,
            },
          }
        : {}),
    },
    include: POST_INCLUDE,
  });

  return post;
};

// ─── Personalized feed (UC2.1) ─────────────────────────

export const getPersonalizedFeed = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const followingIds = (
    await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    })
  ).map((f) => f.followingId);

  const followedPostsLimit = Math.ceil(limit * 0.7);
  const suggestedPostsLimit = limit - followedPostsLimit;

  const baseWhere = { status: 'PUBLISHED', visibility: 'PUBLIC' };

  const [followedPosts, suggestedPosts] = await Promise.all([
    followingIds.length > 0
      ? prisma.post.findMany({
          where: { ...baseWhere, authorId: { in: followingIds } },
          skip,
          take: followedPostsLimit,
          orderBy: { createdAt: 'desc' },
          include: {
            ...POST_INCLUDE,
            likes: { where: { userId }, select: { id: true } },
          },
        })
      : [],
    prisma.post.findMany({
      where: {
        ...baseWhere,
        authorId: { notIn: [...followingIds, userId] },
      },
      skip,
      take: suggestedPostsLimit,
      orderBy: [{ likesCount: 'desc' }, { createdAt: 'desc' }],
      include: {
        ...POST_INCLUDE,
        likes: { where: { userId }, select: { id: true } },
      },
    }),
  ]);

  const addLikeFlag = (p) => {
    p.isLiked = p.likes?.length > 0;
    delete p.likes;
    return p;
  };

  const combined = [...followedPosts, ...suggestedPosts].map(addLikeFlag);

  const total = await prisma.post.count({ where: baseWhere });

  return {
    posts: combined,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Public feed (no auth) ─────────────────────────────

export const getPosts = async (filters = {}) => {
  const {
    page = 1,
    limit = 20,
    authorId,
    visibility = 'PUBLIC',
    status = 'PUBLISHED',
    search,
    userId,
    sourceScope = 'all',
    postedFrom,
    postedTo,
    sortBy = 'latest',
  } = filters;

  const skip = (page - 1) * limit;

  let scopedAuthorIds = null;
  if (userId && (sourceScope === 'follower' || sourceScope === 'followee')) {
    if (sourceScope === 'followee') {
      const rows = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });
      scopedAuthorIds = rows.map((row) => row.followingId);
    } else {
      const rows = await prisma.follow.findMany({
        where: { followingId: userId },
        select: { followerId: true },
      });
      scopedAuthorIds = rows.map((row) => row.followerId);
    }
  }

  const elasticResult = await searchPostsWithElasticsearch({
    ...filters,
    page,
    limit,
    visibility,
    status,
    scopedAuthorIds,
  });
  if (elasticResult) {
    const posts =
      elasticResult.ids.length > 0
        ? await prisma.post.findMany({
            where: {
              id: { in: elasticResult.ids },
              status,
              ...(visibility && { visibility }),
              ...(authorId && { authorId }),
            },
            include: {
              ...POST_INCLUDE,
              ...(userId && { likes: { where: { userId }, select: { id: true } } }),
            },
          })
        : [];
    const ordered = orderBySearchIds(posts, elasticResult.ids);
    const result = userId
      ? ordered.map((p) => {
          p.isLiked = p.likes?.length > 0;
          delete p.likes;
          return p;
        })
      : ordered;

    return {
      posts: result,
      pagination: { page, limit, total: elasticResult.total, totalPages: Math.ceil(elasticResult.total / limit) },
    };
  }

  const where = {
    status,
    ...(authorId && { authorId }),
    ...(visibility && { visibility }),
    ...(search && { content: { contains: search, mode: 'insensitive' } }),
    ...(scopedAuthorIds ? { authorId: { in: scopedAuthorIds } } : {}),
    ...((postedFrom || postedTo)
      ? {
          createdAt: {
            ...(postedFrom ? { gte: postedFrom } : {}),
            ...(postedTo ? { lte: postedTo } : {}),
          },
        }
      : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: sortBy === 'latest' ? { createdAt: 'desc' } : { createdAt: 'desc' },
      include: {
        ...POST_INCLUDE,
        ...(userId && { likes: { where: { userId }, select: { id: true } } }),
      },
    }),
    prisma.post.count({ where }),
  ]);

  const result = userId
    ? posts.map((p) => {
        p.isLiked = p.likes?.length > 0;
        delete p.likes;
        return p;
      })
    : posts;

  return {
    posts: result,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Get single post ───────────────────────────────────

export const getPostById = async (postId, userId = null) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          ...AUTHOR_SELECT,
          coverImage: true,
          bio: true,
          _count: { select: { followers: true, following: true, products: true, posts: true } },
        },
      },
      productTags: {
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: {
          product: {
            include: {
              images: { orderBy: { displayOrder: 'asc' }, take: 1 },
              categories: true,
              seller: { select: AUTHOR_SELECT },
            },
          },
        },
      },
      group: {
        select: { id: true, name: true, avatarUrl: true, coverImageUrl: true },
      },
      productTags: {
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              images: {
                where: { isPrimary: true },
                orderBy: { displayOrder: 'asc' },
                take: 1,
              },
            },
          },
        },
      },
      likes: userId ? { where: { userId }, select: { id: true } } : false,
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              id: true, username: true, fullName: true, avatarUrl: true, isVerified: true,
            },
          },
          _count: { select: { replies: true } },
        },
      },
      _count: { select: { likes: true, comments: true } },
    },
  });

  if (!post) throw new Error('Post not found');

  await prisma.post.update({
    where: { id: postId },
    data: { viewsCount: { increment: 1 } },
  });

  if (userId) {
    post.isLiked = post.likes && post.likes.length > 0;
    delete post.likes;
  }

  return post;
};

// ─── Update post ───────────────────────────────────────

export const updatePost = async (postId, authorId, data) => {
  const existingPost = await prisma.post.findUnique({ where: { id: postId } });
  if (!existingPost) throw new Error('Post not found');
  if (existingPost.authorId !== authorId) throw new Error('Unauthorized to update this post');

  const {
    content,
    mediaUrls,
    mediaType,
    productTags,
    visibility,
    status,
    location,
    feeling,
    taggedUserIds,
  } = data;

  const normalizedTags = productTags !== undefined ? normalizeProductTags(productTags) : null;
  return prisma.$transaction(async (tx) => {
    if (normalizedTags !== null) {
      await tx.postProductTag.deleteMany({ where: { postId } });
      if (normalizedTags.length > 0) {
        await tx.postProductTag.createMany({
          data: normalizedTags.map((tag) => ({ ...tag, postId })),
        });
      }
    }
    return tx.post.update({
      where: { id: postId },
      data: {
        ...(content !== undefined && {
          content: content === null ? null : String(content).trim() || null,
        }),
        ...(mediaUrls !== undefined && { mediaUrls }),
        ...(mediaType !== undefined && { mediaType }),
        ...(location !== undefined && {
          location: location === null ? null : String(location).trim() || null,
        }),
        ...(feeling !== undefined && {
          feeling: feeling === null ? null : String(feeling).trim() || null,
        }),
        ...(taggedUserIds !== undefined && { taggedUserIds: normalizeTaggedUserIds(taggedUserIds) }),
        ...(visibility !== undefined && { visibility }),
        ...(status !== undefined && { status }),
        ...(status === 'PUBLISHED' && !existingPost.publishedAt && { publishedAt: new Date() }),
      },
      include: POST_INCLUDE,
    });
  });
};

// ─── Delete post ───────────────────────────────────────

export const deletePost = async (postId, authorId) => {
  const existingPost = await prisma.post.findUnique({ where: { id: postId } });
  if (!existingPost) throw new Error('Post not found');
  if (existingPost.authorId !== authorId) {
    throw new Error('Unauthorized to delete this post');
  }
  await prisma.$transaction(async (tx) => {
    await tx.post.delete({ where: { id: postId } });
    if (existingPost.groupId) {
      await tx.group.update({
        where: { id: existingPost.groupId },
        data: { postsCount: { decrement: 1 } },
      });
    }
  });
  return { message: 'Post deleted successfully' };
};

/** Platform admin moderation (JWT via /api/admin) */
export const deletePostAsModerator = async (postId) => {
  const existingPost = await prisma.post.findUnique({ where: { id: postId } });
  if (!existingPost) throw new Error('Post not found');
  await prisma.$transaction(async (tx) => {
    await tx.post.delete({ where: { id: postId } });
    if (existingPost.groupId) {
      await tx.group.update({
        where: { id: existingPost.groupId },
        data: { postsCount: { decrement: 1 } },
      });
    }
  });
  return { message: 'Post deleted successfully' };
};

// ─── Like / Unlike (UC2.4) with notification ───────────

export const toggleLike = async (postId, userId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });
  if (!post) throw new Error('Post not found');

  const existingLike = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existingLike) {
    await prisma.$transaction([
      prisma.postLike.delete({ where: { id: existingLike.id } }),
      prisma.post.update({ where: { id: postId }, data: { likesCount: { decrement: 1 } } }),
    ]);
    return { liked: false, message: 'Post unliked' };
  }

  await prisma.$transaction([
    prisma.postLike.create({ data: { postId, userId } }),
    prisma.post.update({ where: { id: postId }, data: { likesCount: { increment: 1 } } }),
  ]);

  const liker = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, fullName: true },
  });
  notificationService.notifyLike(post, liker).catch(() => {});

  return { liked: true, message: 'Post liked' };
};

// ─── Comment (UC2.4) with notification ─────────────────

export const addComment = async (postId, userId, content, parentId = null) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });
  if (!post) throw new Error('Post not found');

  const comment = await prisma.$transaction(async (tx) => {
    const newComment = await tx.postComment.create({
      data: { postId, userId, content, parentId },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, avatarUrl: true, isVerified: true },
        },
      },
    });
    await tx.post.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } },
    });
    return newComment;
  });

  const commenter = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, fullName: true },
  });
  notificationService.notifyComment(post, commenter).catch(() => {});

  return comment;
};

// ─── Update / Delete comment ───────────────────────────

export const updateComment = async (commentId, userId, content) => {
  const comment = await prisma.postComment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error('Comment not found');
  if (comment.userId !== userId) throw new Error('Unauthorized');
  return prisma.postComment.update({
    where: { id: commentId },
    data: { content },
    include: {
      user: {
        select: { id: true, username: true, fullName: true, avatarUrl: true, isVerified: true },
      },
    },
  });
};

export const deleteComment = async (commentId, userId) => {
  const comment = await prisma.postComment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error('Comment not found');
  if (comment.userId !== userId) {
    throw new Error('Unauthorized');
  }
  await prisma.$transaction([
    prisma.postComment.delete({ where: { id: commentId } }),
    prisma.post.update({
      where: { id: comment.postId },
      data: { commentsCount: { decrement: 1 } },
    }),
  ]);
  return { message: 'Comment deleted' };
};

export const deleteCommentAsModerator = async (commentId) => {
  const comment = await prisma.postComment.findUnique({ where: { id: commentId } });
  if (!comment) throw new Error('Comment not found');
  await prisma.$transaction([
    prisma.postComment.delete({ where: { id: commentId } }),
    prisma.post.update({
      where: { id: comment.postId },
      data: { commentsCount: { decrement: 1 } },
    }),
  ]);
  return { message: 'Comment deleted' };
};

// ─── Get comments ──────────────────────────────────────

export const getComments = async (postId, page = 1, limit = 20, offset) => {
  const skip = offset !== undefined ? offset : (page - 1) * limit;
  const [comments, total] = await Promise.all([
    prisma.postComment.findMany({
      where: { postId, parentId: null },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, avatarUrl: true, isVerified: true },
        },
        replies: {
          take: 3,
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: {
                id: true, username: true, fullName: true, avatarUrl: true, isVerified: true,
              },
            },
          },
        },
        _count: { select: { replies: true } },
      },
    }),
    prisma.postComment.count({ where: { postId, parentId: null } }),
  ]);
  return {
    comments,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getReplies = async (commentId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const [replies, total] = await Promise.all([
    prisma.postComment.findMany({
      where: { parentId: commentId },
      skip,
      take: limit,
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, avatarUrl: true, isVerified: true },
        },
      },
    }),
    prisma.postComment.count({ where: { parentId: commentId } }),
  ]);
  return {
    replies,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Get user posts ────────────────────────────────────

export const getUserPosts = async (userId, filters = {}) => {
  const { page = 1, limit = 20, status = 'PUBLISHED' } = filters;
  const skip = (page - 1) * limit;

  const where = { authorId: userId, ...(status && { status }) };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: POST_INCLUDE,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ─── Share post ────────────────────────────────────────

export const sharePost = async (postId) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error('Post not found');
  await prisma.post.update({
    where: { id: postId },
    data: { sharesCount: { increment: 1 } },
  });
  return { sharesCount: post.sharesCount + 1 };
};
