import prisma from '../config/database.js';

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
            avatar: true
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
          avatar: true
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
