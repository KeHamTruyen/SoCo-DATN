import prisma from '../config/database.js';

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
}

export default new UserService();
