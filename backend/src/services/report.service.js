import prisma from '../config/database.js';
import notificationService from './notification.service.js';

const MAX_LIMIT = 100;

const parsePagination = (filters = {}) => {
  const page = Math.max(parseInt(filters.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(filters.limit, 10) || 20, 1), MAX_LIMIT);
  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
};

const assertTargetExists = async (reporterId, targetType, targetId) => {
  if (targetType === 'POST') {
    const post = await prisma.post.findUnique({
      where: { id: targetId },
      select: { id: true, authorId: true }
    });

    if (!post) {
      throw new Error('Target not found');
    }

    if (post.authorId === reporterId) {
      throw new Error('You cannot report your own post');
    }

    return;
  }

  if (targetType === 'PRODUCT') {
    const product = await prisma.product.findUnique({
      where: { id: targetId },
      select: { id: true, sellerId: true }
    });

    if (!product) {
      throw new Error('Target not found');
    }

    if (product.sellerId === reporterId) {
      throw new Error('You cannot report your own product');
    }

    return;
  }

  if (targetType === 'USER') {
    const user = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true }
    });

    if (!user) {
      throw new Error('Target not found');
    }

    if (user.id === reporterId) {
      throw new Error('You cannot report yourself');
    }

    return;
  }

  if (targetType === 'SHOP') {
    const seller = await prisma.user.findFirst({
      where: {
        id: targetId,
        role: 'SELLER'
      },
      select: { id: true }
    });

    if (!seller) {
      throw new Error('Target not found');
    }

    if (seller.id === reporterId) {
      throw new Error('You cannot report your own shop');
    }
  }
};

export const createReport = async (reporterId, payload) => {
  const { targetType, targetId, reason, description } = payload;

  await assertTargetExists(reporterId, targetType, targetId);

  const existingActiveReport = await prisma.report.findFirst({
    where: {
      reporterId,
      targetType,
      targetId,
      status: {
        in: ['PENDING', 'IN_REVIEW']
      }
    },
    select: {
      id: true
    }
  });

  if (existingActiveReport) {
    throw new Error('You already have an active report for this target');
  }

  const report = await prisma.report.create({
    data: {
      reporterId,
      targetType,
      targetId,
      reason,
      description
    },
    include: {
      reporter: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true
        }
      }
    }
  });

  // Notify admins that a new report has been submitted.
  try {
    await notificationService.notifyAdminsNewReport(report.id, reporterId, targetType, reason);
  } catch (error) {
    console.error('Failed to notify admins for new report:', error);
  }

  return report;
};

export const getMyReports = async (reporterId, filters = {}) => {
  const { page, limit, skip } = parsePagination(filters);

  const where = {
    reporterId,
    ...(filters.status && { status: filters.status }),
    ...(filters.targetType && { targetType: filters.targetType })
  };

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    }),
    prisma.report.count({ where })
  ]);

  return {
    data: reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1)
    }
  };
};

export const getReportsForAdmin = async (filters = {}) => {
  const { page, limit, skip } = parsePagination(filters);
  const search = String(filters.q || '').trim();

  const where = {
    ...(filters.status && { status: filters.status }),
    ...(filters.targetType && { targetType: filters.targetType }),
    ...(filters.reason && { reason: filters.reason }),
    ...(search && {
      OR: [
        { description: { contains: search, mode: 'insensitive' } },
        { reporter: { username: { contains: search, mode: 'insensitive' } } },
        { reporter: { fullName: { contains: search, mode: 'insensitive' } } },
        { resolutionNote: { contains: search, mode: 'insensitive' } }
      ]
    })
  };

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            role: true
          }
        },
        resolver: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    }),
    prisma.report.count({ where })
  ]);

  return {
    data: reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1)
    }
  };
};

export const updateReportStatus = async (reportId, adminId, payload) => {
  const { status, resolutionNote } = payload;

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { id: true, reporterId: true, status: true }
  });

  if (!report) {
    throw new Error('Report not found');
  }

  const updatedReport = await prisma.report.update({
    where: { id: reportId },
    data: {
      status,
      resolutionNote,
      resolvedBy: adminId,
      resolvedAt: status === 'RESOLVED' || status === 'REJECTED' ? new Date() : null
    },
    include: {
      reporter: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true
        }
      },
      resolver: {
        select: {
          id: true,
          username: true,
          fullName: true
        }
      }
    }
  });

  // Notify reporter about moderation status update.
  if (report.status !== status) {
    try {
      await notificationService.notifyReportStatusUpdated(reportId, report.reporterId, status);
    } catch (error) {
      console.error('Failed to notify reporter for report status update:', error);
    }
  }

  return updatedReport;
};
