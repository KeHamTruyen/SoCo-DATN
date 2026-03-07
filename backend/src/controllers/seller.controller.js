import prisma from '../config/database.js';

/**
 * Get seller statistics and dashboard data
 * @route GET /api/seller/stats
 * @access Private (Seller only)
 */
export const getStats = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    // Get total revenue from completed orders
    const revenueData = await prisma.order.aggregate({
      where: {
        sellerId,
        status: 'COMPLETED'
      },
      _sum: {
        total: true
      }
    });

    // Get total orders count by status
    const ordersCount = await prisma.order.groupBy({
      by: ['status'],
      where: {
        sellerId
      },
      _count: {
        status: true
      }
    });

    // Get total products count
    const totalProducts = await prisma.product.count({
      where: {
        sellerId,
        deletedAt: null
      }
    });

    // Get average rating from product reviews
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

    // Get recent orders (last 5)
    const recentOrders = await prisma.order.findMany({
      where: {
        sellerId
      },
      include: {
        customer: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true
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

    // Get top selling products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          sellerId,
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

    // Get product details for top products
    const productIds = topProducts.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      },
      select: {
        id: true,
        name: true,
        price: true,
        images: true
      }
    });

    // Map top products with details
    const topProductsWithDetails = topProducts.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        product,
        totalSold: item._sum.quantity || 0,
        orderCount: item._count.productId
      };
    });

    // Calculate stats by status
    const statusStats = {
      total: 0,
      pending: 0,
      processing: 0,
      shipping: 0,
      completed: 0,
      cancelled: 0,
      refunded: 0
    };

    ordersCount.forEach(item => {
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

    res.json({
      success: true,
      data: {
        revenue: {
          total: revenueData._sum.total || 0,
          currency: 'VND'
        },
        orders: statusStats,
        products: {
          total: totalProducts,
          active: totalProducts // Can add inactive count if needed
        },
        rating: {
          average: ratingData._avg.rating || 0,
          count: ratingData._count.id || 0
        },
        recentOrders,
        topProducts: topProductsWithDetails
      }
    });
  } catch (error) {
    next(error);
  }
};
