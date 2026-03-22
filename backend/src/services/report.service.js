import prisma from '../config/database.js';

const VALID_TARGET_TYPES = ['post', 'comment', 'user', 'product'];

class ReportService {
  async createReport(reporterId, data) {
    const { targetType, targetId, reason, description } = data;

    if (!VALID_TARGET_TYPES.includes(targetType)) {
      throw new Error('Invalid target type');
    }

    const recentReport = await prisma.report.findFirst({
      where: {
        reporterId,
        targetType,
        targetId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
    if (recentReport) {
      throw new Error('You have already reported this item recently');
    }

    return prisma.report.create({
      data: { reporterId, targetType, targetId, reason, description },
      include: {
        reporter: {
          select: { id: true, username: true, fullName: true, avatarUrl: true },
        },
      },
    });
  }

  async getMyReports(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const where = { reporterId: userId };

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.report.count({ where }),
    ]);

    return {
      reports,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

export default new ReportService();
