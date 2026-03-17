import { PrismaClient } from '@prisma/client';
import notificationService from './notification.service.js';

const prisma = new PrismaClient();

/**
 * Create a new post
 */
export const createPost = async (authorId, data) => {
  const { content, mediaUrls, mediaType, productId, visibility, status } = data;

  const post = await prisma.post.create({
    data: {
      authorId,
      content,
      mediaUrls: mediaUrls || [],
      mediaType,
      productId,
      visibility: visibility || 'PUBLIC',
      status: status || 'PUBLISHED',
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
          isVerified: true,
          role: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
          price: true,
          images: {
            where: { isPrimary: true },
            take: 1,
            select: {
              imageUrl: true,
              altText: true,
            },
          },
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  if (productId) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { sellerId: true }
      });

      if (product?.sellerId) {
        await notificationService.notifyProductMention(productId, product.sellerId, authorId, post.id);
      }
    } catch (error) {
      console.error('Failed to send product mention notification:', error);
    }
  }

  return post;
};

/**
 * Get posts with pagination and filters (Feed)
 */
export const getPosts = async (filters = {}) => {
  const {
    page = 1,
    limit = 20,
    authorId,
    productId,
    visibility,
    status = 'PUBLISHED',
    search,
    userId = null,
  } = filters;

  const skip = (page - 1) * limit;
  const hasExplicitFeedFilters = Boolean(authorId || productId || search || visibility);
  const shouldPersonalize = Boolean(userId) && status === 'PUBLISHED' && !hasExplicitFeedFilters;

  let followedAuthorIds = [];
  if (shouldPersonalize) {
    const followRows = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    followedAuthorIds = followRows.map((item) => item.followingId);
  }

  const where = {
    status,
    ...(authorId && { authorId }),
    ...(productId && { productId }),
    ...(search && {
      content: {
        contains: search,
        mode: 'insensitive',
      },
    }),
  };

  if (visibility) {
    where.visibility = visibility;
  } else if (shouldPersonalize) {
    where.OR = [
      { visibility: 'PUBLIC' },
      {
        visibility: 'FOLLOWERS',
        authorId: {
          in: [...followedAuthorIds, userId],
        },
      },
      {
        visibility: 'PRIVATE',
        authorId: userId,
      },
    ];
  } else {
    where.visibility = 'PUBLIC';
  }

  const includeConfig = {
    author: {
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        isVerified: true,
        role: true,
      },
    },
    product: {
      select: {
        id: true,
        title: true,
        price: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: {
            imageUrl: true,
            altText: true,
          },
        },
      },
    },
    likes: userId
      ? {
          where: { userId },
          select: { id: true },
        }
      : false,
    _count: {
      select: {
        likes: true,
        comments: true,
      },
    },
  };

  let posts;
  let total;

  if (shouldPersonalize) {
    total = await prisma.post.count({ where });

    const candidateLimit = Math.min(Math.max(page * limit * 5, 100), 500);
    const candidates = await prisma.post.findMany({
      where,
      skip: 0,
      take: candidateLimit,
      orderBy: {
        createdAt: 'desc',
      },
      include: includeConfig,
    });

    const now = Date.now();
    const followedSet = new Set(followedAuthorIds);

    const scored = candidates
      .map((post) => {
        const ageHours = Math.max(0, (now - new Date(post.createdAt).getTime()) / 3600000);
        const recencyScore = Math.max(0, 72 - ageHours) * 1.5;
        const engagementScore =
          post.likesCount * 3 +
          post.commentsCount * 4 +
          post.sharesCount * 2 +
          Math.min(post.viewsCount, 1000) * 0.05;
        const followBoost = followedSet.has(post.authorId) ? 500 : 0;
        const selfBoost = post.authorId === userId ? 120 : 0;

        return {
          post,
          score: followBoost + selfBoost + engagementScore + recencyScore,
        };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(b.post.createdAt).getTime() - new Date(a.post.createdAt).getTime();
      });

    posts = scored.slice(skip, skip + limit).map((item) => item.post);
  } else {
    const result = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: includeConfig,
      }),
      prisma.post.count({ where }),
    ]);

    posts = result[0];
    total = result[1];
  }

  // Add isLiked flag if user is logged in
  if (userId) {
    posts.forEach(post => {
      post.isLiked = post.likes && post.likes.length > 0;
      delete post.likes;
    });
  }

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single post by ID
 */
