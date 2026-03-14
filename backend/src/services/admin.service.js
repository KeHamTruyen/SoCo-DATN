import prisma from '../config/database.js';

const MAX_LIMIT = 100;

const toNumber = (value) => Number(value || 0);

const buildDateRange = (startDate, endDate) => {
  const range = {};

  if (startDate) {
    const date = new Date(startDate);
    if (!Number.isNaN(date.getTime())) {
      range.gte = date;
    }
  }

  if (endDate) {
    const date = new Date(endDate);
    if (!Number.isNaN(date.getTime())) {
      range.lte = date;
    }
  }

  return Object.keys(range).length > 0 ? range : undefined;
};

export const getDashboardOverview = async () => {
  const [
    totalUsers,
    totalSellers,
    totalProducts,
    totalOrders,
    totalPosts,
    pendingSellerVerifications,
    orderAgg,
    orderByStatus
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'SELLER' } }),
    prisma.product.count(),
    prisma.order.count(),
    prisma.post.count(),
    prisma.sellerVerification.count({ where: { status: 'PENDING' } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: 'PAID' }
    }),
    prisma.order.groupBy({
      by: ['status'],
      _count: { status: true }
    })
  ]);

  const statusBreakdown = orderByStatus.reduce((acc, item) => {
    acc[item.status] = item._count.status;
    return acc;
  }, {});

  return {
    totals: {
      users: totalUsers,
      sellers: totalSellers,
      products: totalProducts,
      orders: totalOrders,
      posts: totalPosts,
      paidRevenue: toNumber(orderAgg._sum.total),
      pendingSellerVerifications
    },
    orderStatusBreakdown: statusBreakdown
  };
};

export const getUsers = async (filters = {}) => {
  const page = Math.max(parseInt(filters.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(filters.limit, 10) || 20, 1), MAX_LIMIT);
  const skip = (page - 1) * limit;

  const search = String(filters.search || '').trim();
  const role = filters.role;
  const isActive = filters.isActive;

  const where = {
    ...(role && { role }),
    ...(isActive !== undefined && isActive !== '' && { isActive: isActive === 'true' }),
    ...(search && {
      OR: [
        { username: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    })
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        lastLogin: true,
        _count: {
          select: {
            products: true,
            posts: true,
            followers: true,
            following: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.user.count({ where })
  ]);

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1)
    }
  };
};

export const setUserActiveStatus = async (userId, isActive) => {
  const existed = await prisma.user.findUnique({ where: { id: userId } });
  if (!existed) {
    throw new Error('User not found');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: {
      id: true,
      username: true,
      fullName: true,
      role: true,
      isActive: true,
      updatedAt: true
    }
  });

  return user;
};

export const verifySeller = async (adminId, userId, action, rejectionReason = null) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  if (!['approve', 'reject'].includes(action)) {
    throw new Error('Invalid action');
  }

  if (action === 'approve') {
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          role: 'SELLER',
          isVerified: true
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
          isVerified: true
        }
      });

      await tx.sellerVerification.upsert({
        where: { userId },
        create: {
          userId,
          status: 'APPROVED',
          verifiedAt: new Date(),
          verifiedBy: adminId
        },
        update: {
          status: 'APPROVED',
          rejectionReason: null,
          verifiedAt: new Date(),
          verifiedBy: adminId
        }
      });

      return updatedUser;
    });

    return { action, user: result };
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        role: 'BUYER'
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        isVerified: true
      }
    });

    await tx.sellerVerification.upsert({
      where: { userId },
      create: {
        userId,
        status: 'REJECTED',
        rejectionReason: rejectionReason || 'Rejected by admin',
        verifiedBy: adminId
      },
      update: {
        status: 'REJECTED',
        rejectionReason: rejectionReason || 'Rejected by admin',
        verifiedAt: null,
        verifiedBy: adminId
      }
    });

    return updatedUser;
  });

  return { action, user: result };
};

export const getProductsForModeration = async (filters = {}) => {
  const page = Math.max(parseInt(filters.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(filters.limit, 10) || 20, 1), MAX_LIMIT);
  const skip = (page - 1) * limit;

  const search = String(filters.search || '').trim();
  const status = filters.status;

  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { seller: { username: { contains: search, mode: 'insensitive' } } },
        { seller: { fullName: { contains: search, mode: 'insensitive' } } }
      ]
    })
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isVerified: true
          }
        },
        images: {
          orderBy: { displayOrder: 'asc' },
          take: 1,
          select: { imageUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.product.count({ where })
  ]);

  return {
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1)
    }
  };
};

