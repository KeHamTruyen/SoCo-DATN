import prisma from '../config/database.js';
import notificationService from './notification.service.js';

const reviewInclude = {
  user: {
    select: {
      id: true,
      username: true,
      fullName: true,
      avatarUrl: true,
    },
  },
  product: {
    select: {
      id: true,
      title: true,
      slug: true,
      sellerId: true,
    },
  },
  orderItem: {
    select: {
      id: true,
      orderId: true,
      sellerId: true,
    },
  },
};

const mapReview = (review) => ({
  ...review,
  product: review.product
    ? {
        ...review.product,
        name: review.product.title,
      }
    : null,
});

export const createReview = async (userId, data) => {
  const { orderItemId, rating, title, content, images = [] } = data;

  const orderItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: {
      order: true,
      product: true,
    },
  });

  if (!orderItem) {
    throw new Error('Order item not found');
  }
  if (orderItem.order?.buyerId !== userId) {
    throw new Error('Unauthorized');
  }
  if (!['DELIVERED', 'COMPLETED'].includes(orderItem.order.status)) {
    throw new Error('Order item is not eligible for review');
  }

  const existing = await prisma.review.findFirst({
    where: { orderItemId },
  });
  if (existing) {
    throw new Error('You already reviewed this item');
  }

  const review = await prisma.review.create({
    data: {
      productId: orderItem.productId,
      orderItemId,
      userId,
      rating,
      title: title || null,
      content: content || null,
      images,
      isVerifiedPurchase: true,
      isPublished: true,
    },
    include: reviewInclude,
  });

  if (orderItem.sellerId) {
    await notificationService.create({
      userId: orderItem.sellerId,
      type: 'new_review',
      title: 'Danh gia moi',
      message: `Ban vua nhan duoc danh gia moi cho ${orderItem.productName}`,
      relatedOrderId: orderItem.orderId,
      relatedProductId: orderItem.productId,
      actionUrl: `/seller/reviews`,
    });
  }

  return mapReview(review);
};

export const getProductReviews = async (
  productId,
  {
    page = 1,
    limit = 10,
    rating,
    hasMedia,
    hasSellerReply,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = {}
) => {
  const skip = (page - 1) * limit;
  const where = {
    productId,
    isPublished: true,
  };
  if (typeof rating === 'number') {
    where.rating = rating;
  }
  if (typeof hasMedia === 'boolean') {
    where.images = hasMedia ? { isEmpty: false } : { isEmpty: true };
  }
  if (typeof hasSellerReply === 'boolean') {
    where.sellerResponse = hasSellerReply ? { not: null } : null;
  }
  const safeSortBy =
    sortBy === 'rating' || sortBy === 'helpfulCount' ? sortBy : 'createdAt';
  const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

  const [reviews, total, ratingStats] = await Promise.all([
    prisma.review.findMany({
      where,
      include: reviewInclude,
      orderBy: { [safeSortBy]: safeSortOrder },
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
    prisma.review.groupBy({
      by: ['rating'],
      where,
      _count: { rating: true },
    }),
  ]);

  const distribution = ratingStats.reduce((acc, item) => {
    acc[item.rating] = item._count.rating;
    return acc;
  }, {});

  return {
    reviews: reviews.map(mapReview),
    ratingDistribution: distribution,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const replyReview = async (reviewId, sellerId, reply) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      product: {
        select: { sellerId: true, title: true },
      },
      user: {
        select: { id: true },
      },
    },
  });

  if (!review) {
    throw new Error('Review not found');
  }
  if (review.product.sellerId !== sellerId) {
    throw new Error('Unauthorized');
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      sellerResponse: reply,
      sellerResponseAt: new Date(),
    },
    include: reviewInclude,
  });

  await notificationService.create({
    userId: updated.userId,
    type: 'review_reply',
    title: 'Nguoi ban da phan hoi danh gia',
    message: `Danh gia cua ban cho ${review.product.title} da duoc phan hoi`,
    relatedProductId: updated.productId,
    actionUrl: `/products/${updated.productId}`,
  });

  return mapReview(updated);
};
