import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import {
  signedAuthenticatedImageUrl,
  uploadSellerRegistrationBuffers,
  deleteImage,
  deleteAuthenticatedImage,
  getPublicIdFromUrl,
} from '../config/cloudinary.js';
import emailService from './email.service.js';
import notificationService from './notification.service.js';
import { decryptSensitive, encryptSensitive, maskAccountOrId } from '../utils/sensitiveCrypto.js';

class SellerService {
  /**
   * UC1.8 – Start or resume seller application.
   * Returns existing application or creates a new one.
   */
  async getOrCreateApplication(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    if (user.role === 'SELLER') {
      throw Object.assign(new Error('You are already a seller'), {
        statusCode: 409,
        code: 'USER_ALREADY_SELLER',
      });
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
        idCardNumber: encryptSensitive(data.idCardNumber),
        idCardFrontUrl: data.idCardFrontUrl || null,
        idCardBackUrl: data.idCardBackUrl || null,
        idCardFrontPublicId: data.idCardFrontPublicId || null,
        idCardBackPublicId: data.idCardBackPublicId || null,
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

    const bankCipher = encryptSensitive(data.bankAccountNumber);

    const updated = await prisma.sellerVerification.update({
      where: { userId },
      data: {
        bankName: data.bankName,
        bankAccountNumber: bankCipher,
        bankAccountName: data.bankAccountName || null,
        bankBranch: data.bankBranch || null,
        step3Completed: true,
        status: 'REVIEWING',
      },
    });

    const shopInformation = this._normalizeShopSnapshot(data.registrationMeta);
    if (shopInformation) {
      await prisma.user.update({
        where: { id: userId },
        data: { shopInformation },
      });
    }

    return updated;
  }

  _validateCompleteRegistrationPayload(p) {
    if (!p || typeof p !== 'object') {
      throw Object.assign(new Error('Invalid registration payload'), { statusCode: 400 });
    }
    const idNum = typeof p.idNumber === 'string' ? p.idNumber.trim() : '';
    if (!idNum) {
      throw Object.assign(new Error('ID number is required'), { statusCode: 400 });
    }
    const shopName = typeof p.shopName === 'string' ? p.shopName.trim() : '';
    if (!shopName) {
      throw Object.assign(new Error('Shop name is required'), { statusCode: 400 });
    }
    if (!p.bankName || !String(p.bankName).trim()) {
      throw Object.assign(new Error('Bank name is required'), { statusCode: 400 });
    }
    const acc = typeof p.accountNumber === 'string' ? p.accountNumber.trim() : '';
    if (!acc) {
      throw Object.assign(new Error('Bank account number is required'), { statusCode: 400 });
    }
    if (!p.accountHolderName || !String(p.accountHolderName).trim()) {
      throw Object.assign(new Error('Account holder name is required'), { statusCode: 400 });
    }
  }

  /**
   * Validate payload → upload images to Cloudinary → persist steps 1–3 in one transaction.
   * Upload runs only after validation; if the DB transaction fails, uploaded assets are deleted.
   */
  async completeRegistrationWithUploads(userId, multerFiles, payload) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    if (user.role === 'SELLER') {
      throw Object.assign(new Error('You are already a seller'), {
        statusCode: 409,
        code: 'USER_ALREADY_SELLER',
      });
    }

    await this.getOrCreateApplication(userId);
    const verification = await this._getVerification(userId);
    this._ensureEditable(verification);

    this._validateCompleteRegistrationPayload(payload);

    const applyBrand = payload.applyShopBrandingToProfile !== false;

    const files = {
      idFront: multerFiles.idFront?.[0],
      idBack: multerFiles.idBack?.[0],
    };
    if (applyBrand) {
      if (multerFiles.shopLogo?.[0]) files.shopLogo = multerFiles.shopLogo[0];
      if (multerFiles.shopCover?.[0]) files.shopCover = multerFiles.shopCover[0];
    }
    if (!files.idFront || !files.idBack) {
      throw Object.assign(new Error('ID front and back images are required'), { statusCode: 400 });
    }

    const assets = await uploadSellerRegistrationBuffers({
      shopLogo: files.shopLogo,
      shopCover: files.shopCover,
      idFront: files.idFront,
      idBack: files.idBack,
    });

    const registrationMeta = {
      idType: payload.idType,
      shopName: payload.shopName,
      shopCategory: payload.shopCategory,
      shopDescription: payload.shopDescription,
      shopAddress: payload.shopAddress,
      contactPhone: payload.contactPhone,
    };
    const snapshot = this._normalizeShopSnapshot(registrationMeta);
    const shopInformation = snapshot ? { ...snapshot } : {};
    const hasShopInformation = Object.keys(shopInformation).length > 0;
    const bankCipher = encryptSensitive(payload.accountNumber);

    try {
      const updated = await prisma.$transaction(async (tx) => {
        const v = await tx.sellerVerification.update({
          where: { userId },
          data: {
            idCardNumber: encryptSensitive(payload.idNumber),
            idCardFrontUrl: assets.idFront.url,
            idCardBackUrl: assets.idBack.url,
            idCardFrontPublicId: assets.idFront.publicId,
            idCardBackPublicId: assets.idBack.publicId,
            shopLogoUrl: applyBrand && assets.shopLogo ? assets.shopLogo.url : null,
            shopCoverUrl: applyBrand && assets.shopCover ? assets.shopCover.url : null,
            shopLogoPublicId: applyBrand && assets.shopLogo ? assets.shopLogo.publicId : null,
            shopCoverPublicId: applyBrand && assets.shopCover ? assets.shopCover.publicId : null,
            dateOfBirth: null,
            address: typeof payload.shopAddress === 'string' ? payload.shopAddress.trim() || null : null,
            step1Completed: true,
            businessName: payload.shopName.trim(),
            businessType: (payload.shopCategory || '').toString().trim().slice(0, 50) || null,
            taxCode: (payload.contactPhone || '').toString().replace(/\s/g, '').slice(0, 50) || null,
            businessLicenseNumber: (payload.shopDescription || '').toString().trim().slice(0, 50) || null,
            businessLicenseUrl: null,
            step2Completed: true,
            bankName: String(payload.bankName).trim(),
            bankAccountNumber: bankCipher,
            bankAccountName: String(payload.accountHolderName).trim() || null,
            bankBranch: null,
            step3Completed: true,
            status: 'REVIEWING',
          },
        });

        const userPatch = {};
        if (hasShopInformation) userPatch.shopInformation = shopInformation;
        if (Object.keys(userPatch).length) {
          await tx.user.update({ where: { id: userId }, data: userPatch });
        }
        return v;
      });
      return updated;
    } catch (err) {
      for (const key of ['shopLogo', 'shopCover']) {
        if (assets[key]?.publicId) {
          try {
            await deleteImage(assets[key].publicId);
          } catch {
            /* ignore */
          }
        }
      }
      for (const key of ['idFront', 'idBack']) {
        if (assets[key]?.publicId) {
          try {
            await deleteAuthenticatedImage(assets[key].publicId);
          } catch {
            /* ignore */
          }
        }
      }
      throw err;
    }
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

  /**
   * Withdraw a submitted application (REVIEWING only): remove SellerVerification and clear public shop JSON.
   */
  async withdrawReviewingApplication(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, avatarUrl: true, coverImage: true },
    });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    if (user.role === 'SELLER') {
      throw Object.assign(new Error('Seller accounts cannot withdraw registration'), {
        statusCode: 400,
        code: 'USER_ALREADY_SELLER',
      });
    }

    const v = await prisma.sellerVerification.findUnique({ where: { userId } });
    if (!v) {
      throw Object.assign(new Error('No seller application to withdraw'), { statusCode: 404 });
    }
    if (v.status !== 'REVIEWING') {
      throw Object.assign(new Error('Only applications under review can be withdrawn'), {
        statusCode: 400,
        code: 'SELLER_APPLICATION_WITHDRAW_INVALID_STATE',
      });
    }

    for (const pid of [v.shopLogoPublicId, v.shopCoverPublicId].filter(Boolean)) {
      try {
        await deleteImage(pid);
      } catch {
        /* best-effort */
      }
    }
    for (const pid of [v.idCardFrontPublicId, v.idCardBackPublicId].filter(Boolean)) {
      try {
        await deleteAuthenticatedImage(pid);
      } catch {
        /* best-effort */
      }
    }

    const userPatch = { shopInformation: null };
    if (user.avatarUrl?.includes('shop-logos')) {
      const pid = getPublicIdFromUrl(user.avatarUrl);
      if (pid) {
        try {
          await deleteImage(pid);
        } catch {
          /* best-effort */
        }
      }
      userPatch.avatarUrl = null;
    }
    if (user.coverImage?.includes('shop-covers')) {
      const pid = getPublicIdFromUrl(user.coverImage);
      if (pid) {
        try {
          await deleteImage(pid);
        } catch {
          /* best-effort */
        }
      }
      userPatch.coverImage = null;
    }

    await prisma.$transaction([
      prisma.sellerVerification.delete({ where: { userId } }),
      prisma.user.update({
        where: { id: userId },
        data: userPatch,
      }),
    ]);

    return { message: 'Application withdrawn. You can submit a new application.' };
  }

  // ─── Admin actions ──────────────────────────────────────────

  /**
   * Admin – List all pending seller applications
   */
  async listApplications({ page = 1, limit = 20, status }) {
    const skip = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;

    const [rows, total] = await Promise.all([
      prisma.sellerVerification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              fullName: true,
              avatarUrl: true,
              coverImage: true,
              phone: true,
              shopInformation: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.sellerVerification.count({ where }),
    ]);

    const applications = rows.map((v) => this._sanitizeVerificationForAdminList(v));

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

    const userData = {
      role: 'SELLER',
      isVerified: true,
      ...(verification.shopLogoUrl ? { avatarUrl: verification.shopLogoUrl } : {}),
      ...(verification.shopCoverUrl ? { coverImage: verification.shopCoverUrl } : {}),
    };

    await prisma.$transaction([
      prisma.sellerVerification.update({
        where: { id: applicationId },
        data: { status: 'APPROVED', verifiedAt: new Date(), verifiedBy: adminId },
      }),
      prisma.user.update({
        where: { id: verification.userId },
        data: userData,
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
    const verification = await prisma.sellerVerification.findUnique({
      where: { id: applicationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
            coverImage: true,
          },
        },
      },
    });
    if (!verification) throw new Error('Application not found');
    if (verification.status !== 'REVIEWING') {
      throw Object.assign(new Error('Application is not in reviewing state'), { statusCode: 400 });
    }

    const v = verification;
    const tryDelAuth = (pid) => (pid ? deleteAuthenticatedImage(pid).catch(() => {}) : Promise.resolve());
    const tryDel = (pid) => (pid ? deleteImage(pid).catch(() => {}) : Promise.resolve());

    await Promise.all([
      tryDelAuth(v.idCardFrontPublicId),
      tryDelAuth(v.idCardBackPublicId),
      tryDel(v.shopLogoPublicId),
      tryDel(v.shopCoverPublicId),
    ]);

    if (!v.shopLogoPublicId && v.user?.avatarUrl?.includes('shop-logos')) {
      const pid = getPublicIdFromUrl(v.user.avatarUrl);
      if (pid) await tryDel(pid);
    }
    if (!v.shopCoverPublicId && v.user?.coverImage?.includes('shop-covers')) {
      const pid = getPublicIdFromUrl(v.user.coverImage);
      if (pid) await tryDel(pid);
    }

    const userPatch = {};
    const u = v.user;
    if (u?.avatarUrl) {
      if (
        (v.shopLogoUrl && u.avatarUrl === v.shopLogoUrl) ||
        (v.shopLogoPublicId && getPublicIdFromUrl(u.avatarUrl) === v.shopLogoPublicId) ||
        (!v.shopLogoUrl && u.avatarUrl.includes('social-commerce/shop-logos'))
      ) {
        userPatch.avatarUrl = null;
      }
    }
    if (u?.coverImage) {
      if (
        (v.shopCoverUrl && u.coverImage === v.shopCoverUrl) ||
        (v.shopCoverPublicId && getPublicIdFromUrl(u.coverImage) === v.shopCoverPublicId) ||
        (!v.shopCoverUrl && u.coverImage.includes('social-commerce/shop-covers'))
      ) {
        userPatch.coverImage = null;
      }
    }

    const ops = [
      prisma.sellerVerification.update({
        where: { id: applicationId },
        data: {
          status: 'REJECTED',
          rejectionReason: reason || 'Application did not meet requirements',
          verifiedBy: adminId,
          idCardFrontUrl: null,
          idCardBackUrl: null,
          idCardFrontPublicId: null,
          idCardBackPublicId: null,
          shopLogoUrl: null,
          shopCoverUrl: null,
          shopLogoPublicId: null,
          shopCoverPublicId: null,
        },
      }),
    ];
    if (Object.keys(userPatch).length) {
      ops.push(prisma.user.update({ where: { id: v.userId }, data: userPatch }));
    }
    await prisma.$transaction(ops);

    const resolvedReason = reason || 'Application did not meet requirements';
    if (v.user?.email) {
      try {
        await emailService.sendSellerRejectionEmail(v.user.email, {
          shopName: v.businessName || v.user.fullName || v.user.email,
          reason: resolvedReason,
        });
      } catch {
        /* non-blocking */
      }
    }

    return { message: 'Application rejected' };
  }

  /**
   * Live dashboard stats for seller center (from orders, views).
   */
  async getDashboardStats(sellerId) {
    const now = new Date();
    const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const activeOrderStatuses = { notIn: ['CANCELLED', 'REFUNDED'] };

    const [
      thisMonthSum,
      prevMonthSum,
      pendingOrders,
      newOrders,
      productViews,
      productViewsToday,
    ] = await Promise.all([
      prisma.orderItem.aggregate({
        where: {
          sellerId,
          order: {
            createdAt: { gte: startThisMonth },
            status: activeOrderStatuses,
          },
        },
        _sum: { totalPrice: true },
      }),
      prisma.orderItem.aggregate({
        where: {
          sellerId,
          order: {
            createdAt: { gte: startPrevMonth, lte: endPrevMonth },
            status: activeOrderStatuses,
          },
        },
        _sum: { totalPrice: true },
      }),
      prisma.order.count({
        where: {
          status: 'PENDING',
          items: { some: { sellerId } },
        },
      }),
      prisma.order.count({
        where: {
          items: { some: { sellerId } },
          createdAt: { gte: startThisMonth },
          status: activeOrderStatuses,
        },
      }),
      prisma.productView.count({
        where: { product: { sellerId } },
      }),
      prisma.productView.count({
        where: {
          product: { sellerId },
          createdAt: { gte: startToday },
        },
      }),
    ]);

    const monthlyThis = Number(thisMonthSum._sum.totalPrice ?? 0);
    const monthlyPrev = Number(prevMonthSum._sum.totalPrice ?? 0);
    let monthlySalesGrowth = 0;
    if (monthlyPrev > 0) {
      monthlySalesGrowth = Math.round(((monthlyThis - monthlyPrev) / monthlyPrev) * 1000) / 10;
    } else if (monthlyThis > 0) {
      monthlySalesGrowth = 100;
    }

    return {
      monthlySales: monthlyThis,
      monthlySalesGrowth,
      newOrders,
      pendingOrders,
      productViews,
      productViewsToday,
    };
  }

  /**
   * Public shop JSON on User (no avatar/cover, no plaintext CCCD/STK).
   * Built from step3 `registrationMeta` so the snapshot matches the wizard (FE sends full shop fields).
   */
  _normalizeShopSnapshot(meta) {
    if (!meta || typeof meta !== 'object') return null;
    const t = (v) => (typeof v === 'string' ? v.trim() : v);
    const clip = (s, max) => {
      const x = t(s);
      if (x == null || x === '') return null;
      return x.length > max ? x.slice(0, max) : x;
    };
    const o = {
      shopName: clip(meta.shopName, 255),
      shopCategory: clip(meta.shopCategory, 100),
      shopDescription: clip(meta.shopDescription, 5000),
      shopAddress: clip(meta.shopAddress, 500),
      contactPhone: clip(meta.contactPhone, 40),
      idType: clip(meta.idType, 50),
    };
    if (!Object.values(o).some(Boolean)) return null;
    return o;
  }

  _sanitizeVerificationForAdminList(v) {
    const idDec = decryptSensitive(v.idCardNumber);
    const bankDec = decryptSensitive(v.bankAccountNumber);
    return {
      ...v,
      idCardNumber: maskAccountOrId(idDec),
      bankAccountNumber: maskAccountOrId(bankDec),
      idCardFrontSignedUrl: signedAuthenticatedImageUrl(v.idCardFrontPublicId) || v.idCardFrontUrl,
      idCardBackSignedUrl: signedAuthenticatedImageUrl(v.idCardBackPublicId) || v.idCardBackUrl,
    };
  }

  async verifySensitiveReauth(userId, password) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    const ok = await bcrypt.compare(password || '', user.passwordHash);
    if (!ok) {
      throw Object.assign(new Error('Invalid password'), { statusCode: 401 });
    }
    return { verified: true };
  }

  async getMaskedSensitiveSummary(userId, password) {
    await this.verifySensitiveReauth(userId, password);
    const v = await prisma.sellerVerification.findUnique({ where: { userId } });
    if (!v) {
      throw Object.assign(new Error('No seller verification on file'), { statusCode: 404 });
    }
    const idDec = decryptSensitive(v.idCardNumber);
    const bankDec = decryptSensitive(v.bankAccountNumber);
    return {
      idCardNumberMasked: maskAccountOrId(idDec),
      bankAccountNumberMasked: maskAccountOrId(bankDec),
      bankName: v.bankName,
      bankAccountName: v.bankAccountName,
    };
  }

  async submitSensitiveChangeRequest(userId, body) {
    await this.verifySensitiveReauth(userId, body.currentPassword);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.role !== 'SELLER') {
      throw Object.assign(new Error('Only approved sellers can submit sensitive changes'), {
        statusCode: 403,
      });
    }
    const v = await prisma.sellerVerification.findUnique({ where: { userId } });
    if (!v || v.status !== 'APPROVED') {
      throw Object.assign(new Error('Seller verification must be approved'), { statusCode: 400 });
    }
    const pending = await prisma.sellerSensitiveChangeRequest.findFirst({
      where: { userId, status: 'PENDING' },
    });
    if (pending) {
      throw Object.assign(new Error('You already have a pending sensitive change request'), {
        statusCode: 400,
      });
    }
    const row = await prisma.sellerSensitiveChangeRequest.create({
      data: {
        userId,
        idCardNumberCipher:
          body.idCardNumber != null && String(body.idCardNumber).trim() !== ''
            ? encryptSensitive(body.idCardNumber)
            : null,
        bankAccountNumberCipher:
          body.bankAccountNumber != null && String(body.bankAccountNumber).trim() !== ''
            ? encryptSensitive(body.bankAccountNumber)
            : null,
        idCardFrontPublicId: body.idCardFrontPublicId || null,
        idCardBackPublicId: body.idCardBackPublicId || null,
        bankName: body.bankName || null,
        bankAccountName: body.bankAccountName || null,
      },
    });
    await this._appendAuditLog({
      actorUserId: userId,
      subjectUserId: userId,
      action: 'SENSITIVE_CHANGE_SUBMITTED',
      entityType: 'SellerSensitiveChangeRequest',
      entityId: row.id,
      meta: {
        hasId: Boolean(body.idCardNumber),
        hasBank: Boolean(body.bankAccountNumber),
      },
    });
    try {
      await notificationService.create({
        userId,
        type: 'SELLER_SENSITIVE',
        title: 'KYC update submitted',
        message: 'Your sensitive information change request is pending admin review.',
      });
    } catch {
      /* optional */
    }
    // Platform admins are not `users`; use admin dashboard / email instead of user notifications.
    return row;
  }

  async getMyPendingSensitiveChange(userId) {
    return prisma.sellerSensitiveChangeRequest.findFirst({
      where: { userId, status: 'PENDING' },
      select: { id: true, status: true, createdAt: true },
    });
  }

  async listSensitiveChangeRequestsAdmin({ page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      prisma.sellerSensitiveChangeRequest.findMany({
        where: { status: 'PENDING' },
        include: {
          user: { select: { id: true, email: true, username: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.sellerSensitiveChangeRequest.count({ where: { status: 'PENDING' } }),
    ]);
    const requests = rows.map((r) => {
      const { idCardNumberCipher, bankAccountNumberCipher, ...rest } = r;
      return {
        ...rest,
        idCardNumberMasked: maskAccountOrId(decryptSensitive(idCardNumberCipher)),
        bankAccountNumberMasked: maskAccountOrId(decryptSensitive(bankAccountNumberCipher)),
        idCardFrontSignedUrl: signedAuthenticatedImageUrl(r.idCardFrontPublicId),
        idCardBackSignedUrl: signedAuthenticatedImageUrl(r.idCardBackPublicId),
      };
    });
    return { requests, total, page, limit };
  }

  async approveSensitiveChangeRequest(requestId, adminId) {
    const reqRow = await prisma.sellerSensitiveChangeRequest.findUnique({
      where: { id: requestId },
    });
    if (!reqRow || reqRow.status !== 'PENDING') {
      throw Object.assign(new Error('Request not found or not pending'), { statusCode: 400 });
    }

    const vData = {};
    if (reqRow.idCardNumberCipher) vData.idCardNumber = reqRow.idCardNumberCipher;
    if (reqRow.bankAccountNumberCipher) vData.bankAccountNumber = reqRow.bankAccountNumberCipher;
    if (reqRow.idCardFrontPublicId) vData.idCardFrontPublicId = reqRow.idCardFrontPublicId;
    if (reqRow.idCardBackPublicId) vData.idCardBackPublicId = reqRow.idCardBackPublicId;
    if (reqRow.bankName) vData.bankName = reqRow.bankName;
    if (reqRow.bankAccountName) vData.bankAccountName = reqRow.bankAccountName;

    await prisma.$transaction([
      prisma.sellerVerification.update({
        where: { userId: reqRow.userId },
        data: vData,
      }),
      prisma.sellerSensitiveChangeRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED', reviewedBy: adminId, reviewedAt: new Date() },
      }),
    ]);

    await this._appendAuditLog({
      actorAdminId: adminId,
      subjectUserId: reqRow.userId,
      action: 'SENSITIVE_CHANGE_APPROVED',
      entityType: 'SellerSensitiveChangeRequest',
      entityId: requestId,
      meta: {},
    });

    try {
      await notificationService.create({
        userId: reqRow.userId,
        type: 'SELLER_SENSITIVE',
        title: 'KYC update approved',
        message: 'Your sensitive information change has been approved.',
      });
    } catch {
      /* optional */
    }
    return { message: 'Change request approved' };
  }

  async rejectSensitiveChangeRequest(requestId, adminId, reason) {
    const reqRow = await prisma.sellerSensitiveChangeRequest.findUnique({ where: { id: requestId } });
    if (!reqRow || reqRow.status !== 'PENDING') {
      throw Object.assign(new Error('Request not found or not pending'), { statusCode: 400 });
    }
    await prisma.sellerSensitiveChangeRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectionReason: reason || 'Rejected',
      },
    });
    await this._appendAuditLog({
      actorAdminId: adminId,
      subjectUserId: reqRow.userId,
      action: 'SENSITIVE_CHANGE_REJECTED',
      entityType: 'SellerSensitiveChangeRequest',
      entityId: requestId,
      meta: { reason: reason || null },
    });
    try {
      await notificationService.create({
        userId: reqRow.userId,
        type: 'SELLER_SENSITIVE',
        title: 'KYC update rejected',
        message: reason || 'Your change request was rejected.',
      });
    } catch {
      /* optional */
    }
    return { message: 'Change request rejected' };
  }

  async _appendAuditLog({ actorUserId, actorAdminId, subjectUserId, action, entityType, entityId, meta }) {
    if (!actorUserId && !actorAdminId) {
      throw new Error('Audit log requires actorUserId or actorAdminId');
    }
    await prisma.sellerSensitiveAuditLog.create({
      data: {
        actorUserId: actorUserId || null,
        actorAdminId: actorAdminId || null,
        subjectUserId: subjectUserId || null,
        action,
        entityType,
        entityId: entityId || null,
        meta: meta || {},
      },
    });
  }

  // ─── Helpers ────────────────────────────────────────────────

  async _getVerification(userId) {
    const v = await prisma.sellerVerification.findUnique({ where: { userId } });
    if (!v) throw Object.assign(new Error('Please start a seller application first'), { statusCode: 400 });
    return v;
  }

  _ensureEditable(verification) {
    if (verification.status === 'APPROVED') {
      throw Object.assign(new Error('Application already approved'), {
        statusCode: 409,
        code: 'SELLER_APPLICATION_ALREADY_APPROVED',
      });
    }
    if (verification.status === 'REVIEWING') {
      throw Object.assign(new Error('Application is under review and cannot be edited'), {
        statusCode: 409,
        code: 'SELLER_APPLICATION_LOCKED',
      });
    }
  }
}

export default new SellerService();
