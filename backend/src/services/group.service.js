import prisma from '../config/database.js';

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .concat('-', Date.now().toString(36));
}

const MEMBER_USER_SELECT = {
  id: true,
  username: true,
  fullName: true,
  avatarUrl: true,
  isVerified: true,
};

class GroupService {
  async createGroup(userId, data) {
    const { name, description, privacy, coverImageUrl, avatarUrl, isApprovedPosts } = data;

    const group = await prisma.group.create({
      data: {
        name,
        slug: slugify(name),
        description,
        privacy: privacy || 'PUBLIC',
        coverImageUrl,
        avatarUrl,
        isApprovedPosts: isApprovedPosts || false,
        createdBy: userId,
        membersCount: 1,
        members: {
          create: { userId, role: 'ADMIN' },
        },
      },
      include: {
        creator: { select: MEMBER_USER_SELECT },
        _count: { select: { members: true } },
      },
    });

    return group;
  }

  async getGroups({ page = 1, limit = 20, search, privacy, userId } = {}) {
    const skip = (page - 1) * limit;

    const where = {
      ...(privacy && { privacy }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      privacy: { not: 'SECRET' },
    };

    if (privacy === 'SECRET' && userId) {
      where.OR = [
        { privacy: { not: 'SECRET' } },
        { members: { some: { userId } } },
      ];
      delete where.privacy;
    }

    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        skip,
        take: limit,
        orderBy: { membersCount: 'desc' },
        include: {
          creator: { select: MEMBER_USER_SELECT },
          _count: { select: { members: true } },
        },
      }),
      prisma.group.count({ where }),
    ]);

    return {
      groups,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getGroupById(groupId, userId = null) {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        creator: { select: MEMBER_USER_SELECT },
        members: {
          take: 10,
          orderBy: { joinedAt: 'asc' },
          include: { user: { select: MEMBER_USER_SELECT } },
        },
        _count: { select: { members: true } },
      },
    });

    if (!group) throw new Error('Group not found');

    if (group.privacy === 'SECRET') {
      if (!userId) throw new Error('Group not found');
      const isMember = group.members.some((m) => m.userId === userId);
      if (!isMember) throw new Error('Group not found');
    }

    if (userId) {
      const membership = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId } },
      });
      group.isMember = !!membership;
      group.memberRole = membership?.role || null;
    }

    return group;
  }

  async getGroupBySlug(slug, userId = null) {
    const group = await prisma.group.findUnique({
      where: { slug },
      include: {
        creator: { select: MEMBER_USER_SELECT },
        _count: { select: { members: true } },
      },
    });
    if (!group) throw new Error('Group not found');
    return this.getGroupById(group.id, userId);
  }

  async joinGroup(groupId, userId) {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new Error('Group not found');

    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (existing) throw new Error('Already a member');

    await prisma.$transaction([
      prisma.groupMember.create({ data: { groupId, userId, role: 'MEMBER' } }),
      prisma.group.update({
        where: { id: groupId },
        data: { membersCount: { increment: 1 } },
      }),
    ]);

    return { joined: true };
  }

  async leaveGroup(groupId, userId) {
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!membership) throw new Error('Not a member');
    if (membership.role === 'ADMIN') {
      const adminCount = await prisma.groupMember.count({
        where: { groupId, role: 'ADMIN' },
      });
      if (adminCount <= 1) throw new Error('Cannot leave: you are the only admin');
    }

    await prisma.$transaction([
      prisma.groupMember.delete({ where: { id: membership.id } }),
      prisma.group.update({
        where: { id: groupId },
        data: { membersCount: { decrement: 1 } },
      }),
    ]);

    return { left: true };
  }

  async getMembers(groupId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [members, total] = await Promise.all([
      prisma.groupMember.findMany({
        where: { groupId },
        skip,
        take: limit,
        orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
        include: { user: { select: MEMBER_USER_SELECT } },
      }),
      prisma.groupMember.count({ where: { groupId } }),
    ]);
    return {
      members,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateGroup(groupId, userId, data) {
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!membership || membership.role !== 'ADMIN') {
      throw new Error('Only admin can update group');
    }

    const { name, description, privacy, coverImageUrl, avatarUrl, isApprovedPosts } = data;
    const updateData = {};
    if (name !== undefined) { updateData.name = name; updateData.slug = slugify(name); }
    if (description !== undefined) updateData.description = description;
    if (privacy !== undefined) updateData.privacy = privacy;
    if (coverImageUrl !== undefined) updateData.coverImageUrl = coverImageUrl;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (isApprovedPosts !== undefined) updateData.isApprovedPosts = isApprovedPosts;

    return prisma.group.update({
      where: { id: groupId },
      data: updateData,
      include: { creator: { select: MEMBER_USER_SELECT }, _count: { select: { members: true } } },
    });
  }

  async deleteGroup(groupId, userId) {
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!membership || membership.role !== 'ADMIN') {
      throw new Error('Only admin can delete group');
    }
    await prisma.group.delete({ where: { id: groupId } });
    return { deleted: true };
  }

  async updateMemberRole(groupId, adminId, targetUserId, newRole) {
    const adminMembership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: adminId } },
    });
    if (!adminMembership || adminMembership.role !== 'ADMIN') {
      throw new Error('Only admin can change roles');
    }

    const targetMembership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: targetUserId } },
    });
    if (!targetMembership) throw new Error('User is not a member');

    return prisma.groupMember.update({
      where: { id: targetMembership.id },
      data: { role: newRole },
      include: { user: { select: MEMBER_USER_SELECT } },
    });
  }

  async removeMember(groupId, adminId, targetUserId) {
    const adminMembership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: adminId } },
    });
    if (!adminMembership || !['ADMIN', 'MODERATOR'].includes(adminMembership.role)) {
      throw new Error('Insufficient permissions');
    }

    const targetMembership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: targetUserId } },
    });
    if (!targetMembership) throw new Error('User is not a member');
    if (targetMembership.role === 'ADMIN') throw new Error('Cannot remove admin');

    await prisma.$transaction([
      prisma.groupMember.delete({ where: { id: targetMembership.id } }),
      prisma.group.update({
        where: { id: groupId },
        data: { membersCount: { decrement: 1 } },
      }),
    ]);

    return { removed: true };
  }

  async getMyGroups(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [memberships, total] = await Promise.all([
      prisma.groupMember.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { joinedAt: 'desc' },
        include: {
          group: {
            include: {
              creator: { select: MEMBER_USER_SELECT },
              _count: { select: { members: true } },
            },
          },
        },
      }),
      prisma.groupMember.count({ where: { userId } }),
    ]);
    return {
      groups: memberships.map((m) => ({ ...m.group, memberRole: m.role })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

export default new GroupService();
