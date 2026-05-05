import prisma from '../config/database.js';
import notificationService from './notification.service.js';
import { Decimal } from '@prisma/client/runtime/library.js';

class VoucherService {
  /**
   * Create a new voucher (seller or admin)
   */
  async createVoucher(userId, data) {
    const {
      code,
      type,
      value,
      minOrderAmount = 0,
      maxDiscount,
      maxUses,
      maxUsesPerUser = 1,
      applicableCategories = [],
      applicableProductIds = [],
      applicableSellers = [],
      excludedUserIds = [],
      startsAt,
      expiresAt,
    } = data;

    // Verify user is seller or admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role === 'BUYER') {
      throw new Error('Only sellers and admins can create vouchers');
    }

    // Check if code already exists
    const existing = await prisma.voucher.findUnique({ where: { code } });
    if (existing) {
      throw new Error('Voucher code already exists');
    }

    // Validate percentage voucher
    if (type === 'PERCENTAGE' && value > 100) {
      throw new Error('Percentage voucher cannot exceed 100%');
    }

    const voucher = await prisma.voucher.create({
      data: {
        code,
        type,
        value: new Decimal(value),
        minOrderAmount: new Decimal(minOrderAmount),
        maxDiscount: maxDiscount ? new Decimal(maxDiscount) : null,
        maxUses,
        maxUsesPerUser,
        applicableCategories: applicableCategories.filter(Boolean),
        applicableProductIds: applicableProductIds.filter(Boolean),
        applicableSellers: applicableSellers.filter(Boolean),
        excludedUserIds: excludedUserIds.filter(Boolean),
        startsAt: new Date(startsAt),
        expiresAt: new Date(expiresAt),
        createdBy: userId,
      },
      include: this.voucherSelect(),
    });

