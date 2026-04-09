import prisma from '../config/database.js';
import notificationService from './notification.service.js';

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

const orderInclude = {
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
      variant: {
        select: {
          id: true,
          variantName: true,
          options: true,
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
      review: {
        select: {
          id: true,
          rating: true,
          title: true,
          content: true,
          images: true,
          createdAt: true,
        },
      },
    },
  },
};

const formatOrder = (order) => ({
  ...order,
  items: order.items.map((item) => ({
    ...item,
    product: item.product
      ? {
          ...item.product,
          // Backward compatibility for old frontend contracts.
          name: item.product.title,
        }
      : null,
  })),
});

const parseRefundMetadata = (cancellationReason) => {
  if (!cancellationReason) {
    return { state: null, reason: null };
  }

  if (cancellationReason.startsWith('REFUND_REQUEST::')) {
    return {
      state: 'REQUESTED',
      reason: cancellationReason.replace('REFUND_REQUEST::', ''),
    };
  }

  if (cancellationReason.startsWith('REFUND_ACCEPTED::')) {
    return {
      state: 'ACCEPTED',
      reason: cancellationReason.replace('REFUND_ACCEPTED::', ''),
    };
  }

  if (cancellationReason.startsWith('REFUND_REJECTED::')) {
    return {
      state: 'REJECTED',
      reason: cancellationReason.replace('REFUND_REJECTED::', ''),
    };
  }

  return { state: null, reason: null };
};

async function applySalesCountDelta(tx, items, delta = 1) {
  const productQty = new Map();
  for (const item of items) {
    if (!item.productId) continue;
    const qty = Number(item.quantity || 0);
    if (!Number.isFinite(qty) || qty <= 0) continue;
    productQty.set(item.productId, (productQty.get(item.productId) || 0) + qty);
  }
  for (const [productId, qty] of productQty.entries()) {
    await tx.product.update({
      where: { id: productId },
      data: {
        salesCount: {
          increment: qty * delta,
        },
      },
    });
  }
}

/**
 * Create order from cart
 */
export const createOrder = async (userId, orderData) => {
  const {
    cartItemIds,
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

  const selectedCartItems =
    Array.isArray(cartItemIds) && cartItemIds.length > 0
      ? cart.items.filter((item) => cartItemIds.includes(item.id))
      : cart.items;

  if (selectedCartItems.length === 0) {
    throw new Error('Selected cart items not found');
  }

  // Validate stock for all items
  for (const item of selectedCartItems) {
    if (
      item.product.trackInventory &&
      (item.variant?.stockQuantity ?? item.product.stockQuantity) < item.quantity
    ) {
      throw new Error(`Insufficient stock for ${item.product.title}`);
    }

    if (item.product.status !== 'ACTIVE') {
      throw new Error(`Product ${item.product.title} is not available`);
    }
  }

  // Calculate totals
  const shippingFeePerOrder = 30000; // 30k VND flat rate (per shop order)
  const tax = 0; // No tax for now
  const discount = 0; // No discount for now

  const itemsBySeller = new Map();
  for (const item of selectedCartItems) {
    const sellerId = item.product?.sellerId;
    if (!sellerId) {
      throw new Error(`Missing seller for ${item.product?.title ?? 'product'}`);
    }
    if (!itemsBySeller.has(sellerId)) itemsBySeller.set(sellerId, []);
    itemsBySeller.get(sellerId).push(item);
  }

  // Create order in transaction
  const orders = await prisma.$transaction(async (tx) => {
    const createdOrderIds = [];

    for (const [sellerId, items] of itemsBySeller.entries()) {
      const subtotal = items.reduce((sum, item) => {
        const unitPrice = item.variant?.price ?? item.price ?? item.product.price;
        return sum + Number(unitPrice) * item.quantity;
      }, 0);
      const shippingFee = shippingFeePerOrder;
      const total = subtotal + shippingFee + tax - discount;

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
      for (const item of items) {
        const unitPrice = item.variant?.price ?? item.price ?? item.product.price;
        const totalPrice = Number(unitPrice) * item.quantity;
        const variantInfo = item.variant?.options ?? null;

        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.product.id,
            variantId: item.variantId || null,
            sellerId,
            productName: item.product.title,
            productImageUrl: item.product.images[0]?.imageUrl || null,
            variantInfo,
            quantity: item.quantity,
            unitPrice,
            totalPrice,
            status: 'pending',
          },
        });

        // Update product stock if tracking
        if (item.product.trackInventory) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stockQuantity: {
                  decrement: item.quantity,
                },
              },
            });
          } else {
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
      }

      createdOrderIds.push(newOrder.id);
    }

    // Clear only purchased items from cart.
    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        id: { in: selectedCartItems.map((item) => item.id) },
      },
    });

    return createdOrderIds;
  });

  const createdOrders = await Promise.all(orders.map((id) => getOrder(id, userId)));

  // Notify each seller once for their corresponding order.
  await Promise.allSettled(
    createdOrders.map((o) => {
      const sellerId = o.items?.[0]?.sellerId;
      return sellerId ? notificationService.notifyNewOrder(o, sellerId) : Promise.resolve();
    })
  );

  return createdOrders;
};

/**
 * Get order by ID
 */