export const updateProductModerationStatus = async (productId, status) => {
  const existed = await prisma.product.findUnique({ where: { id: productId } });
  if (!existed) {
    throw new Error('Product not found');
  }

  const data = {
    status,
    ...(status === 'ACTIVE' ? { publishedAt: new Date() } : {})
  };

  const product = await prisma.product.update({
    where: { id: productId },
    data,
    include: {
      seller: {
        select: {
          id: true,
          username: true,
          fullName: true
        }
      }
    }
  });

  return product;
};

export const getOrdersForAdmin = async (filters = {}) => {
  const page = Math.max(parseInt(filters.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(filters.limit, 10) || 20, 1), MAX_LIMIT);
  const skip = (page - 1) * limit;

  const search = String(filters.search || '').trim();
  const status = filters.status;

  const where = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { buyer: { username: { contains: search, mode: 'insensitive' } } },
        { buyer: { fullName: { contains: search, mode: 'insensitive' } } }
      ]
    })
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
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
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true
              }
            },
            seller: {
              select: {
                id: true,
                username: true,
                fullName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.order.count({ where })
  ]);

  return {
    data: orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1)
    }
  };
};

export const updateOrderStatusByAdmin = async (orderId, status) => {
  const existed = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existed) {
    throw new Error('Order not found');
  }

  const updateData = {
    status,
    ...(status === 'CONFIRMED' ? { confirmedAt: new Date() } : {}),
    ...(status === 'SHIPPING' ? { shippedAt: new Date() } : {}),
    ...(status === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
    ...(status === 'CANCELLED' ? { cancelledAt: new Date() } : {})
  };

  const order = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      buyer: {
        select: {
          id: true,
          username: true,
          fullName: true
        }
      }
    }
  });

  return order;
};

export const getAnalyticsSummary = async (filters = {}) => {
  const createdAt = buildDateRange(filters.startDate, filters.endDate);

  const [users, products, orders, posts, orderAgg, paidOrders, topSellers] = await Promise.all([
    prisma.user.count({ where: createdAt ? { createdAt } : undefined }),
    prisma.product.count({ where: createdAt ? { createdAt } : undefined }),
    prisma.order.count({ where: createdAt ? { createdAt } : undefined }),
    prisma.post.count({ where: createdAt ? { createdAt } : undefined }),
    prisma.order.aggregate({
      _sum: { subtotal: true, shippingFee: true, total: true },
      where: {
        ...(createdAt && { createdAt }),
        paymentStatus: 'PAID'
      }
    }),
    prisma.order.count({
      where: {
        ...(createdAt && { createdAt }),
        paymentStatus: 'PAID'
      }
    }),
    prisma.orderItem.groupBy({
      by: ['sellerId'],
      _sum: { totalPrice: true },
      _count: { id: true },
      orderBy: {
        _sum: {
          totalPrice: 'desc'
        }
      },
      take: 5
    })
  ]);

  const sellerIds = topSellers.map((item) => item.sellerId);
  const sellerMap = sellerIds.length > 0
    ? await prisma.user.findMany({
      where: { id: { in: sellerIds } },
      select: { id: true, username: true, fullName: true }
    }).then((rows) => rows.reduce((acc, row) => {
      acc[row.id] = row;
      return acc;
    }, {}))
    : {};

  return {
    period: {
      startDate: filters.startDate || null,
      endDate: filters.endDate || null
    },
    totals: {
      users,
      products,
      orders,
      posts,
      paidOrders,
      revenue: {
        subtotal: toNumber(orderAgg._sum.subtotal),
        shippingFee: toNumber(orderAgg._sum.shippingFee),
        total: toNumber(orderAgg._sum.total)
      }
    },
    topSellers: topSellers.map((item) => ({
      seller: sellerMap[item.sellerId] || { id: item.sellerId, username: null, fullName: null },
      orders: item._count.id,
      sales: toNumber(item._sum.totalPrice)
    }))
  };
};
