import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Keep API response backward-compatible: expose product.name from product.title.
const normalizeOrderForClient = (order) => {
  if (!order?.items) {
    return order;
  }

  return {
    ...order,
    items: order.items.map((item) => {
      if (!item.product) {
        return item;
      }

      return {
        ...item,
        product: {
          ...item.product,
          name: item.product.title,
        },
      };
    }),
  };
};

/**
 * Generate unique order number
 */
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `ORD${timestamp}${random}`;
};

/**
 * Create order from cart
 */
export const createOrder = async (userId, orderData) => {
  const {
    shippingName,
    shippingPhone,
    shippingAddress,
    shippingCity,
    shippingDistrict,
    shippingWard,
    shippingNote,
    paymentMethod,
  } = orderData;

  // Get user's cart
  const cart = await prisma.cart.findFirst({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
          variant: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }

  // Validate stock for all items
  for (const item of cart.items) {
    if (
      item.product.trackInventory &&
      item.product.stockQuantity < item.quantity
    ) {
      throw new Error(`Insufficient stock for ${item.product.title}`);
    }

    if (item.product.status !== 'ACTIVE') {
      throw new Error(`Product ${item.product.title} is not available`);
    }
  }

  // Calculate totals
  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  // Mock shipping fee calculation (flat rate for now)
  const shippingFee = 30000; // 30k VND flat rate
  const tax = 0; // No tax for now
  const discount = 0; // No discount for now
  const total = subtotal + shippingFee + tax - discount;

  // Create order in transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create order
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        buyerId: userId,
        subtotal,
        shippingFee,
        tax,
        discount,
        total,
        shippingName,
        shippingPhone,
        shippingAddress,
        shippingCity,
        shippingDistrict,
        shippingWard,
        shippingNote,
        paymentMethod,
        paymentStatus: 'PENDING',
        status: 'PENDING',
      },
    });

    // Create order items
    for (const item of cart.items) {
      const totalPrice = Number(item.product.price) * item.quantity;

      await tx.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId: item.product.id,
          variantId: item.variantId || null,
          sellerId: item.product.sellerId,
          productName: item.product.title,
          productImageUrl: item.product.images[0]?.imageUrl || null,
          variantInfo: item.variant
            ? {
                id: item.variant.id,
                variantName: item.variant.variantName,
                options: item.variant.options,
              }
            : null,
          quantity: item.quantity,
          unitPrice: item.product.price,
          totalPrice,
          status: 'pending',
        },
      });

      // Update product stock if tracking
      if (item.product.trackInventory) {
        await tx.product.update({
          where: { id: item.product.id },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }
    }

    // Clear cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return newOrder;
  });

  // Return order with items
  const fullOrder = await getOrder(order.id, userId);
  return normalizeOrderForClient(fullOrder);
};

/**
 * Get order by ID
 */
export const getOrder = async (orderId, userId = null) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              price: true,
              status: true,
            },
          },
          seller: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Check authorization if userId provided
  if (userId) {
    const isOwner = order.buyerId === userId;
    const isSeller = order.items.some((item) => item.sellerId === userId);

    if (!isOwner && !isSeller) {
      throw new Error('Unauthorized');
    }
  }

  return normalizeOrderForClient(order);
};

/**
 * Get user's orders
 */
export const getUserOrders = async (userId, filters = {}) => {
  const { status, page = 1, limit = 10 } = filters;

  const where = {
    buyerId: userId,
    ...(status && { status }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: orders.map(normalizeOrderForClient),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get seller's orders
 */
export const getSellerOrders = async (sellerId, filters = {}) => {
  const { status, page = 1, limit = 10 } = filters;

  const where = {
    items: {
      some: {
        sellerId,
        ...(status && { status }),
      },
    },
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
            avatarUrl: true,
          },
        },
        items: {
          where: { sellerId },
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: orders.map(normalizeOrderForClient),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId, userId, newStatus) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Check if user is seller of any item in order
  const isSeller = order.items.some((item) => item.sellerId === userId);
  const isOwner = order.buyerId === userId;

  if (!isSeller && !isOwner) {
    throw new Error('Unauthorized');
  }

  // Validate status transitions
  const validTransitions = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPING'],
    SHIPPING: ['DELIVERED'],
    DELIVERED: ['COMPLETED'],
    COMPLETED: ['REFUNDED'], // Allow refund from completed orders
    CANCELLED: [],
    REFUNDED: [],
  };

  if (!validTransitions[order.status]?.includes(newStatus)) {
    throw new Error(`Cannot transition from ${order.status} to ${newStatus}`);
  }

  // Update order
  const updateData = {
    status: newStatus,
    ...(newStatus === 'CONFIRMED' && { confirmedAt: new Date() }),
    ...(newStatus === 'SHIPPING' && { shippedAt: new Date() }),
    ...(newStatus === 'DELIVERED' && { deliveredAt: new Date() }),
    ...(newStatus === 'CANCELLED' && { cancelledAt: new Date() }),
  };

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      buyer: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  return normalizeOrderForClient(updatedOrder);
};

/**
 * Cancel order
 */
export const cancelOrder = async (orderId, userId, reason = null) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Only buyer can cancel order
  if (order.buyerId !== userId) {
    throw new Error('Unauthorized');
  }

  // Can only cancel pending or confirmed orders
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    throw new Error('Order cannot be cancelled');
  }

  // Restore stock in transaction
  await prisma.$transaction(async (tx) => {
    // Update order status
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });

    // Restore product stock
    for (const item of order.items) {
      if (item.product?.trackInventory) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }
    }
  });

  return await getOrder(orderId, userId);
};

/**
 * Mock payment confirmation
 * In real app, this would be called by payment gateway webhook
 */
export const confirmPayment = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.paymentStatus === 'PAID') {
    throw new Error('Payment already confirmed');
  }

  // Mock: automatically confirm payment
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'PAID',
      paidAt: new Date(),
      status: order.status === 'PENDING' ? 'CONFIRMED' : order.status,
      ...(order.status === 'PENDING' && { confirmedAt: new Date() }),
    },
    include: {
      buyer: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  return normalizeOrderForClient(updatedOrder);
};
