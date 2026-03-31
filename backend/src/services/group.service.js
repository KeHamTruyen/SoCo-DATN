import prisma from '../config/database.js';
import crypto from 'crypto';

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

const GROUP_ROLE_CAPABILITIES = {
  ADMIN: ['MANAGE_GROUP', 'MANAGE_ROLES', 'MANAGE_INVITES', 'REVIEW_REQUESTS', 'REMOVE_MEMBERS'],
  MODERATOR: ['REVIEW_REQUESTS', 'REMOVE_MEMBERS'],
  MEMBER: [],
};

function generateInviteCode() {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
}

class GroupService {
  async getGroupMembership(groupId, userId) {
    if (!userId) return null;
    return prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
  }

  async assertGroupVisibility(groupId, userId, { mustBeMember = false } = {}) {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new Error('Group not found');

    const membership = userId ? await this.getGroupMembership(groupId, userId) : null;
    const isMember = !!membership;

    if (group.privacy === 'SECRET' && !isMember) {
      throw new Error('Group not found');
    }

    if (mustBeMember && !isMember) {
      throw new Error('Must be a group member');
    }

    if (group.privacy === 'PRIVATE' && !isMember && mustBeMember) {
      throw new Error('Must be a group member');
    }

    return { group, membership };
  }

  assertCapability(membership, capability) {
    if (!membership) throw new Error('Must be a group member');
    const allowed = GROUP_ROLE_CAPABILITIES[membership.role] || [];
    if (!allowed.includes(capability)) throw new Error('Insufficient permissions');
  }

  async createGroup(userId, data) {
    const { name, description, privacy, coverImageUrl, avatarUrl, isApprovedPosts } = data;

    const group = await prisma.group.create({
      data: {
        name,
        slug: slugify(name),
        description,
        privacy: (privacy || 'PUBLIC').toUpperCase(),
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

    const membership = userId
      ? await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId, userId } } })
      : null;

    if (group.privacy === 'SECRET' && !membership) throw new Error('Group not found');

    group.isMember = !!membership;
    group.memberRole = membership?.role || null;

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
    const { group } = await this.assertGroupVisibility(groupId, userId);

    const existing = await this.getGroupMembership(groupId, userId);
    if (existing) throw new Error('Already a member');

    if (group.privacy === 'PRIVATE') {
      const existingRequest = await prisma.groupJoinRequest.findUnique({
        where: { groupId_userId: { groupId, userId } },
      });
      if (existingRequest?.status === 'PENDING') throw new Error('Join request already pending');
      if (existingRequest && existingRequest.status !== 'PENDING') {
        await prisma.groupJoinRequest.update({
          where: { id: existingRequest.id },
          data: { status: 'PENDING', reviewedBy: null, reviewedAt: null },
        });
      } else {
        await prisma.groupJoinRequest.create({
          data: { groupId, userId, status: 'PENDING' },
        });
      }
      return { joined: false, requested: true };
    }

    await prisma.$transaction(async (tx) => {
      await tx.groupMember.create({ data: { groupId, userId, role: 'MEMBER' } });
      await tx.group.update({
        where: { id: groupId },
        data: { membersCount: { increment: 1 } },
      });
    });

