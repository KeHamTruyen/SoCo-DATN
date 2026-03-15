import prisma from '../config/database.js';
import notificationService from './notification.service.js';

const MAX_LIMIT = 100;
const DEFAULT_ANALYTICS_DAYS = 30;
const ANALYTICS_INTERVAL_STEP = {
  day: '1 day',
  week: '1 week',
  month: '1 month'
};

const toNumber = (value) => Number(value || 0);

const startOfUTCDay = (date) => new Date(Date.UTC(
  date.getUTCFullYear(),
  date.getUTCMonth(),
  date.getUTCDate(),
  0,
  0,
  0,
  0
));

const endOfUTCDay = (date) => new Date(Date.UTC(
  date.getUTCFullYear(),
  date.getUTCMonth(),
  date.getUTCDate(),
  23,
  59,
  59,
  999
));

const addIntervalUTC = (date, interval) => {
  const next = new Date(date);
  if (interval === 'week') {
    next.setUTCDate(next.getUTCDate() + 7);
    return next;
  }

  if (interval === 'month') {
    next.setUTCMonth(next.getUTCMonth() + 1);
    return next;
  }

  next.setUTCDate(next.getUTCDate() + 1);
  return next;
};

const formatTrendLabel = (date, interval) => {
  const iso = date.toISOString();
  if (interval === 'month') {
    return iso.slice(0, 7);
  }

  return iso.slice(0, 10);
};

const resolveAnalyticsRange = (filters = {}) => {
  const now = new Date();
  const parsedStart = filters.startDate ? new Date(filters.startDate) : null;
  const parsedEnd = filters.endDate ? new Date(filters.endDate) : null;

  if (parsedStart && Number.isNaN(parsedStart.getTime())) {
    throw new Error('Invalid startDate');
  }

  if (parsedEnd && Number.isNaN(parsedEnd.getTime())) {
    throw new Error('Invalid endDate');
  }

  const endDate = parsedEnd ? endOfUTCDay(parsedEnd) : endOfUTCDay(now);
  const startDate = parsedStart
    ? startOfUTCDay(parsedStart)
    : startOfUTCDay(new Date(endDate.getTime() - ((DEFAULT_ANALYTICS_DAYS - 1) * 24 * 60 * 60 * 1000)));

  if (startDate > endDate) {
    throw new Error('startDate must be before or equal to endDate');
  }

  const durationDays = Math.max(Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1, 1);
  const interval = ['day', 'week', 'month'].includes(filters.interval)
    ? filters.interval
    : durationDays <= 62
      ? 'day'
      : durationDays <= 370
        ? 'week'
        : 'month';

  return {
    startDate,
    endDate,
    interval,
    durationDays
  };
};

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

  try {
    await notificationService.createNotification({
      userId: user.id,
      type: 'SYSTEM',
      title: isActive ? 'Tài khoản đã được kích hoạt' : 'Tài khoản đã bị tạm khóa',
      message: isActive
        ? 'Tài khoản của bạn đã được kích hoạt lại. Bạn có thể tiếp tục sử dụng hệ thống.'
        : 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.',
      actionUrl: '/profile'
    });
  } catch (error) {
    console.error('Failed to notify user active status update:', error);
  }

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

    try {
      await notificationService.createNotification({
        userId,
        type: 'SELLER_VERIFICATION',
        title: 'Yêu cầu người bán đã được phê duyệt',
        message: 'Chúc mừng! Bạn đã được xác minh người bán và có thể đăng bán sản phẩm.',
        actionUrl: '/seller/dashboard'
      });
    } catch (error) {
      console.error('Failed to notify seller verification approval:', error);
    }

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

  try {
    await notificationService.createNotification({
      userId,
      type: 'SELLER_VERIFICATION',
      title: 'Yêu cầu người bán bị từ chối',
      message: `Yêu cầu xác minh người bán của bạn đã bị từ chối${rejectionReason ? `: ${rejectionReason}` : '.'}`,
      actionUrl: '/become-seller'
    });
  } catch (error) {
    console.error('Failed to notify seller verification rejection:', error);
  }

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

  try {
    await notificationService.createNotification({
      userId: product.seller.id,
      type: 'PRODUCT',
      title: 'Cập nhật trạng thái sản phẩm',
      message: `Sản phẩm của bạn đã được cập nhật trạng thái: ${status}`,
      relatedProductId: product.id,
      actionUrl: `/products/${product.id}`
    });
  } catch (error) {
    console.error('Failed to notify product moderation status update:', error);
  }

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

  try {
    await notificationService.notifyOrderStatusChange(order.id, order.buyer.id, status);
  } catch (error) {
    console.error('Failed to notify admin order status update:', error);
  }

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

