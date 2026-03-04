import * as cartService from '../services/cart.service.js';

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = async (req, res) => {
  try {
    const cart = await cartService.getCart(req.user.id);

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart',
      error: error.message,
    });
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart/items
 * @access  Private
 */
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity, selectedVariant, variantId } = req.body;

    const cart = await cartService.addToCart(
      req.user.id,
      productId,
      quantity,
      selectedVariant,
      variantId
    );

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      data: cart,
    });
  } catch (error) {
    console.error('Add to cart error:', error);

    if (
      error.message === 'Product not found' ||
      error.message === 'Product is not available' ||
      error.message === 'Product variant not found'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === 'Insufficient stock') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message,
    });
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/items/:itemId
 * @access  Private
 */
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await cartService.updateCartItem(
      req.user.id,
      itemId,
      quantity
    );

    res.json({
      success: true,
      message: 'Cart item updated',
      data: cart,
    });
  } catch (error) {
    console.error('Update cart item error:', error);

    if (error.message === 'Cart item not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === 'Unauthorized') {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message === 'Quantity must be at least 1' ||
      error.message === 'Insufficient stock'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: error.message,
    });
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/items/:itemId
 * @access  Private
 */
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await cartService.removeFromCart(req.user.id, itemId);

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: cart,
    });
  } catch (error) {
    console.error('Remove from cart error:', error);

    if (error.message === 'Cart item not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === 'Unauthorized') {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message,
    });
  }
};

/**
 * @desc    Clear cart
 * @route   DELETE /api/cart
 * @access  Private
 */
export const clearCart = async (req, res) => {
  try {
    const cart = await cartService.clearCart(req.user.id);

    res.json({
      success: true,
      message: 'Cart cleared',
      data: cart,
    });
  } catch (error) {
    console.error('Clear cart error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message,
    });
  }
};

/**
 * @desc    Get cart items count
 * @route   GET /api/cart/count
 * @access  Private
 */
export const getCartItemsCount = async (req, res) => {
  try {
    const count = await cartService.getCartItemsCount(req.user.id);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart count',
      error: error.message,
    });
  }
};