export const getPostById = async (postId, userId = null) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
          coverImage: true,
          bio: true,
          isVerified: true,
          role: true,
          _count: {
            select: {
              followers: true,
              following: true,
              products: true,
              posts: true,
            },
          },
        },
      },
      product: {
        include: {
          images: {
            orderBy: {
              displayOrder: 'asc',
            },
            take: 1,
          },
          category: true,
          seller: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              isVerified: true,
            },
          },
        },
      },
      likes: userId
        ? {
            where: { userId },
            select: { id: true },
          }
        : false,
      comments: {
        where: {
          parentId: null, // Top-level comments only
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              isVerified: true,
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  if (!post) {
    throw new Error('Post not found');
  }

  // Increment views count
  await prisma.post.update({
    where: { id: postId },
    data: {
      viewsCount: {
        increment: 1,
      },
    },
  });

  // Add isLiked flag if user is logged in
  if (userId) {
    post.isLiked = post.likes && post.likes.length > 0;
    delete post.likes;
  }

  return post;
};

/**
 * Update post
 */
export const updatePost = async (postId, authorId, data) => {
  // Check ownership
  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!existingPost) {
    throw new Error('Post not found');
  }

  if (existingPost.authorId !== authorId) {
    throw new Error('Unauthorized to update this post');
  }

  const { content, mediaUrls, mediaType, productId, visibility, status } = data;
  const shouldNotifyProductMention =
    productId !== undefined &&
    productId !== null &&
    productId !== existingPost.productId;

  const post = await prisma.post.update({
    where: { id: postId },
    data: {
      ...(content !== undefined && { content }),
      ...(mediaUrls !== undefined && { mediaUrls }),
      ...(mediaType !== undefined && { mediaType }),
      ...(productId !== undefined && { productId }),
      ...(visibility !== undefined && { visibility }),
      ...(status !== undefined && { status }),
      ...(status === 'PUBLISHED' &&
        !existingPost.publishedAt && { publishedAt: new Date() }),
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
          isVerified: true,
          role: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
          price: true,
          images: {
            where: { isPrimary: true },
            take: 1,
            select: {
              imageUrl: true,
              altText: true,
            },
          },
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  if (shouldNotifyProductMention) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { sellerId: true }
      });

      if (product?.sellerId) {
        await notificationService.notifyProductMention(productId, product.sellerId, authorId, post.id);
      }
    } catch (error) {
      console.error('Failed to send product mention notification on update:', error);
    }
  }

  return post;
};

/**
 * Delete post
 */
export const deletePost = async (postId, authorId) => {
  // Check ownership
  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!existingPost) {
    throw new Error('Post not found');
  }

  if (existingPost.authorId !== authorId) {
    throw new Error('Unauthorized to delete this post');
  }

  await prisma.post.delete({
    where: { id: postId },
  });

  return { message: 'Post deleted successfully' };
};

/**
 * Like/Unlike post
 */
export const toggleLike = async (postId, userId) => {
  // Get post to check author
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) {
    throw new Error('Post not found');
  }

  const existingLike = await prisma.postLike.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  });

  if (existingLike) {
    // Unlike
    await prisma.$transaction([
      prisma.postLike.delete({
        where: {
          id: existingLike.id,
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      }),
    ]);

    return { liked: false, message: 'Post unliked' };
  } else {
    // Like
    await prisma.$transaction([
      prisma.postLike.create({
        data: {
          postId,
          userId,
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: {
          likesCount: {
            increment: 1,
          },
        },
      }),
    ]);

    // Send notification if not liking own post
    if (userId !== post.authorId) {
      try {
        await notificationService.notifyPostLike(postId, post.authorId, userId);
      } catch (error) {
        console.error('Failed to send like notification:', error);
      }
    }

    return { liked: true, message: 'Post liked' };
  }
};

/**
 * Add comment to post
 */
export const addComment = async (postId, userId, content, parentId = null) => {
  // Get post to check author
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) {
    throw new Error('Post not found');
  }

  const comment = await prisma.$transaction(async (tx) => {
    const newComment = await tx.postComment.create({
      data: {
        postId,
        userId,
        content,
        parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
      },
    });

    // Increment comments count
    await tx.post.update({
      where: { id: postId },
      data: {
        commentsCount: {
          increment: 1,
        },
      },
    });

    return newComment;
  });

  // Send notification if not commenting on own post
  if (userId !== post.authorId) {
    try {
      await notificationService.notifyPostComment(postId, post.authorId, userId, content);
    } catch (error) {
      console.error('Failed to send comment notification:', error);
    }
  }

  return comment;
};

/**
 * Get comments for a post
 */
export const getComments = async (postId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    prisma.postComment.findMany({
      where: {
        postId,
        parentId: null, // Top-level comments only
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        replies: {
          take: 3, // Show first 3 replies
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
                isVerified: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    }),
    prisma.postComment.count({
      where: {
        postId,
        parentId: null,
      },
    }),
  ]);

  return {
    comments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get user's posts
 */
export const getUserPosts = async (userId, filters = {}) => {
  const { page = 1, limit = 20, status = 'PUBLISHED' } = filters;

  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: {
        authorId: userId,
        status,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isVerified: true,
            role: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: {
              where: { isPrimary: true },
              take: 1,
              select: {
                imageUrl: true,
                altText: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    }),
    prisma.post.count({
      where: {
        authorId: userId,
        status,
      },
    }),
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
