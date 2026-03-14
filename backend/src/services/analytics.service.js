import prisma from '../config/database.js';

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

const getDayWindow = (dateInput) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid date');
  }

  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
};

export const trackProductView = async ({ productId, userId, sessionId, ipAddress, userAgent }) => {
  await prisma.productView.create({
    data: {
      productId,
      userId: userId || null,
      sessionId: sessionId || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null
    }
  });
};

export const getSellerAnalyticsDashboard = async (sellerId, filters = {}) => {
  const createdAt = buildDateRange(filters.startDate, filters.endDate);

  const [totalProducts, activeProducts, totalViews, followerCount, newFollowers, salesAgg, orderGroups] = await Promise.all([
    prisma.product.count({ where: { sellerId } }),
    prisma.product.count({ where: { sellerId, status: 'ACTIVE' } }),
    prisma.productView.count({
      where: {
        product: { sellerId },
        ...(createdAt && { createdAt })
      }
    }),
    prisma.follow.count({ where: { followingId: sellerId } }),
    prisma.follow.count({
      where: {
        followingId: sellerId,
        ...(createdAt && { createdAt })
      }
    }),
    prisma.orderItem.aggregate({
      where: {
        sellerId,
        order: {
          status: { in: ['COMPLETED', 'DELIVERED'] },
          ...(createdAt && { createdAt })
        }
      },
      _sum: {
        totalPrice: true,
        quantity: true
      },
      _count: {
        id: true
      }
    }),
    prisma.orderItem.groupBy({
      by: ['orderId'],
      where: {
        sellerId,
        order: {
          ...(createdAt && { createdAt })
        }
      }
    })
  ]);

  const totalOrders = orderGroups.length;

  const topProductsRaw = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: {
      sellerId,
      order: {
        status: { in: ['COMPLETED', 'DELIVERED'] },
        ...(createdAt && { createdAt })
      }
    },
    _sum: {
      quantity: true,
      totalPrice: true
    },
    orderBy: {
      _sum: {
        totalPrice: 'desc'
      }
    },
    take: 5
  });

  const productIds = topProductsRaw.map((row) => row.productId).filter(Boolean);
  const productMap = productIds.length > 0
    ? await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        title: true,
        slug: true,
        images: {
          take: 1,
          orderBy: { displayOrder: 'asc' },
          select: { imageUrl: true }
        }
      }
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
    summary: {
      products: {
        total: totalProducts,
        active: activeProducts
      },
      audience: {
        totalFollowers: followerCount,
        newFollowers
      },
      traffic: {
        totalViews
      },
      sales: {
        totalOrders,
        totalItemsSold: salesAgg._sum.quantity || 0,
        grossRevenue: toNumber(salesAgg._sum.totalPrice)
      }
    },
    topProducts: topProductsRaw.map((row) => ({
      product: productMap[row.productId]
        ? {
            id: productMap[row.productId].id,
            title: productMap[row.productId].title,
            slug: productMap[row.productId].slug,
            imageUrl: productMap[row.productId].images[0]?.imageUrl || null
          }
        : { id: row.productId, title: null, slug: null, imageUrl: null },
      quantitySold: row._sum.quantity || 0,
      revenue: toNumber(row._sum.totalPrice)
    }))
  };
};

export const getPlatformAnalyticsOverview = async (filters = {}) => {
  const createdAt = buildDateRange(filters.startDate, filters.endDate);

  const [users, sellers, products, orders, posts, views, paidOrders, revenueAgg, topSellersRaw] = await Promise.all([
    prisma.user.count({ where: createdAt ? { createdAt } : undefined }),
    prisma.user.count({ where: { role: 'SELLER', ...(createdAt && { createdAt }) } }),
    prisma.product.count({ where: createdAt ? { createdAt } : undefined }),
    prisma.order.count({ where: createdAt ? { createdAt } : undefined }),
    prisma.post.count({ where: createdAt ? { createdAt } : undefined }),
    prisma.productView.count({ where: createdAt ? { createdAt } : undefined }),
    prisma.order.count({ where: { paymentStatus: 'PAID', ...(createdAt && { createdAt }) } }),
    prisma.order.aggregate({
      _sum: {
        subtotal: true,
        shippingFee: true,
        total: true
      },
      where: {
        paymentStatus: 'PAID',
        ...(createdAt && { createdAt })
      }
    }),
    prisma.orderItem.groupBy({
      by: ['sellerId'],
      _sum: { totalPrice: true },
      _count: { id: true },
      where: {
        order: {
          ...(createdAt && { createdAt }),
          status: { in: ['COMPLETED', 'DELIVERED'] }
        }
      },
      orderBy: {
        _sum: {
          totalPrice: 'desc'
        }
      },
      take: 5
    })
  ]);

  const sellerIds = topSellersRaw.map((row) => row.sellerId).filter(Boolean);
  const sellerMap = sellerIds.length > 0
    ? await prisma.user.findMany({
      where: { id: { in: sellerIds } },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true
      }
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
      sellers,
      products,
      orders,
      posts,
      productViews: views,
      paidOrders,
      revenue: {
        subtotal: toNumber(revenueAgg._sum.subtotal),
        shippingFee: toNumber(revenueAgg._sum.shippingFee),
        total: toNumber(revenueAgg._sum.total)
      }
    },
    topSellers: topSellersRaw.map((row) => ({
      seller: sellerMap[row.sellerId] || { id: row.sellerId, username: null, fullName: null, avatarUrl: null },
      soldItems: row._count.id,
      revenue: toNumber(row._sum.totalPrice)
    }))
  };
};

