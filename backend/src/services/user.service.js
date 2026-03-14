import prisma from '../config/database.js';
import notificationService from './notification.service.js';

class UserService {
  async attachSellerRating(user) {
    if (!user?.id) return user;

    const ratingAgg = await prisma.review.aggregate({
      where: {
        isPublished: true,
        product: {
          sellerId: user.id
        }
      },
      _avg: {
        rating: true
      },
      _count: {
        id: true
      }
    });

    return {
      ...user,
      sellerRating: {
        average: Number(ratingAgg._avg.rating || 0),
        count: ratingAgg._count.id || 0
      }
    };
  }

  /**
   * Search users by keyword
   */
  async searchUsers({ q = '', role, limit = 20 } = {}) {
    const keyword = String(q || '').trim();
    const take = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);

    const where = {
      ...(role && { role }),
      ...(keyword && {
        OR: [
          { username: { contains: keyword, mode: 'insensitive' } },
          { fullName: { contains: keyword, mode: 'insensitive' } },
          { email: { contains: keyword, mode: 'insensitive' } },
          { bio: { contains: keyword, mode: 'insensitive' } }
        ]
      })
    };

    const users = await prisma.user.findMany({
      where,
      take,
      orderBy: [
        { isVerified: 'desc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        bio: true,
        role: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            products: true
          }
        }
      }
    });

    return users;
  }

  /**
   * Get user profile by username
   */
  async getUserByUsername(username) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        phone: true,
        role: true,
        avatarUrl: true,
        bio: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: true,
            orders: true,
            followers: true,
            following: true,
            reviews: true
          }
        },
        products: {
          take: 12,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            images: {
              select: {
                imageUrl: true,
                isPrimary: true
              },
              orderBy: {
                isPrimary: 'desc'
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return this.attachSellerRating(user);
  }

  /**
   * Get user profile by ID
   */
  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        phone: true,
        role: true,
        avatarUrl: true,
        bio: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: true,
            orders: true,
            followers: true,
            following: true,
            reviews: true
          }
        },
        products: {
          take: 12,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            images: {
              select: {
                imageUrl: true,
                isPrimary: true
              },
              orderBy: {
                isPrimary: 'desc'
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return this.attachSellerRating(user);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, data) {
    const { fullName, phone, bio, avatarUrl, role } = data;
    const normalizedUsername = data.username ? String(data.username).trim().toLowerCase() : undefined;

    // Check if username is being updated and if it's already taken
    if (normalizedUsername) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: normalizedUsername,
          NOT: {
            id: userId
          }
        }
      });

      if (existingUser) {
        throw new Error('Username already taken');
      }
    }

    // Build update data object
    const updateData = {
      ...(fullName && { fullName }),
      ...(phone !== undefined && { phone }),
      ...(bio !== undefined && { bio }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(normalizedUsername && { username: normalizedUsername }),
    };

    // Allow role update for becoming a seller
    // TODO: In production, this should require admin approval or separate endpoint
    if (role && (role === 'SELLER' || role === 'BUYER')) {
      updateData.role = role;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        phone: true,
        role: true,
        avatarUrl: true,
        bio: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return user;
  }

  /**
   * Follow a user
   */
  async followUser(followerId, followingId) {
    if (followerId === followingId) {
      throw new Error('You cannot follow yourself');
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
      select: { id: true, isActive: true }
    });

    if (!targetUser || !targetUser.isActive) {
      throw new Error('User not found');
    }

    const existed = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    if (existed) {
      throw new Error('Already following this user');
    }

    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId
      }
    });

    try {
      await notificationService.notifyNewFollower(followingId, followerId);
    } catch (error) {
      console.error('Failed to notify new follower:', error);
    }

    return follow;
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId, followingId) {
    const existed = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    if (!existed) {
      throw new Error('Follow relationship not found');
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    return { unfollowed: true, followingId };
  }

  /**
   * Get followers of a user
   */
  async getFollowers(userId, { page = 1, limit = 20 } = {}) {
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (safePage - 1) * safeLimit;

    const [rows, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              role: true,
              isVerified: true,
              bio: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit
      }),
      prisma.follow.count({
        where: { followingId: userId }
      })
    ]);

    return {
      data: rows.map((row) => ({
        ...row.follower,
        followedAt: row.createdAt
      })),
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit)
      }
    };
  }

  /**
   * Get following users of a user
   */
  async getFollowing(userId, { page = 1, limit = 20 } = {}) {
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (safePage - 1) * safeLimit;

    const [rows, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              role: true,
              isVerified: true,
              bio: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeLimit
      }),
      prisma.follow.count({
        where: { followerId: userId }
      })
    ]);

    return {
      data: rows.map((row) => ({
        ...row.following,
        followedAt: row.createdAt
      })),
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit)
      }
    };
  }
}

export default new UserService();