export const getAdvancedAnalyticsDashboard = async (filters = {}) => {
  const { startDate, endDate, interval, durationDays } = resolveAnalyticsRange(filters);
  const createdAtRange = {
    gte: startDate,
    lte: endDate
  };

  const [
    totalUsers,
    buyersTotal,
    sellersTotal,
    newUsers,
    newBuyers,
    newSellers,
    newPosts,
    newProducts,
    orderCount,
    paidOrders,
    paidRevenueAgg,
    initialUsers,
    initialBuyers,
    initialSellers,
    trendRows
  ] = await Promise.all([
    prisma.user.count({ where: { createdAt: { lte: endDate } } }),
    prisma.user.count({ where: { role: 'BUYER', createdAt: { lte: endDate } } }),
    prisma.user.count({ where: { role: 'SELLER', createdAt: { lte: endDate } } }),
    prisma.user.count({ where: { createdAt: createdAtRange } }),
    prisma.user.count({ where: { role: 'BUYER', createdAt: createdAtRange } }),
    prisma.user.count({ where: { role: 'SELLER', createdAt: createdAtRange } }),
    prisma.post.count({ where: { createdAt: createdAtRange } }),
    prisma.product.count({ where: { createdAt: createdAtRange } }),
    prisma.order.count({ where: { createdAt: createdAtRange } }),
    prisma.order.count({ where: { createdAt: createdAtRange, paymentStatus: 'PAID' } }),
    prisma.order.aggregate({
      _sum: { subtotal: true, shippingFee: true, total: true },
      where: { createdAt: createdAtRange, paymentStatus: 'PAID' }
    }),
    prisma.user.count({ where: { createdAt: { lt: startDate } } }),
    prisma.user.count({ where: { role: 'BUYER', createdAt: { lt: startDate } } }),
    prisma.user.count({ where: { role: 'SELLER', createdAt: { lt: startDate } } }),
    prisma.$queryRaw`
      WITH buckets AS (
        SELECT generate_series(
          date_trunc(${interval}, ${startDate}::timestamptz),
          date_trunc(${interval}, ${endDate}::timestamptz),
          ${ANALYTICS_INTERVAL_STEP[interval]}::interval
        ) AS bucket
      ),
      users_by_bucket AS (
        SELECT
          date_trunc(${interval}, "created_at") AS bucket,
          COUNT(*)::int AS new_users,
          COUNT(*) FILTER (WHERE role = 'BUYER')::int AS new_buyers,
          COUNT(*) FILTER (WHERE role = 'SELLER')::int AS new_sellers
        FROM "users"
        WHERE "created_at" BETWEEN ${startDate} AND ${endDate}
        GROUP BY 1
      ),
      posts_by_bucket AS (
        SELECT
          date_trunc(${interval}, "created_at") AS bucket,
          COUNT(*)::int AS new_posts
        FROM "posts"
        WHERE "created_at" BETWEEN ${startDate} AND ${endDate}
        GROUP BY 1
      ),
      products_by_bucket AS (
        SELECT
          date_trunc(${interval}, "created_at") AS bucket,
          COUNT(*)::int AS new_products
        FROM "products"
        WHERE "created_at" BETWEEN ${startDate} AND ${endDate}
        GROUP BY 1
      ),
      orders_by_bucket AS (
        SELECT
          date_trunc(${interval}, "created_at") AS bucket,
          COUNT(*)::int AS orders,
          COUNT(*) FILTER (WHERE "payment_status" = 'PAID')::int AS paid_orders,
          COALESCE(SUM(CASE WHEN "payment_status" = 'PAID' THEN "subtotal" ELSE 0 END), 0)::numeric AS paid_subtotal,
          COALESCE(SUM(CASE WHEN "payment_status" = 'PAID' THEN "shipping_fee" ELSE 0 END), 0)::numeric AS paid_shipping_fee,
          COALESCE(SUM(CASE WHEN "payment_status" = 'PAID' THEN "total" ELSE 0 END), 0)::numeric AS paid_total
        FROM "orders"
        WHERE "created_at" BETWEEN ${startDate} AND ${endDate}
        GROUP BY 1
      )
      SELECT
        b.bucket AS "bucketStart",
        COALESCE(u.new_users, 0)::int AS "newUsers",
        COALESCE(u.new_buyers, 0)::int AS "newBuyers",
        COALESCE(u.new_sellers, 0)::int AS "newSellers",
        COALESCE(p.new_posts, 0)::int AS "newPosts",
        COALESCE(pr.new_products, 0)::int AS "newProducts",
        COALESCE(o.orders, 0)::int AS "orders",
        COALESCE(o.paid_orders, 0)::int AS "paidOrders",
        COALESCE(o.paid_subtotal, 0)::numeric AS "paidSubtotal",
        COALESCE(o.paid_shipping_fee, 0)::numeric AS "paidShippingFee",
        COALESCE(o.paid_total, 0)::numeric AS "paidTotal"
      FROM buckets b
      LEFT JOIN users_by_bucket u ON u.bucket = b.bucket
      LEFT JOIN posts_by_bucket p ON p.bucket = b.bucket
      LEFT JOIN products_by_bucket pr ON pr.bucket = b.bucket
      LEFT JOIN orders_by_bucket o ON o.bucket = b.bucket
      ORDER BY b.bucket ASC
    `
  ]);

  let runningUsers = initialUsers;
  let runningBuyers = initialBuyers;
  let runningSellers = initialSellers;

  const trends = trendRows.map((row) => {
    const bucketStart = new Date(row.bucketStart);
    const nextBucketStart = addIntervalUTC(bucketStart, interval);

    runningUsers += Number(row.newUsers || 0);
    runningBuyers += Number(row.newBuyers || 0);
    runningSellers += Number(row.newSellers || 0);

    const buyerSellerRatio = runningSellers > 0
      ? Number((runningBuyers / runningSellers).toFixed(2))
      : null;

    return {
      bucketStart,
      bucketEnd: new Date(nextBucketStart.getTime() - 1),
      label: formatTrendLabel(bucketStart, interval),
      users: {
        new: Number(row.newUsers || 0),
        newBuyers: Number(row.newBuyers || 0),
        newSellers: Number(row.newSellers || 0),
        total: runningUsers,
        buyersTotal: runningBuyers,
        sellersTotal: runningSellers,
        buyerSellerRatio
      },
      content: {
        newPosts: Number(row.newPosts || 0),
        newProducts: Number(row.newProducts || 0)
      },
      commerce: {
        orders: Number(row.orders || 0),
        paidOrders: Number(row.paidOrders || 0),
        revenue: {
          subtotal: toNumber(row.paidSubtotal),
          shippingFee: toNumber(row.paidShippingFee),
          total: toNumber(row.paidTotal)
        }
      }
    };
  });

  const buyerSellerRatio = sellersTotal > 0 ? Number((buyersTotal / sellersTotal).toFixed(2)) : null;
  const totalRoleBase = buyersTotal + sellersTotal;

  return {
    period: {
      startDate,
      endDate,
      interval,
      durationDays,
      bucketCount: trends.length
    },
    summary: {
      users: {
        total: totalUsers,
        new: newUsers,
        buyersTotal,
        sellersTotal,
        newBuyers,
        newSellers,
        buyerSellerRatio,
        buyerPercentage: totalRoleBase > 0 ? Number(((buyersTotal / totalRoleBase) * 100).toFixed(2)) : 0,
        sellerPercentage: totalRoleBase > 0 ? Number(((sellersTotal / totalRoleBase) * 100).toFixed(2)) : 0
      },
      content: {
        newPosts,
        newProducts
      },
      commerce: {
        orders: orderCount,
        paidOrders,
        revenue: {
          subtotal: toNumber(paidRevenueAgg._sum.subtotal),
          shippingFee: toNumber(paidRevenueAgg._sum.shippingFee),
          total: toNumber(paidRevenueAgg._sum.total)
        }
      }
    },
    trends
  };
};
