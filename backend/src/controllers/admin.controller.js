import * as adminService from '../services/admin.service.js';

export const getDashboard = async (req, res, next) => {
  try {
    const data = await adminService.getDashboardOverview();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const result = await adminService.getUsers(req.query);
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

export const setUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await adminService.setUserActiveStatus(userId, isActive);
    res.json({
      success: true,
      message: isActive ? 'User has been unbanned' : 'User has been banned',
      data: user
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const verifySeller = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { action, rejectionReason } = req.body;

    const result = await adminService.verifySeller(req.user.id, userId, action, rejectionReason);
    res.json({
      success: true,
      message: action === 'approve' ? 'Seller verified successfully' : 'Seller verification rejected',
      data: result
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ success: false, message: error.message });
    }

    if (error.message === 'Invalid action') {
      return res.status(400).json({ success: false, message: error.message });
    }

    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const result = await adminService.getProductsForModeration(req.query);
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

export const updateProductStatus = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { status } = req.body;

    const product = await adminService.updateProductModerationStatus(productId, status);
    res.json({ success: true, message: 'Product status updated', data: product });
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const result = await adminService.getOrdersForAdmin(req.query);
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await adminService.updateOrderStatusByAdmin(orderId, status);
    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    if (error.message === 'Order not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const getReportsSummary = async (req, res, next) => {
  try {
    const data = await adminService.getAnalyticsSummary(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAdvancedAnalyticsDashboard = async (req, res, next) => {
  try {
    const data = await adminService.getAdvancedAnalyticsDashboard(req.query);
    res.json({ success: true, data });
  } catch (error) {
    if (error.message === 'Invalid startDate' || error.message === 'Invalid endDate' || error.message === 'startDate must be before or equal to endDate') {
      return res.status(400).json({ success: false, message: error.message });
    }

    next(error);
  }
};
