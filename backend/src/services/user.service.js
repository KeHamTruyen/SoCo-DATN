import prisma from '../config/database.js';
import notificationService from './notification.service.js';

const USER_PROFILE_SELECT = {
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
  shopInformation: true,
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
      reviews: true,
      posts: true,
    },
  },
  products: {
    take: 12,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      images: {
        select: { imageUrl: true, isPrimary: true },
        orderBy: { isPrimary: 'desc' },
      },
    },
  },
};

class UserService {
  async getUserByUsername(username, viewerId = null) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: USER_PROFILE_SELECT,
    });
    if (!user) throw new Error('User not found');

    if (viewerId) {
      user.isFollowing = await this.isFollowing(viewerId, user.id);
    }
    return user;
  }

  async getUserById(userId, viewerId = null) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: USER_PROFILE_SELECT,
    });
    if (!user) throw new Error('User not found');

    if (viewerId && viewerId !== userId) {
      user.isFollowing = await this.isFollowing(viewerId, userId);
    }
    return user;
  }

  async updateProfile(userId, data) {
    const { fullName, phone, bio, avatarUrl, coverImage, address, shopInformation } = data;

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
    if (shopInformation !== undefined) updateData.shopInformation = shopInformation;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true, email: true, username: true, fullName: true, phone: true,
        role: true, avatarUrl: true, coverImage: true, bio: true, address: true,
        shopInformation: true,
        isVerified: true, privacySettings: true, createdAt: true, updatedAt: true,
      },
    });
    return user;
  }

  // ─── Follow (UC2.5) ───────────────────────────────────

  async toggleFollow(followerId, followingId) {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    const targetUser = await prisma.user.findUnique({ where: { id: followingId } });
    if (!targetUser) throw new Error('User not found');

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
      return { followed: false };
    }

    await prisma.follow.create({ data: { followerId, followingId } });

    const follower = await prisma.user.findUnique({
      where: { id: followerId },
      select: { id: true, username: true, fullName: true },
    });
    notificationService.notifyFollow(followingId, follower).catch(() => {});

    return { followed: true };
  }

  async isFollowing(followerId, followingId) {
    const row = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return !!row;
  }

  async getFollowers(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          follower: {
            select: {
              id: true, username: true, fullName: true,
              avatarUrl: true, isVerified: true, bio: true,
            },
          },
        },
      }),
      prisma.follow.count({ where: { followingId: userId } }),
    ]);
    return {
      users: rows.map((r) => r.follower),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getFollowing(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          following: {
            select: {
              id: true, username: true, fullName: true,
              avatarUrl: true, isVerified: true, bio: true,
            },
          },
        },
      }),
      prisma.follow.count({ where: { followerId: userId } }),
    ]);
    return {
      users: rows.map((r) => r.following),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getSuggestedUsers(userId, limit = 10) {
    const followingIds = (
      await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      })
    ).map((f) => f.followingId);

    return prisma.user.findMany({
      where: {
        id: { notIn: [...followingIds, userId] },
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true, username: true, fullName: true,
        avatarUrl: true, isVerified: true, bio: true,
        _count: { select: { followers: true } },
      },
    });
  }

  async searchUsers(query, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const where = {
      isActive: true,
      OR: [
        { username: { contains: query, mode: 'insensitive' } },
        { fullName: { contains: query, mode: 'insensitive' } },
      ],
    };
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true, username: true, fullName: true,
          avatarUrl: true, isVerified: true, bio: true, role: true,
          _count: { select: { followers: true, posts: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    return {
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

export default new UserService();