export const getOrder = async (orderId, userId = null) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
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

  return formatOrder(order);
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
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: orders.map(formatOrder),
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
    ...(status && { status }),
    items: {
      some: {
        sellerId,
      },
    },
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        buyer: orderInclude.buyer,
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
            variant: orderInclude.items.include.variant,
            seller: orderInclude.items.include.seller,
            review: orderInclude.items.include.review,
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
    orders: orders.map(formatOrder),
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

  const sellerTransitions = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPING'],
    SHIPPING: ['DELIVERED'],
    DELIVERED: [],
    COMPLETED: [],
    CANCELLED: [],
    REFUNDED: [],
  };
  const buyerTransitions = {
    DELIVERED: ['COMPLETED'],
  };

  const transitions = isSeller ? sellerTransitions : buyerTransitions;
  if (!transitions[order.status]?.includes(newStatus)) {
    throw new Error(
      `Cannot transition from ${order.status} to ${newStatus} for this role`
    );
  }

  // Update order
  const updateData = {
    status: newStatus,
    ...(newStatus === 'CONFIRMED' && { confirmedAt: new Date() }),
    ...(newStatus === 'SHIPPING' && { shippedAt: new Date() }),
    ...(newStatus === 'DELIVERED' && { deliveredAt: new Date() }),
    ...(newStatus === 'CANCELLED' && { cancelledAt: new Date() }),
  };

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const nextOrder = await tx.order.update({
      where: { id: orderId },
      data: updateData,
      include: orderInclude,
    });

    // Restore stock if seller cancels before shipping.
    if (newStatus === 'CANCELLED') {
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stockQuantity: { increment: item.quantity } },
          });
        } else if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } },
          });
        }
      }
    }

    if (newStatus === 'COMPLETED' && order.status !== 'COMPLETED') {
      await applySalesCountDelta(tx, order.items, 1);
    }

    return nextOrder;
  });

  if (updatedOrder.buyerId) {
    await notificationService.notifyOrderStatusChange(
      updatedOrder,
      updatedOrder.buyerId,
      newStatus
    );
  }

  return formatOrder(updatedOrder);
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
export const confirmPayment = async (orderId, userId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.buyerId !== userId) {
    throw new Error('Unauthorized');
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
    include: orderInclude,
  });

  return formatOrder(updatedOrder);
};

/**
 * Buyer requests refund for delivered/completed order.
 */
export const requestRefund = async (orderId, userId, reason) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error('Order not found');
  }
  if (order.buyerId !== userId) {
    throw new Error('Unauthorized');
  }
  if (!['DELIVERED', 'COMPLETED'].includes(order.status)) {
    throw new Error('Order is not eligible for refund');
  }
  if (parseRefundMetadata(order.cancellationReason).state === 'REQUESTED') {
    throw new Error('Refund already requested');
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      cancellationReason: `REFUND_REQUEST::${reason || 'Customer requested refund'}`,
    },
  });

  const updated = await getOrder(orderId, userId);
  const sellerIds = [
    ...new Set(updated.items.map((item) => item.sellerId).filter(Boolean)),
  ];

  await Promise.allSettled(
    sellerIds.map((sellerId) =>
      notificationService.create({
        userId: sellerId,
        type: 'refund_request',
        title: 'Yeu cau hoan tien moi',
        message: `Don hang #${updated.orderNumber} co yeu cau hoan tien`,
        relatedOrderId: updated.id,
        actionUrl: '/seller/refunds',
      })
    )
  );

  return updated;
};

/**
 * List buyer's refund requests.
 */
export const getMyRefundRequests = async (userId, filters = {}) => {
  const { page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;
  const where = {
    buyerId: userId,
    cancellationReason: { contains: 'REFUND_' },
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    requests: orders.map((order) => ({
      ...formatOrder(order),
      refund: parseRefundMetadata(order.cancellationReason),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * List seller-side refund requests.
 */
export const getSellerRefundRequests = async (sellerId, filters = {}) => {
  const { page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;
  const where = {
    items: { some: { sellerId } },
    cancellationReason: { startsWith: 'REFUND_REQUEST::' },
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    requests: orders.map((order) => ({
      ...formatOrder(order),
      refund: parseRefundMetadata(order.cancellationReason),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Seller processes refund request.
 */
export const processRefund = async (orderId, sellerId, { accept, reason }) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  const isSeller = order.items.some((item) => item.sellerId === sellerId);
  if (!isSeller) {
    throw new Error('Unauthorized');
  }

  const metadata = parseRefundMetadata(order.cancellationReason);
  if (metadata.state !== 'REQUESTED') {
    throw new Error('No pending refund request');
  }

  let updatedOrder;
  if (accept) {
    updatedOrder = await prisma.$transaction(async (tx) => {
      const nextOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'REFUNDED',
          paymentStatus:
            order.paymentStatus === 'PAID' ? 'REFUNDED' : order.paymentStatus,
          cancellationReason: `REFUND_ACCEPTED::${reason || metadata.reason || ''}`,
        },
        include: orderInclude,
      });
      if (order.status === 'COMPLETED') {
        await applySalesCountDelta(tx, order.items, -1);
      }
      return nextOrder;
    });
  } else {
    updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        cancellationReason: `REFUND_REJECTED::${reason || 'Request rejected by seller'}`,
      },
      include: orderInclude,
    });
  }

  await notificationService.create({
    userId: updatedOrder.buyerId,
    type: accept ? 'refund_approved' : 'refund_rejected',
    title: accept ? 'Yeu cau hoan tien duoc chap nhan' : 'Yeu cau hoan tien bi tu choi',
    message: `Don hang #${updatedOrder.orderNumber}: ${accept ? 'da hoan tien' : 'bi tu choi hoan tien'}`,
    relatedOrderId: updatedOrder.id,
    actionUrl: `/orders/${updatedOrder.id}`,
  });

  return {
    ...formatOrder(updatedOrder),
    refund: parseRefundMetadata(updatedOrder.cancellationReason),
  };
};