    return voucher;
  }

  /**
   * Get voucher by code and validate
   */
  async getVoucherByCode(code) {
    const voucher = await prisma.voucher.findUnique({
      where: { code },
      include: this.voucherSelect(),
    });

    if (!voucher) {
      throw new Error('Voucher not found');
    }

    return voucher;
  }

  /**
   * Validate and apply voucher
   */
  async applyVoucher(userId, voucherCode, subtotal, cartDetails = {}) {
    const voucher = await this.getVoucherByCode(voucherCode);

    // Check status
    const now = new Date();
    if (voucher.status === 'INACTIVE') {
      throw new Error('Voucher is inactive');
    }
    if (voucher.status === 'EXPIRED' || voucher.expiresAt < now) {
      throw new Error('Voucher has expired');
    }
    if (voucher.startsAt > now) {
      throw new Error('Voucher is not active yet');
    }

    // Check minimum order amount
    if (new Decimal(subtotal).lt(new Decimal(voucher.minOrderAmount))) {
      throw new Error(
        `Minimum order amount is ${voucher.minOrderAmount}`,
      );
    }

    // Check usage limits
    if (voucher.maxUses && voucher.currentUses >= voucher.maxUses) {
      throw new Error('Voucher usage limit reached');
    }

    // Check user exclusion
    if (voucher.excludedUserIds.includes(userId)) {
      throw new Error('You are not eligible for this voucher');
    }

    // Check per-user usage limit
    const userUsageCount = await prisma.voucherUsage.count({
      where: {
        voucherId: voucher.id,
        userId,
      },
    });

    if (userUsageCount >= voucher.maxUsesPerUser) {
      throw new Error(
        `You can only use this voucher ${voucher.maxUsesPerUser} time(s)`,
      );
    }

    // Check category/product/seller applicability
    const { categoryIds = [], productIds = [], sellerId } = cartDetails;
    
    if (voucher.applicableCategories.length > 0) {
      const hasApplicableCategory = categoryIds.some((catId) =>
        voucher.applicableCategories.includes(catId),
      );
      if (!hasApplicableCategory && productIds.length === 0) {
        throw new Error('Voucher not applicable to items in your cart');
      }
    }

    if (voucher.applicableProductIds.length > 0) {
      const hasApplicableProduct = productIds.some((prodId) =>
        voucher.applicableProductIds.includes(prodId),
      );
      if (!hasApplicableProduct) {
        throw new Error('Voucher not applicable to items in your cart');
      }
    }

    if (voucher.applicableSellers.length > 0 && sellerId) {
      if (!voucher.applicableSellers.includes(sellerId)) {
        throw new Error('Voucher not applicable to this seller');
      }
    }

    // Calculate discount
    let discount = new Decimal(0);
    
    if (voucher.type === 'FIXED_AMOUNT') {
      discount = new Decimal(voucher.value);
    } else if (voucher.type === 'PERCENTAGE') {
      discount = new Decimal(subtotal).times(new Decimal(voucher.value)).div(100);
      if (voucher.maxDiscount) {
        discount = Decimal.min(discount, new Decimal(voucher.maxDiscount));
      }
    } else if (voucher.type === 'FREE_SHIPPING') {
      // Discount will be applied as shipping fee waiver
      discount = new Decimal(0); // Handled separately
    }

    return {
      voucherId: voucher.id,
      code: voucher.code,
      type: voucher.type,
      discount: Number(discount),
      isValid: true,
    };
  }

  /**
   * Record voucher usage
   */
  async recordVoucherUsage(voucherId, userId, orderId) {
    // Check if already recorded
    const existing = await prisma.voucherUsage.findUnique({
      where: {
        voucherId_userId_orderId: {
          voucherId,
          userId,
          orderId,
        },
      },
    });

    if (existing) {
      return existing;
    }

    // Create usage record and increment current uses
    const [usage] = await prisma.$transaction([
      prisma.voucherUsage.create({
        data: {
          voucherId,
          userId,
          orderId,
        },
      }),
      prisma.voucher.update({
        where: { id: voucherId },
        data: {
          currentUses: {
            increment: 1,
          },
        },
      }),
    ]);

    return usage;
  }

  /**
   * List vouchers (for user/seller/admin)
   */
  async listVouchers(filters = {}) {
    const { page = 1, limit = 20, status, type, sellerId, includeExpired = false } = filters;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(type && { type }),
      ...(sellerId && { createdBy: sellerId }),
      ...(!includeExpired && { expiresAt: { gt: new Date() } }),
    };

    const [vouchers, total] = await Promise.all([
      prisma.voucher.findMany({
        where,
        skip,
        take: limit,
        include: this.voucherSelect(),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.voucher.count({ where }),
    ]);

    return {
      vouchers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single voucher
   */
  async getVoucherById(voucherId) {
    const voucher = await prisma.voucher.findUnique({
      where: { id: voucherId },
      include: this.voucherSelect(),
    });

    if (!voucher) {
      throw new Error('Voucher not found');
    }

    return voucher;
  }

  /**
   * Update voucher
   */
  async updateVoucher(voucherId, userId, data) {
    const voucher = await this.getVoucherById(voucherId);

    // Check authorization
    if (voucher.createdBy !== userId) {
      throw new Error('Unauthorized to update this voucher');
    }

    const updated = await prisma.voucher.update({
      where: { id: voucherId },
      data: {
        ...(data.maxUses !== undefined && { maxUses: data.maxUses }),
        ...(data.status && { status: data.status }),
        ...(data.applicableCategories && {
          applicableCategories: data.applicableCategories.filter(Boolean),
        }),
        ...(data.applicableProductIds && {
          applicableProductIds: data.applicableProductIds.filter(Boolean),
        }),
        ...(data.applicableSellers && {
          applicableSellers: data.applicableSellers.filter(Boolean),
        }),
        ...(data.excludedUserIds && {
          excludedUserIds: data.excludedUserIds.filter(Boolean),
        }),
      },
      include: this.voucherSelect(),
    });

    return updated;
  }

  /**
   * Deactivate voucher
   */
  async deactivateVoucher(voucherId, userId) {
    const voucher = await this.getVoucherById(voucherId);

    if (voucher.createdBy !== userId) {
      throw new Error('Unauthorized');
    }

    const updated = await prisma.voucher.update({
      where: { id: voucherId },
      data: { status: 'INACTIVE' },
      include: this.voucherSelect(),
    });

    return updated;
  }

  /**
   * Get user's available vouchers
   */
  async getUserAvailableVouchers(userId, cartDetails = {}) {
    const now = new Date();

    const vouchers = await prisma.voucher.findMany({
      where: {
        status: 'ACTIVE',
        startsAt: { lte: now },
        expiresAt: { gt: now },
        excludedUserIds: {
          not: {
            has: userId,
          },
        },
      },
      include: this.voucherSelect(),
    });

    // Filter based on usage
    const available = [];
    for (const voucher of vouchers) {
      const userUsageCount = await prisma.voucherUsage.count({
        where: { voucherId: voucher.id, userId },
      });

      if (userUsageCount < voucher.maxUsesPerUser) {
        if (!voucher.maxUses || voucher.currentUses < voucher.maxUses) {
          available.push({
            ...voucher,
            usageCount: userUsageCount,
          });
        }
      }
    }

    return available;
  }

  voucherSelect() {
    return {
      creator: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
        },
      },
    };
  }
}

export default new VoucherService();