    return { joined: true, requested: false };
  }

  async leaveGroup(groupId, userId) {
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!membership) throw new Error('Not a member');
    await prisma.$transaction(async (tx) => {
      if (membership.role === 'ADMIN') {
        const adminCount = await tx.groupMember.count({
          where: { groupId, role: 'ADMIN' },
        });
        if (adminCount <= 1) throw new Error('Cannot leave: you are the only admin');
      }
      await tx.groupMember.delete({ where: { id: membership.id } });
      await tx.group.update({
        where: { id: groupId },
        data: { membersCount: { decrement: 1 } },
      });
    });

    return { left: true };
  }

  async getMembers(groupId, userId, { page = 1, limit = 20 } = {}) {
    const { group, membership } = await this.assertGroupVisibility(groupId, userId);
    if (['PRIVATE', 'SECRET'].includes(group.privacy) && !membership) throw new Error('Must be a group member');
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
    if (privacy !== undefined) updateData.privacy = privacy.toUpperCase();
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
    if (!adminMembership || adminMembership.role !== 'ADMIN') throw new Error('Only admin can change roles');

    const targetMembership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: targetUserId } },
    });
    if (!targetMembership) throw new Error('User is not a member');

    if (targetMembership.role === 'ADMIN' && newRole !== 'ADMIN') {
      const adminCount = await prisma.groupMember.count({ where: { groupId, role: 'ADMIN' } });
      if (adminCount <= 1) throw new Error('Cannot demote the only admin');
    }

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

    await prisma.$transaction(async (tx) => {
      await tx.groupMember.delete({ where: { id: targetMembership.id } });
      await tx.group.update({
        where: { id: groupId },
        data: { membersCount: { decrement: 1 } },
      });
    });

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

  async getGroupPosts(groupId, userId = null, { page = 1, limit = 20 } = {}) {
    const { group, membership } = await this.assertGroupVisibility(groupId, userId, { mustBeMember: false });
    if (['PRIVATE', 'SECRET'].includes(group.privacy) && !membership) throw new Error('Must be a group member');
    const skip = (page - 1) * limit;
    const include = {
      author: { select: MEMBER_USER_SELECT },
      product: {
        select: {
          id: true, title: true, price: true,
          images: { where: { isPrimary: true }, take: 1, select: { imageUrl: true, altText: true } },
        },
      },
      group: { select: { id: true, name: true, avatarUrl: true, coverImageUrl: true } },
      _count: { select: { likes: true, comments: true } },
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: {
          user: { select: { id: true, username: true, fullName: true, avatarUrl: true, isVerified: true } },
          _count: { select: { replies: true } },
        },
      },
    };

    if (userId) {
      include.likes = { where: { userId }, select: { id: true } };
    }

    const where = { groupId, status: 'PUBLISHED' };
    const [posts, total] = await Promise.all([
      prisma.post.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include }),
      prisma.post.count({ where }),
    ]);

    const result = userId
      ? posts.map((p) => { p.isLiked = p.likes?.length > 0; delete p.likes; return p; })
      : posts;

    return {
      posts: result,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async createGroupPost(groupId, userId, data) {
    await this.assertGroupVisibility(groupId, userId, { mustBeMember: true });

    // Delegate to post creation with groupId
    const { createPost } = await import('./post.service.js');
    const post = await createPost(userId, { ...data, groupId });
    await prisma.group.update({ where: { id: groupId }, data: { postsCount: { increment: 1 } } });
    return post;
  }

  async getGroupMedia(groupId, userId, { page = 1, limit = 24 } = {}) {
    const { group, membership } = await this.assertGroupVisibility(groupId, userId);
    if (['PRIVATE', 'SECRET'].includes(group.privacy) && !membership) throw new Error('Must be a group member');
    const skip = (page - 1) * limit;
    const where = {
      groupId,
      status: 'PUBLISHED',
      mediaUrls: { isEmpty: false },
    };
    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          mediaUrls: true,
          mediaType: true,
          createdAt: true,
          author: { select: MEMBER_USER_SELECT },
        },
      }),
      prisma.post.count({ where }),
    ]);
    return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getGroupProducts(groupId, userId, { page = 1, limit = 20 } = {}) {
    const { group, membership } = await this.assertGroupVisibility(groupId, userId);
    if (['PRIVATE', 'SECRET'].includes(group.privacy) && !membership) throw new Error('Must be a group member');
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where: { posts: { some: { groupId, status: 'PUBLISHED' } } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { where: { isPrimary: true }, take: 1, select: { imageUrl: true, altText: true } },
          seller: { select: MEMBER_USER_SELECT },
          _count: { select: { posts: true } },
        },
      }),
      prisma.product.count({ where: { posts: { some: { groupId, status: 'PUBLISHED' } } } }),
    ]);
    return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async listJoinRequests(groupId, userId, { page = 1, limit = 20 } = {}) {
    const membership = await this.getGroupMembership(groupId, userId);
    this.assertCapability(membership, 'REVIEW_REQUESTS');
    const skip = (page - 1) * limit;
    const where = { groupId, status: 'PENDING' };
    const [requests, total] = await Promise.all([
      prisma.groupJoinRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: { user: { select: MEMBER_USER_SELECT } },
      }),
      prisma.groupJoinRequest.count({ where }),
    ]);
    return { requests, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async reviewJoinRequest(groupId, requestId, reviewerId, action) {
    const reviewerMembership = await this.getGroupMembership(groupId, reviewerId);
    this.assertCapability(reviewerMembership, 'REVIEW_REQUESTS');
    const request = await prisma.groupJoinRequest.findFirst({
      where: { id: requestId, groupId },
    });
    if (!request) throw new Error('Join request not found');
    if (request.status !== 'PENDING') throw new Error('Join request already reviewed');

    const nextStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
    return prisma.$transaction(async (tx) => {
      const reviewed = await tx.groupJoinRequest.update({
        where: { id: request.id },
        data: { status: nextStatus, reviewedBy: reviewerId, reviewedAt: new Date() },
        include: { user: { select: MEMBER_USER_SELECT } },
      });
      if (action === 'approve') {
        const existingMember = await tx.groupMember.findUnique({
          where: { groupId_userId: { groupId, userId: request.userId } },
        });
        if (!existingMember) {
          await tx.groupMember.create({
            data: { groupId, userId: request.userId, role: 'MEMBER' },
          });
          await tx.group.update({
            where: { id: groupId },
            data: { membersCount: { increment: 1 } },
          });
        }
      }
      return reviewed;
    });
  }

  async createInvite(groupId, userId, { expiresInHours = 72, maxUses = 1 } = {}) {
    const membership = await this.getGroupMembership(groupId, userId);
    this.assertCapability(membership, 'MANAGE_INVITES');
    const code = generateInviteCode();
    const expiresAt = new Date(Date.now() + Math.max(1, Number(expiresInHours)) * 3600000);
    return prisma.groupInvite.create({
      data: {
        groupId,
        code,
        createdBy: userId,
        expiresAt,
        maxUses: Math.max(1, Number(maxUses) || 1),
      },
    });
  }

  async listInvites(groupId, userId) {
    const membership = await this.getGroupMembership(groupId, userId);
    this.assertCapability(membership, 'MANAGE_INVITES');
    return prisma.groupInvite.findMany({
      where: { groupId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeInvite(groupId, inviteId, userId) {
    const membership = await this.getGroupMembership(groupId, userId);
    this.assertCapability(membership, 'MANAGE_INVITES');
    const result = await prisma.groupInvite.updateMany({
      where: { id: inviteId, groupId },
      data: { isActive: false },
    });
    if (!result.count) throw new Error('Invite not found');
    return { revoked: true };
  }

  async joinByInvite(code, userId) {
    const invite = await prisma.groupInvite.findUnique({
      where: { code },
      include: { group: true },
    });
    if (!invite || !invite.isActive) throw new Error('Invite not found');
    if (invite.expiresAt < new Date()) throw new Error('Invite expired');
    if (invite.usedCount >= invite.maxUses) throw new Error('Invite exhausted');

    const existing = await this.getGroupMembership(invite.groupId, userId);
    if (existing) throw new Error('Already a member');

    const shouldRequestApproval = invite.group.privacy === 'PRIVATE';

    await prisma.$transaction(async (tx) => {
      if (shouldRequestApproval) {
        await tx.groupJoinRequest.upsert({
          where: { groupId_userId: { groupId: invite.groupId, userId } },
          update: { status: 'PENDING', reviewedBy: null, reviewedAt: null },
          create: { groupId: invite.groupId, userId, status: 'PENDING' },
        });
      } else {
        await tx.groupMember.create({
          data: { groupId: invite.groupId, userId, role: 'MEMBER' },
        });
        await tx.group.update({
          where: { id: invite.groupId },
          data: { membersCount: { increment: 1 } },
        });
        await tx.groupJoinRequest.deleteMany({
          where: { groupId: invite.groupId, userId, status: 'PENDING' },
        });
      }
      await tx.groupInvite.update({
        where: { id: invite.id },
        data: {
          usedCount: { increment: 1 },
          usedBy: userId,
          isActive: invite.usedCount + 1 < invite.maxUses,
        },
      });
    });

    return {
      joined: !shouldRequestApproval,
      requested: shouldRequestApproval,
      groupId: invite.groupId,
    };
  }
}

export default new GroupService();

