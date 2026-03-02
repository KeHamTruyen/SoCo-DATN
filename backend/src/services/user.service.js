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
        coverImage: true,
        bio: true,
        address: true,
        isVerified: true,
        privacySettings: true,
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
            name: true,
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
        coverImage: true,
        bio: true,
        address: true,
        isVerified: true,
        privacySettings: true,
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
            name: true,
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
    const { fullName, phone, bio, avatarUrl, coverImage, address } = data;

    if (data.username) {
      const existingUser = await prisma.user.findFirst({
        where: { username: data.username, NOT: { id: userId } },
      });
      if (existingUser) throw new Error('Username already taken');
    }

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (address !== undefined) updateData.address = address;
    if (data.username) updateData.username = data.username;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true, email: true, username: true, fullName: true, phone: true,
        role: true, avatarUrl: true, coverImage: true, bio: true, address: true,
        isVerified: true, privacySettings: true, createdAt: true, updatedAt: true,
      },
    });

    return user;
  }
}

export default new UserService();
