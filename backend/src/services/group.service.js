import slugify from 'slugify';
import prisma from '../config/database.js';
import { ApiError } from '../middlewares/error.middleware.js';

class GroupService {
  async generateUniqueSlug(name) {
    const baseSlug = slugify(String(name || '').trim(), {
      lower: true,
      strict: true,
      locale: 'vi'
    }).slice(0, 90);

    if (!baseSlug) {
      throw new ApiError(400, 'Group name is required');
    }

    let slug = baseSlug;
    let suffix = 1;

    while (true) {
      const existing = await prisma.group.findUnique({ where: { slug } });
      if (!existing) return slug;
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }
  }

  async listGroups({ q = '', page = 1, limit = 20, userId, membership = 'all' } = {}) {
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);
    const skip = (safePage - 1) * safeLimit;
    const keyword = String(q || '').trim();

    const where = {
      ...(keyword && {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } }
        ]
      })
    };

    if (membership === 'joined' && userId) {
      where.members = {
        some: { userId }
      };
    }

    if (membership === 'discover' && userId) {
      where.members = {
        none: { userId }
      };
    }

    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: [{ membersCount: 'desc' }, { createdAt: 'desc' }],
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true
            }
          },
          ...(userId && {
            members: {
              where: { userId },
              select: { id: true, role: true },
              take: 1
            }
          }),
          _count: {
            select: { members: true }
          }
        }
      }),
      prisma.group.count({ where })
    ]);

    return {
      groups: groups.map((group) => ({
        ...group,
        isMember: userId ? (group.members || []).length > 0 : false,
        memberRole: userId && group.members?.[0] ? group.members[0].role : null,
        members: undefined
      })),
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.max(Math.ceil(total / safeLimit), 1)
      }
    };
  }

  async getGroupById(groupId, userId) {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true
          }
        },
        members: {
          take: 8,
          orderBy: { joinedAt: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true
              }
            }
          }
        },
        _count: {
          select: { members: true }
        }
      }
    });

    if (!group) {
      throw new ApiError(404, 'Group not found');
    }

    const myMembership = userId
      ? await prisma.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId,
              userId
            }
          },
          select: {
            id: true,
            role: true,
            joinedAt: true
          }
        })
      : null;

    return {
      ...group,
      isMember: !!myMembership,
      memberRole: myMembership?.role || null,
      myMembership
    };
  }

  async createGroup(userId, data) {
    const name = String(data.name || '').trim();
    const description = data.description ? String(data.description).trim() : null;
    const privacy = data.privacy || 'PUBLIC';

    if (!name) {
      throw new ApiError(400, 'Group name is required');
    }

    const slug = await this.generateUniqueSlug(name);

    const group = await prisma.$transaction(async (tx) => {
      const created = await tx.group.create({
        data: {
          name,
          slug,
          description,
          privacy,
          coverImageUrl: data.coverImageUrl || null,
          avatarUrl: data.avatarUrl || null,
          createdBy: userId,
          membersCount: 1
        }
      });

      await tx.groupMember.create({
        data: {
          groupId: created.id,
          userId,
          role: 'ADMIN'
        }
      });

      return created;
    });

    return this.getGroupById(group.id, userId);
  }

  async joinGroup(groupId, userId) {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true, privacy: true }
    });

    if (!group) {
      throw new ApiError(404, 'Group not found');
    }

    const existing = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId
        }
      }
    });

    if (existing) {
      return this.getGroupById(groupId, userId);
    }

    await prisma.$transaction([
      prisma.groupMember.create({
        data: {
          groupId,
          userId,
          role: 'MEMBER'
        }
      }),
      prisma.group.update({
        where: { id: groupId },
        data: {
          membersCount: { increment: 1 }
        }
      })
    ]);

    return this.getGroupById(groupId, userId);
  }

  async leaveGroup(groupId, userId) {
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId
        }
      }
    });

    if (!membership) {
      throw new ApiError(400, 'You are not a member of this group');
    }

    // Keep at least one admin in group.
    if (membership.role === 'ADMIN') {
      const adminCount = await prisma.groupMember.count({
        where: {
          groupId,
          role: 'ADMIN'
        }
      });

      if (adminCount <= 1) {
        throw new ApiError(400, 'Group must have at least one admin');
      }
    }

    await prisma.$transaction([
      prisma.groupMember.delete({
        where: {
          groupId_userId: {
            groupId,
            userId
          }
        }
      }),
      prisma.group.update({
        where: { id: groupId },
        data: {
          membersCount: { decrement: 1 }
        }
      })
    ]);

    return { groupId, left: true };
  }

  async getGroupMembers(groupId, { page = 1, limit = 20, q = '' } = {}) {
    const group = await prisma.group.findUnique({ where: { id: groupId }, select: { id: true } });
    if (!group) {
      throw new ApiError(404, 'Group not found');
    }

    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);
    const skip = (safePage - 1) * safeLimit;
    const keyword = String(q || '').trim();

    const where = {
      groupId,
      ...(keyword && {
        user: {
          OR: [
            { username: { contains: keyword, mode: 'insensitive' } },
            { fullName: { contains: keyword, mode: 'insensitive' } }
          ]
        }
      })
    };

    const [members, total] = await Promise.all([
      prisma.groupMember.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              isVerified: true
            }
          }
        }
      }),
      prisma.groupMember.count({ where })
    ]);

    return {
      members,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.max(Math.ceil(total / safeLimit), 1)
      }
    };
  }
}

export default new GroupService();
