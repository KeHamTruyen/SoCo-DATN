import { PrismaClient } from '@prisma/client';
import notificationService from './notification.service.js';

const prisma = new PrismaClient();
const REFUND_REQUEST_PREFIX = '[REFUND_REQUEST]';
const REFUND_REJECT_PREFIX = '[REFUND_REJECTED]';

const buildRefundMetaString = (prefix, payload) => `${prefix}${JSON.stringify(payload)}`;

const parseRefundMeta = (rawValue, prefix) => {
  if (!rawValue || !rawValue.startsWith(prefix)) {
    return null;
  }

  const jsonPart = rawValue.slice(prefix.length);
  try {
    return JSON.parse(jsonPart);
  } catch {
    return null;
  }
};

const getCartItemUnitPrice = (item) => {
  return Number(item.price ?? item.variant?.price ?? item.product?.price ?? 0);
};

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

const getDistinctSellerIds = (items = []) => {
  return [...new Set(items.map((item) => item.product?.sellerId || item.sellerId).filter(Boolean))];
};

const restoreOrderStock = async (tx, items = []) => {
  for (const item of items) {
    if (item.product?.trackInventory && item.productId) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: {
            increment: item.quantity,
          },
        },
      });

      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }
    }
  }
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

  if (getDistinctSellerIds(cart.items).length > 1) {
    throw new Error('Cart contains products from multiple sellers');
  }

  // Validate stock for all items
  for (const item of cart.items) {
    if (item.variantId && (!item.variant || !item.variant.isActive)) {
      throw new Error(`Selected variant for ${item.product.title} is not available`);
    }

    if (
      item.product.trackInventory &&
      item.product.stockQuantity < item.quantity
    ) {
      throw new Error(`Insufficient stock for ${item.product.title}`);
    }

    if (item.product.status !== 'ACTIVE') {
      throw new Error(`Product ${item.product.title} is not available`);
    }

    if (
      item.variant &&
      item.product.trackInventory &&
      item.variant.stockQuantity < item.quantity
    ) {
      throw new Error(`Insufficient stock for selected variant of ${item.product.title}`);
    }
  }

  // Calculate totals
  const subtotal = cart.items.reduce(
    (sum, item) => sum + getCartItemUnitPrice(item) * item.quantity,
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
      const unitPrice = getCartItemUnitPrice(item);
      const totalPrice = unitPrice * item.quantity;

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
                price: item.variant.price,
              }
            : null,
          quantity: item.quantity,
          unitPrice,
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

        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          });
        }
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

  // Notify sellers about the new order (do not block order creation).
  try {
    const sellerIds = [...new Set(cart.items.map((item) => item.product.sellerId).filter(Boolean))];
    await Promise.all(
      sellerIds.map((sellerId) =>
        notificationService.notifyNewOrderForSeller(order.id, sellerId, userId)
      )
    );
  } catch (error) {
    console.error('Failed to notify sellers for new order:', error);
  }

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

  // Check if user is seller of any item in order
  const isSeller = order.items.some((item) => item.sellerId === userId);

  if (!isSeller) {
    throw new Error('Only seller can update order status');
  }

  if (getDistinctSellerIds(order.items).length > 1) {
    throw new Error('Multi-seller orders must be processed separately');
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

  const updatedOrder = await prisma.$transaction(async (tx) => {
    if (newStatus === 'CANCELLED') {
      await restoreOrderStock(tx, order.items);
    }

    return tx.order.update({
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
  });

  try {
    await notificationService.notifyOrderStatusChange(orderId, order.buyerId, newStatus);
  } catch (error) {
    console.error('Failed to notify buyer for order status change:', error);
  }

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
    await restoreOrderStock(tx, order.items);
  });

  // Notify all involved sellers when buyer cancels order.
  try {
    const sellerIds = [...new Set(order.items.map((item) => item.sellerId).filter(Boolean))];
    await Promise.all(
      sellerIds.map((sellerId) =>
        notificationService.notifyOrderCancelledForSeller(orderId, sellerId, userId)
      )
    );
  } catch (error) {
    console.error('Failed to notify sellers for cancelled order:', error);
  }

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

/**
 * Buyer requests refund for delivered/completed order.
 * This is a simulated workflow storing request metadata in cancellationReason.
 */
export const requestRefund = async (orderId, buyerId, reason) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        select: {
          sellerId: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.buyerId !== buyerId) {
    throw new Error('Unauthorized');
  }

  if (!['DELIVERED', 'COMPLETED'].includes(order.status)) {
    throw new Error('Order is not eligible for refund request');
  }

  if (order.cancellationReason?.startsWith(REFUND_REQUEST_PREFIX)) {
    throw new Error('Refund request already submitted');
  }

  const requestPayload = {
    reason,
    requestedAt: new Date().toISOString(),
  };

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      cancellationReason: buildRefundMetaString(REFUND_REQUEST_PREFIX, requestPayload),
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

  // Notify all involved sellers to review the refund request.
  try {
    const sellerIds = [...new Set(order.items.map((item) => item.sellerId).filter(Boolean))];
    await Promise.all(
      sellerIds.map((sellerId) =>
        notificationService.createNotification({
          userId: sellerId,
          type: 'ORDER',
          title: 'Yeu cau hoan tien moi',
          message: `Nguoi mua vua gui yeu cau hoan tien cho don ${order.orderNumber}`,
          relatedUserId: buyerId,
          relatedOrderId: orderId,
          actionUrl: `/orders/${orderId}`,
        })
      )
    );
  } catch (error) {
    console.error('Failed to notify sellers for refund request:', error);
  }

  return normalizeOrderForClient(updated);
};

