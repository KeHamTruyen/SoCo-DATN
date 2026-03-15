import prisma from '../config/database.js';

const normalizeDateOnly = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid dateOfBirth');
  }

  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

const getOrCreateVerification = async (userId) => {
  const existing = await prisma.sellerVerification.findUnique({
    where: { userId }
  });

  if (existing) {
    return existing;
  }

  return prisma.sellerVerification.create({
    data: { userId }
  });
};

const ensureEditableStatus = (verification) => {
  if (verification.status === 'APPROVED') {
    throw new Error('Seller verification has already been approved');
  }
};

const resetToPendingWhenEditing = (verification) => {
  if (verification.status === 'REJECTED' || verification.status === 'REVIEWING') {
    return {
      status: 'PENDING',
      rejectionReason: null,
      verifiedAt: null,
      verifiedBy: null
    };
  }

  return {};
};

export const getStats = async (sellerId) => {
  const revenueData = await prisma.orderItem.aggregate({
    where: {
      sellerId,
      order: {
        status: 'COMPLETED'
      }
    },
    _sum: {
      totalPrice: true
    }
  });

  const ordersCount = await prisma.order.groupBy({
    by: ['status'],
    where: {
      items: {
        some: {
          sellerId
        }
      }
    },
    _count: {
      status: true
    }
  });

  const totalProducts = await prisma.product.count({
    where: {
      sellerId,
      status: {
        not: 'ARCHIVED'
      }
    }
  });

  const activeProducts = await prisma.product.count({
    where: {
      sellerId,
      status: 'ACTIVE'
    }
  });

  const ratingData = await prisma.review.aggregate({
    where: {
      product: {
        sellerId
      }
    },
    _avg: {
      rating: true
    },
    _count: {
      id: true
    }
  });

  const recentOrders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          sellerId
        }
      }
    },
    include: {
      buyer: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true
        }
      },
      items: {
        where: {
          sellerId
        },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  });

  const topProducts = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: {
      sellerId,
      order: {
        status: {
          in: ['COMPLETED', 'DELIVERED']
        }
      }
    },
    _sum: {
      quantity: true
    },
    _count: {
      productId: true
    },
    orderBy: {
      _sum: {
        quantity: 'desc'
      }
    },
    take: 5
  });

  const productIds = topProducts
    .map((item) => item.productId)
    .filter(Boolean);

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds
      }
    },
    select: {
      id: true,
      title: true,
      price: true,
      images: {
        orderBy: {
          displayOrder: 'asc'
        },
        select: {
          imageUrl: true
        }
      }
    }
  });

  const topProductsWithDetails = topProducts.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      product: product
        ? {
            id: product.id,
            name: product.title,
            price: Number(product.price),
            images: product.images.map((img) => img.imageUrl)
          }
        : null,
      totalSold: item._sum.quantity || 0,
      orderCount: item._count.productId
    };
  });

  const statusStats = {
    total: 0,
    pending: 0,
    processing: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0,
    refunded: 0
  };

  ordersCount.forEach((item) => {
    statusStats.total += item._count.status;
    const status = item.status.toLowerCase();
    if (status === 'pending' || status === 'confirmed') {
      statusStats.pending += item._count.status;
    } else if (status === 'processing') {
      statusStats.processing += item._count.status;
    } else if (status === 'shipping' || status === 'delivered') {
      statusStats.shipping += item._count.status;
    } else if (status === 'completed') {
      statusStats.completed += item._count.status;
    } else if (status === 'cancelled') {
      statusStats.cancelled += item._count.status;
    } else if (status === 'refunded') {
      statusStats.refunded += item._count.status;
    }
  });

  return {
    revenue: {
      total: Number(revenueData._sum.totalPrice || 0),
      currency: 'VND'
    },
    orders: statusStats,
    products: {
      total: totalProducts,
      active: activeProducts
    },
    rating: {
      average: ratingData._avg.rating || 0,
      count: ratingData._count.id || 0
    },
    recentOrders,
    topProducts: topProductsWithDetails
  };
};

export const getVerificationStatus = async (userId) => {
  const verification = await getOrCreateVerification(userId);

  return {
    ...verification,
    completion: {
      step1: verification.step1Completed,
      step2: verification.step2Completed,
      step3: verification.step3Completed,
      allStepsCompleted: verification.step1Completed && verification.step2Completed && verification.step3Completed
    }
  };
};

export const submitVerificationStep1 = async (userId, payload) => {
  const verification = await getOrCreateVerification(userId);
  ensureEditableStatus(verification);

  const data = {
    idCardNumber: payload.idCardNumber,
    idCardFrontUrl: payload.idCardFrontUrl,
    idCardBackUrl: payload.idCardBackUrl,
    dateOfBirth: normalizeDateOnly(payload.dateOfBirth),
    address: payload.address,
    step1Completed: true,
    ...resetToPendingWhenEditing(verification)
  };

  return prisma.sellerVerification.update({
    where: { userId },
    data
  });
};

export const submitVerificationStep2 = async (userId, payload) => {
  const verification = await getOrCreateVerification(userId);
  ensureEditableStatus(verification);

  const data = {
    businessName: payload.businessName,
    businessType: payload.businessType,
    businessLicenseNumber: payload.businessLicenseNumber || null,
    businessLicenseUrl: payload.businessLicenseUrl || null,
    taxCode: payload.taxCode || null,
    step2Completed: true,
    ...resetToPendingWhenEditing(verification)
  };

  return prisma.sellerVerification.update({
    where: { userId },
    data
  });
};

export const submitVerificationStep3 = async (userId, payload) => {
  const verification = await getOrCreateVerification(userId);
  ensureEditableStatus(verification);

  const data = {
    bankName: payload.bankName,
    bankAccountNumber: payload.bankAccountNumber,
    bankAccountName: payload.bankAccountName,
    bankBranch: payload.bankBranch || null,
    step3Completed: true,
    ...resetToPendingWhenEditing(verification)
  };

  return prisma.sellerVerification.update({
    where: { userId },
    data
  });
};

export const submitVerificationForReview = async (userId) => {
  const verification = await getOrCreateVerification(userId);

  if (verification.status === 'APPROVED') {
    throw new Error('Seller verification has already been approved');
  }

  if (!verification.step1Completed || !verification.step2Completed || !verification.step3Completed) {
    throw new Error('All verification steps must be completed before submission');
  }

  if (!verification.idCardNumber || !verification.idCardFrontUrl || !verification.idCardBackUrl || !verification.dateOfBirth || !verification.address) {
    throw new Error('Step 1 information is incomplete');
  }

  if (!verification.businessName || !verification.businessType) {
    throw new Error('Step 2 information is incomplete');
  }

  if (!verification.bankName || !verification.bankAccountNumber || !verification.bankAccountName) {
    throw new Error('Step 3 information is incomplete');
  }

  return prisma.sellerVerification.update({
    where: { userId },
    data: {
      status: 'REVIEWING',
      rejectionReason: null,
      verifiedAt: null,
      verifiedBy: null
    }
  });
};
