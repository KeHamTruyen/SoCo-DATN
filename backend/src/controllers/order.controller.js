import * as orderService from '../services/order.service.js';

/**
 * @desc    Create new order from cart
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    const order = await orderService.createOrder(req.user.id, orderData);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    console.error('Create order error:', error);

    if (error.message === 'Cart is empty') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes('not available')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === 'Selected cart items not found') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
    });
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:orderId
 * @access  Private
 */
export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderService.getOrder(orderId, req.user.id);

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order error:', error);

    if (error.message === 'Order not found') {
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
      message: 'Failed to get order',
      error: error.message,
    });
  }
};

/**
 * @desc    Get user's orders
 * @route   GET /api/orders/my/purchases
 * @access  Private
 */
export const getMyOrders = async (req, res) => {
  try {
    const { status, page, limit } = req.query;
    const result = await orderService.getUserOrders(req.user.id, {
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    res.json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error.message,
    });
  }
};

/**
 * @desc    Get seller's orders
 * @route   GET /api/orders/my/sales
 * @access  Private (Seller)
 */
export const getMySales = async (req, res) => {
  try {
    const { status, page, limit } = req.query;
    const result = await orderService.getSellerOrders(req.user.id, {
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    res.json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Get my sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sales',
      error: error.message,
    });
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:orderId/status
 * @access  Private
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await orderService.updateOrderStatus(
      orderId,
      req.user.id,
      status
    );

    res.json({
      success: true,
      message: 'Order status updated',
      data: order,
    });
  } catch (error) {
    console.error('Update order status error:', error);

    if (error.message === 'Order not found') {
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

    if (error.message.includes('Cannot transition')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message,
    });
  }
};

/**
 * @desc    Cancel order
 * @route   POST /api/orders/:orderId/cancel
 * @access  Private
 */
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await orderService.cancelOrder(
      orderId,
      req.user.id,
      reason
    );

    res.json({
      success: true,
      message: 'Order cancelled',
      data: order,
    });
  } catch (error) {
    console.error('Cancel order error:', error);

    if (error.message === 'Order not found') {
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

    if (error.message === 'Order cannot be cancelled') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message,
    });
  }
};

/**
 * @desc    Confirm payment (mock)
 * @route   POST /api/orders/:orderId/payment/confirm
 * @access  Private
 */
export const confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderService.confirmPayment(orderId, req.user.id);

    res.json({
      success: true,
      message: 'Payment confirmed',
      data: order,
    });
  } catch (error) {
    console.error('Confirm payment error:', error);

    if (error.message === 'Order not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message === 'Payment already confirmed') {
      return res.status(400).json({
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
      message: 'Failed to confirm payment',
      error: error.message,
    });
  }
};

/**
 * @desc    Buyer requests refund
 * @route   POST /api/orders/:orderId/refund-request
 * @access  Private
 */
export const requestRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const order = await orderService.requestRefund(orderId, req.user.id, reason);

    res.json({
      success: true,
      message: 'Refund request submitted',
      data: order,
    });
  } catch (error) {
    console.error('Request refund error:', error);

    if (error.message === 'Order not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === 'Unauthorized') {
      return res.status(403).json({ success: false, message: error.message });
    }
    if (
      error.message === 'Order is not eligible for refund' ||
      error.message === 'Refund already requested'
    ) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to submit refund request',
      error: error.message,
    });
  }
};

/**
 * @desc    Get buyer refund requests
 * @route   GET /api/orders/my/refund-requests
 * @access  Private
 */
export const getMyRefundRequests = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await orderService.getMyRefundRequests(req.user.id, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    res.json({
      success: true,
      data: result.requests,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Get my refund requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get refund requests',
      error: error.message,
    });
  }
};

/**
 * @desc    Get seller refund requests
 * @route   GET /api/orders/seller/refunds
 * @access  Private
 */
export const getSellerRefundRequests = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await orderService.getSellerRefundRequests(req.user.id, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    res.json({
      success: true,
      data: result.requests,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Get seller refund requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get seller refund requests',
      error: error.message,
    });
  }
};

/**
 * @desc    Seller processes refund request
 * @route   POST /api/orders/:orderId/refund
 * @access  Private
 */
export const processRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { accept, reason } = req.body;
    const result = await orderService.processRefund(orderId, req.user.id, {
      accept,
      reason,
    });

    res.json({
      success: true,
      message: accept ? 'Refund accepted' : 'Refund rejected',
      data: result,
    });
  } catch (error) {
    console.error('Process refund error:', error);

    if (error.message === 'Order not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === 'Unauthorized') {
      return res.status(403).json({ success: false, message: error.message });
    }
    if (error.message === 'No pending refund request') {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message,
    });
  }
};