/**
 * Seller gets pending refund requests from their sales.
 */
export const getSellerRefundRequests = async (sellerId, filters = {}) => {
  const { page = 1, limit = 10 } = filters;

  const where = {
    status: {
      in: ['DELIVERED', 'COMPLETED'],
    },
    cancellationReason: {
      startsWith: REFUND_REQUEST_PREFIX,
    },
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
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  const enrichedOrders = orders.map((order) => ({
    ...normalizeOrderForClient(order),
    refundRequest: parseRefundMeta(order.cancellationReason, REFUND_REQUEST_PREFIX),
  }));

  return {
    orders: enrichedOrders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Seller approves/rejects a pending refund request.
 */
export const processRefundRequest = async (orderId, sellerId, action, note = null) => {
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

  const isSeller = order.items.some((item) => item.sellerId === sellerId);
  if (!isSeller) {
    throw new Error('Only seller can process refund request');
  }

  if (getDistinctSellerIds(order.items).length > 1) {
    throw new Error('Multi-seller orders must be processed separately');
  }

  const requestMeta = parseRefundMeta(order.cancellationReason, REFUND_REQUEST_PREFIX);
  if (!requestMeta) {
    throw new Error('Refund request not found');
  }

  const normalizedAction = String(action || '').toUpperCase();
  if (!['APPROVE', 'REJECT'].includes(normalizedAction)) {
    throw new Error('Invalid refund action');
  }

  const processedAt = new Date();

  const updatedOrder = await prisma.$transaction(async (tx) => {
    if (normalizedAction === 'APPROVE') {
      return tx.order.update({
        where: { id: orderId },
        data: {
          status: 'REFUNDED',
          paymentStatus: 'REFUNDED',
          cancellationReason: buildRefundMetaString(REFUND_REQUEST_PREFIX, {
            ...requestMeta,
            processedAt: processedAt.toISOString(),
            processedBy: sellerId,
            action: 'APPROVED',
            note,
          }),
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
    }

    return tx.order.update({
      where: { id: orderId },
      data: {
        cancellationReason: buildRefundMetaString(REFUND_REJECT_PREFIX, {
          ...requestMeta,
          processedAt: processedAt.toISOString(),
          processedBy: sellerId,
          action: 'REJECTED',
          note,
        }),
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
  });

  try {
    if (normalizedAction === 'APPROVE') {
      await notificationService.notifyOrderStatusChange(orderId, order.buyerId, 'REFUNDED');
    } else {
      await notificationService.createNotification({
        userId: order.buyerId,
        type: 'ORDER',
        title: 'Yeu cau hoan tien bi tu choi',
        message: `Yeu cau hoan tien cho don ${order.orderNumber} da bi tu choi`,
        relatedOrderId: orderId,
        actionUrl: `/orders/${orderId}`,
      });
    }
  } catch (error) {
    console.error('Failed to notify buyer for refund processing:', error);
  }

  return normalizeOrderForClient(updatedOrder);
};
