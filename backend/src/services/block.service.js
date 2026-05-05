import prisma from '../config/database.js';

export async function blockUser(requesterId, targetUserId) {
  if (requesterId === targetUserId) {
    throw new Error('Cannot block yourself');
  }

  // Create two records (A->B and B->A) so checks are simple
  await prisma.block.createMany({
    data: [
      { blockerId: requesterId, blockedId: targetUserId },
      { blockerId: targetUserId, blockedId: requesterId },
    ],
    skipDuplicates: true,
  });

  return { success: true };
}

export async function unblockUser(requesterId, targetUserId) {
  if (requesterId === targetUserId) {
    throw new Error('Cannot unblock yourself');
  }

  await prisma.block.deleteMany({
    where: {
      OR: [
        { blockerId: requesterId, blockedId: targetUserId },
        { blockerId: targetUserId, blockedId: requesterId },
      ],
    },
  });

  return { success: true };
}

export async function listBlockedUsers(userId) {
  const rows = await prisma.block.findMany({
    where: { blockerId: userId },
    include: { blocked: { select: { id: true, username: true, fullName: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return rows.map((r) => ({ id: r.blocked.id, username: r.blocked.username, fullName: r.blocked.fullName, avatarUrl: r.blocked.avatarUrl, blockedAt: r.createdAt }));
}

export async function listBlockedUserIds(userId) {
  const rows = await prisma.block.findMany({
    where: { blockerId: userId },
    select: { blockedId: true },
  });

  return rows.map((row) => row.blockedId);
}

export async function isBlockedBetween(userA, userB) {
  const found = await prisma.block.findFirst({ where: { blockerId: userA, blockedId: userB } });
  return !!found;
}
