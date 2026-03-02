import prisma from '../config/database.js';
import emailService from './email.service.js';

class SellerService {
  /**
   * UC1.8 – Start or resume seller application.
   * Returns existing application or creates a new one.
   */
  async getOrCreateApplication(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    if (user.role === 'SELLER') {
      throw Object.assign(new Error('You are already a seller'), { statusCode: 400 });
    }

    let verification = await prisma.sellerVerification.findUnique({ where: { userId } });

    if (!verification) {
      verification = await prisma.sellerVerification.create({
        data: { userId, status: 'PENDING' },
      });
    }

    return verification;
  }

  /**
   * Step 1 – Submit personal information (ID card, DOB, address)
   */
  async submitStep1(userId, data) {
    const verification = await this._getVerification(userId);
    this._ensureEditable(verification);

    return prisma.sellerVerification.update({
      where: { userId },
      data: {
        idCardNumber: data.idCardNumber,
        idCardFrontUrl: data.idCardFrontUrl || null,
        idCardBackUrl: data.idCardBackUrl || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        address: data.address || null,
        step1Completed: true,
      },
    });
  }

  /**
   * Step 2 – Submit business information
   */
  async submitStep2(userId, data) {
    const verification = await this._getVerification(userId);
    this._ensureEditable(verification);
    if (!verification.step1Completed) {
      throw Object.assign(new Error('Please complete Step 1 first'), { statusCode: 400 });
    }

    return prisma.sellerVerification.update({
      where: { userId },
      data: {
        businessName: data.businessName,
        businessType: data.businessType || null,
        businessLicenseNumber: data.businessLicenseNumber || null,
        businessLicenseUrl: data.businessLicenseUrl || null,
        taxCode: data.taxCode || null,
        step2Completed: true,
      },
    });
  }

  /**
   * Step 3 – Submit bank information & finalize application
   */
  async submitStep3(userId, data) {
    const verification = await this._getVerification(userId);
    this._ensureEditable(verification);
    if (!verification.step2Completed) {
      throw Object.assign(new Error('Please complete Step 2 first'), { statusCode: 400 });
    }

    const updated = await prisma.sellerVerification.update({
      where: { userId },
      data: {
        bankName: data.bankName,
        bankAccountNumber: data.bankAccountNumber,
        bankAccountName: data.bankAccountName || null,
        bankBranch: data.bankBranch || null,
        step3Completed: true,
        status: 'REVIEWING',
      },
    });

    return updated;
  }

  /**
   * Get application status
   */
  async getApplicationStatus(userId) {
    const verification = await prisma.sellerVerification.findUnique({ where: { userId } });
    if (!verification) return { status: 'not_started' };

    return {
      status: verification.status,
      step1Completed: verification.step1Completed,
      step2Completed: verification.step2Completed,
      step3Completed: verification.step3Completed,
      rejectionReason: verification.rejectionReason,
      verifiedAt: verification.verifiedAt,
      createdAt: verification.createdAt,
    };
  }

  // ─── Admin actions ──────────────────────────────────────────

  /**
   * Admin – List all pending seller applications
   */
  async listApplications({ page = 1, limit = 20, status }) {
    const skip = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;

    const [applications, total] = await Promise.all([
      prisma.sellerVerification.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, username: true, fullName: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.sellerVerification.count({ where }),
    ]);

    return { applications, total, page, limit };
  }

  /**
   * Admin – Approve a seller application
   */
  async approve(applicationId, adminId) {
    const verification = await prisma.sellerVerification.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });
    if (!verification) throw new Error('Application not found');
    if (verification.status !== 'REVIEWING') {
      throw Object.assign(new Error('Application is not in reviewing state'), { statusCode: 400 });
    }

    await prisma.$transaction([
      prisma.sellerVerification.update({
        where: { id: applicationId },
        data: { status: 'APPROVED', verifiedAt: new Date(), verifiedBy: adminId },
      }),
      prisma.user.update({
        where: { id: verification.userId },
        data: { role: 'SELLER', isVerified: true },
      }),
    ]);

    try {
      await emailService.sendSellerApprovalEmail(
        verification.user.email,
        verification.businessName || verification.user.fullName,
      );
    } catch { /* non-blocking */ }

    return { message: 'Application approved' };
  }

  /**
   * Admin – Reject a seller application
   */
  async reject(applicationId, adminId, reason) {
    const verification = await prisma.sellerVerification.findUnique({ where: { id: applicationId } });
    if (!verification) throw new Error('Application not found');
    if (verification.status !== 'REVIEWING') {
      throw Object.assign(new Error('Application is not in reviewing state'), { statusCode: 400 });
    }

    await prisma.sellerVerification.update({
      where: { id: applicationId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason || 'Application did not meet requirements',
        verifiedBy: adminId,
      },
    });

    return { message: 'Application rejected' };
  }

  // ─── Helpers ────────────────────────────────────────────────

  async _getVerification(userId) {
    const v = await prisma.sellerVerification.findUnique({ where: { userId } });
    if (!v) throw Object.assign(new Error('Please start a seller application first'), { statusCode: 400 });
    return v;
  }

  _ensureEditable(verification) {
    if (verification.status === 'APPROVED') {
      throw Object.assign(new Error('Application already approved'), { statusCode: 400 });
    }
    if (verification.status === 'REVIEWING') {
      throw Object.assign(new Error('Application is under review and cannot be edited'), { statusCode: 400 });
    }
  }
}

export default new SellerService();
