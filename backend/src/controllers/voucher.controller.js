import voucherService from '../services/voucher.service.js';

export const createVoucher = async (req, res, next) => {
  try {
    const voucher = await voucherService.createVoucher(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Voucher created successfully',
      data: { voucher },
    });
  } catch (error) {
    if (error.message.includes('code already exists')) {
      return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const applyVoucher = async (req, res, next) => {
  try {
    const result = await voucherService.applyVoucher(
      req.user.id,
      req.body.voucherCode,
      req.body.subtotal,
      {
        categoryIds: req.body.categoryIds,
        productIds: req.body.productIds,
        sellerId: req.body.sellerId,
      },
    );
    res.json({
      success: true,
      message: 'Voucher applied successfully',
      data: result,
    });
  } catch (error) {
    if (
      error.message.includes('not found') ||
      error.message.includes('not eligible') ||
      error.message.includes('not active') ||
      error.message.includes('expired') ||
      error.message.includes('limit') ||
      error.message.includes('Minimum')
    ) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const listVouchers = async (req, res, next) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      status: req.query.status,
      type: req.query.type,
      sellerId: req.query.sellerId,
      includeExpired: req.query.includeExpired === 'true',
    };

    const result = await voucherService.listVouchers(filters);
    res.json({
      success: true,
      data: result.vouchers,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getVoucherById = async (req, res, next) => {
  try {
    const voucher = await voucherService.getVoucherById(req.params.id);
    res.json({
      success: true,
      data: { voucher },
    });
  } catch (error) {
    if (error.message === 'Voucher not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const updateVoucher = async (req, res, next) => {
  try {
    const voucher = await voucherService.updateVoucher(
      req.params.id,
      req.user.id,
      req.body,
    );
    res.json({
      success: true,
      message: 'Voucher updated successfully',
      data: { voucher },
    });
  } catch (error) {
    if (error.message === 'Unauthorized to update this voucher') {
      return res.status(403).json({ success: false, message: error.message });
    }
    if (error.message === 'Voucher not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const deactivateVoucher = async (req, res, next) => {
  try {
    const voucher = await voucherService.deactivateVoucher(
      req.params.id,
      req.user.id,
    );
    res.json({
      success: true,
      message: 'Voucher deactivated',
      data: { voucher },
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const getUserAvailableVouchers = async (req, res, next) => {
  try {
    const vouchers = await voucherService.getUserAvailableVouchers(req.user.id);
    res.json({
      success: true,
      data: { vouchers },
    });
  } catch (error) {
    next(error);
  }
};

export const getVoucherByCode = async (req, res, next) => {
  try {
    const voucher = await voucherService.getVoucherByCode(req.params.code);
    res.json({
      success: true,
      data: { voucher },
    });
  } catch (error) {
    if (error.message === 'Voucher not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};