export const aggregateSellerStatsDaily = async (dateInput) => {
  const { start, end } = getDayWindow(dateInput);

  const sellers = await prisma.user.findMany({
    where: {
      role: 'SELLER',
      isActive: true
    },
    select: { id: true }
  });

  for (const seller of sellers) {
    const sellerId = seller.id;

    const [salesAgg, dailyOrderGroups, totalProducts, totalViews, newFollowers, socialAgg] = await Promise.all([
      prisma.orderItem.aggregate({
        where: {
          sellerId,
          order: {
            createdAt: { gte: start, lt: end },
            status: { in: ['COMPLETED', 'DELIVERED'] }
          }
        },
        _sum: {
          totalPrice: true,
          quantity: true
        }
      }),
      prisma.orderItem.groupBy({
        by: ['orderId'],
        where: {
          sellerId,
          order: {
            createdAt: { gte: start, lt: end }
          }
        }
      }),
      prisma.product.count({
        where: {
          sellerId,
          status: {
            not: 'ARCHIVED'
          }
        }
      }),
      prisma.productView.count({
        where: {
          product: { sellerId },
          createdAt: { gte: start, lt: end }
        }
      }),
      prisma.follow.count({
        where: {
          followingId: sellerId,
          createdAt: { gte: start, lt: end }
        }
      }),
      prisma.product.aggregate({
        where: { sellerId },
        _sum: {
          likesCount: true,
          commentsCount: true
        }
      })
    ]);

    const totalRevenue = toNumber(salesAgg._sum.totalPrice);
    const totalOrders = dailyOrderGroups.length;
    await prisma.sellerStats.upsert({
      where: {
        sellerId_date: {
          sellerId,
          date: start
        }
      },
      create: {
        sellerId,
        date: start,
        totalSales: totalRevenue,
        totalOrders,
        totalRevenue,
        totalProfit: totalRevenue,
        totalProducts,
        totalViews,
        newFollowers,
        totalLikes: socialAgg._sum.likesCount || 0,
        totalComments: socialAgg._sum.commentsCount || 0
      },
      update: {
        totalSales: totalRevenue,
        totalOrders,
        totalRevenue,
        totalProfit: totalRevenue,
        totalProducts,
        totalViews,
        newFollowers,
        totalLikes: socialAgg._sum.likesCount || 0,
        totalComments: socialAgg._sum.commentsCount || 0
      }
    });
  }

  return {
    date: start,
    processedSellers: sellers.length
  };
};

export const getSellerStatsHistory = async (sellerId, filters = {}) => {
  const days = Math.min(Math.max(parseInt(filters.days, 10) || 30, 1), 365);
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - (days - 1));

  const stats = await prisma.sellerStats.findMany({
    where: {
      sellerId,
      date: {
        gte: new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()))
      }
    },
    orderBy: { date: 'asc' }
  });

  return {
    days,
    data: stats.map((row) => ({
      date: row.date,
      totalSales: toNumber(row.totalSales),
      totalOrders: row.totalOrders,
      totalRevenue: toNumber(row.totalRevenue),
      totalProfit: toNumber(row.totalProfit),
      totalProducts: row.totalProducts,
      totalViews: row.totalViews,
      newFollowers: row.newFollowers,
      totalLikes: row.totalLikes,
      totalComments: row.totalComments
    }))
  };
};