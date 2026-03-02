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

  async getReports({ page = 1, limit = 20, status, targetType } = {}) {
    const skip = (page - 1) * limit;
    const where = {
      ...(status && { status }),
      ...(targetType && { targetType }),
    };

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: { id: true, username: true, fullName: true, avatarUrl: true },
          },
          resolver: {
            select: { id: true, username: true, fullName: true },
          },
        },
      }),
      prisma.report.count({ where }),
    ]);

    return {
      reports,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getReportById(reportId) {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reporter: {
          select: { id: true, username: true, fullName: true, avatarUrl: true },
        },
        resolver: {
          select: { id: true, username: true, fullName: true },
        },
      },
    });
    if (!report) throw new Error('Report not found');
    return report;
  }

  async resolveReport(reportId, adminId, data) {
    const { resolution, status } = data;

    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new Error('Report not found');
    if (report.status !== 'pending') throw new Error('Report already resolved');

    return prisma.report.update({
      where: { id: reportId },
      data: {
        status: status || 'resolved',
        resolution,
        resolvedBy: adminId,
        resolvedAt: new Date(),
      },
      include: {
        reporter: {
          select: { id: true, username: true, fullName: true },
        },
        resolver: {
          select: { id: true, username: true, fullName: true },
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
