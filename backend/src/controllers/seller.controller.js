import prisma from '../config/database.js';

/**
 * Get seller statistics and dashboard data
 * @route GET /api/seller/stats
 * @access Private (Seller only)
 */
export const getStats = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    // Revenue is calculated from seller-owned order items in completed orders.
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

    // Get total orders count by status for orders containing seller's items.
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

    // Get total products count
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

    // Get recent seller orders (last 5)
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

    // Get top selling products by quantity.
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

    // Get product details for top products
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

    // Map top products with details
    const topProductsWithDetails = topProducts.map(item => {
      const product = products.find(p => p.id === item.productId);
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
      }
    });
  } catch (error) {
    next(error);
  }
};
