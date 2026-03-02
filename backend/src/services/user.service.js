import prisma from '../config/database.js';

class UserService {
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

    return user;
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

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, data) {
    const { fullName, phone, bio, avatarUrl, role } = data;

    // Check if username is being updated and if it's already taken
    if (data.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: data.username,
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
      ...(data.username && { username: data.username }),
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
