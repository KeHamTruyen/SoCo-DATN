import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get or create user's cart
 */
const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
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
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
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
        },
      },
    });
  }

  return cart;
};

/**
 * Get user's cart
 */
export const getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);

  // Calculate totals
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  return {
    ...cart,
    totalItems,
    subtotal,
  };
};

/**
 * Add item to cart
 */
export const addToCart = async (userId, productId, quantity = 1, selectedVariant = null) => {
  // Validate product exists and has stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  if (product.status !== 'ACTIVE') {
    throw new Error('Product is not available');
  }

  if (product.trackInventory && product.stockQuantity < quantity) {
    throw new Error('Insufficient stock');
  }

  // Get or create cart
  const cart = await getOrCreateCart(userId);

  // Check if item already exists in cart with same variant
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
      ...(selectedVariant && {
        selectedVariant: {
          equals: selectedVariant,
        },
      }),
    },
  });

  if (existingItem) {
    // Update quantity
    const newQuantity = existingItem.quantity + quantity;

    if (product.trackInventory && product.stockQuantity < newQuantity) {
      throw new Error('Insufficient stock');
    }

    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  } else {
    // Create new cart item
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        selectedVariant,
      },
    });
  }

  // Return updated cart
  return await getCart(userId);
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (userId, cartItemId, quantity) => {
  if (quantity < 1) {
    throw new Error('Quantity must be at least 1');
  }

  // Find cart item and verify ownership
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      cart: true,
      product: true,
    },
  });

  if (!cartItem) {
    throw new Error('Cart item not found');
  }

  if (cartItem.cart.userId !== userId) {
    throw new Error('Unauthorized');
  }

  // Check stock
  if (
    cartItem.product.trackInventory &&
    cartItem.product.stockQuantity < quantity
  ) {
    throw new Error('Insufficient stock');
  }

  // Update quantity
  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });

  // Return updated cart
  return await getCart(userId);
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (userId, cartItemId) => {
  // Find cart item and verify ownership
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      cart: true,
    },
  });

  if (!cartItem) {
    throw new Error('Cart item not found');
  }

  if (cartItem.cart.userId !== userId) {
    throw new Error('Unauthorized');
  }

  // Delete cart item
  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });

  // Return updated cart
  return await getCart(userId);
};

/**
 * Clear cart
 */
export const clearCart = async (userId) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new Error('Cart not found');
  }

  // Delete all cart items
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  // Return empty cart
  return await getCart(userId);
};

/**
 * Get cart items count
 */
export const getCartItemsCount = async (userId) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: true,
    },
  });

  if (!cart) {
    return 0;
  }

  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
};
