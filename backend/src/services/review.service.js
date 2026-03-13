import prisma from '../config/database.js';

/**
 * Get published product reviews for buyers.
 */
export const getProductReviews = async (productId, filters = {}) => {
  const { page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where = {
    productId,
    isPublished: true
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    }),
    prisma.review.count({ where })
  ]);

  const ratingAgg = await prisma.review.aggregate({
    where,
    _avg: {
      rating: true
    },
    _count: {
      id: true
    }
  });

  return {
    reviews,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    averageRating: Number(ratingAgg._avg.rating || 0),
    ratingCount: ratingAgg._count.id || 0
  };
};

/**
 * Buyer creates a review for purchased products.
 */
export const createReview = async (userId, payload) => {
  const { productId, orderItemId, rating, title, content, images = [] } = payload;

  if (!productId) {
    throw new Error('Product ID is required');
  }

  if (!rating || rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true }
  });

  if (!product) {
    throw new Error('Product not found');
  }

  let verifiedPurchase = false;

  if (orderItemId) {
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        productId,
        order: {
          buyerId: userId,
          status: {
            in: ['DELIVERED', 'COMPLETED']
          }
        }
      },
      select: {
        id: true
      }
    });

    if (!orderItem) {
      throw new Error('Order item not eligible for review');
    }

    verifiedPurchase = true;
  }

  const existed = await prisma.review.findFirst({
    where: {
      userId,
      productId,
      ...(orderItemId ? { orderItemId } : {})
    }
  });

  if (existed) {
    throw new Error('You have already reviewed this product');
  }

  const review = await prisma.review.create({
    data: {
      productId,
      orderItemId,
      userId,
      rating,
      title,
      content,
      images,
      isVerifiedPurchase: verifiedPurchase
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true
        }
      },
      product: {
        select: {
          id: true,
          title: true
        }
      }
    }
  });

  return review;
};

/**
 * Get all reviews for seller's products
 */
export const getSellerReviews = async (sellerId, filters = {}) => {
  const { hasResponse, page = 1, limit = 20 } = filters;
  
  const where = {
    product: {
      sellerId
    }
  };

  // Filter by response status
  if (hasResponse === 'true') {
    where.sellerResponse = { not: null };
  } else if (hasResponse === 'false') {
    where.sellerResponse = null;
  }

  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: true,
            price: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true
          }
        },
        orderItem: {
          select: {
            id: true,
            quantity: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    }),
    prisma.review.count({ where })
  ]);

  return {
    reviews,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

/**
 * Respond to a review
 */
export const respondToReview = async (reviewId, sellerId, response) => {
  // Check if review exists and belongs to seller's product
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      product: {
        sellerId
      }
    },
    include: {
      product: {
        select: {
          sellerId: true
        }
      }
    }
  });

  if (!review) {
    throw new Error('Review not found or unauthorized');
  }

  // Update review with seller response
  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      sellerResponse: response,
      sellerResponseAt: new Date()
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          images: true
        }
      },
      user: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true
        }
      }
    }
  });

  return updatedReview;
};

/**
 * Delete seller response
 */
export const deleteSellerResponse = async (reviewId, sellerId) => {
  // Check if review exists and belongs to seller's product
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      product: {
        sellerId
      }
    }
  });

  if (!review) {
    throw new Error('Review not found or unauthorized');
  }

  // Remove seller response
  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      sellerResponse: null,
      sellerResponseAt: null
    }
  });

  return updatedReview;
};
