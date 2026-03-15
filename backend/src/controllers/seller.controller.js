import * as sellerService from '../services/seller.service.js';

/**
 * Get seller statistics and dashboard data
 * @route GET /api/seller/stats
 * @access Private (Seller only)
 */
export const getStats = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const data = await sellerService.getStats(sellerId);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getVerificationStatus = async (req, res, next) => {
  try {
    const data = await sellerService.getVerificationStatus(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const uploadVerificationFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Verification document uploaded successfully',
      data: {
        documentType: req.body.documentType,
        url: req.file.path,
        publicId: req.file.filename,
        resourceType: req.file.resource_type
      }
    });
  } catch (error) {
    next(error);
  }
};

export const submitStep1 = async (req, res, next) => {
  try {
    const data = await sellerService.submitVerificationStep1(req.user.id, req.body);
    res.json({
      success: true,
      message: 'Seller verification step 1 saved',
      data
    });
  } catch (error) {
    if (error.message === 'Invalid dateOfBirth' || error.message === 'Seller verification has already been approved') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const submitStep2 = async (req, res, next) => {
  try {
    const data = await sellerService.submitVerificationStep2(req.user.id, req.body);
    res.json({
      success: true,
      message: 'Seller verification step 2 saved',
      data
    });
  } catch (error) {
    if (error.message === 'Seller verification has already been approved') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const submitStep3 = async (req, res, next) => {
  try {
    const data = await sellerService.submitVerificationStep3(req.user.id, req.body);
    res.json({
      success: true,
      message: 'Seller verification step 3 saved',
      data
    });
  } catch (error) {
    if (error.message === 'Seller verification has already been approved') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const submitVerificationForReview = async (req, res, next) => {
  try {
    const data = await sellerService.submitVerificationForReview(req.user.id);
    res.json({
      success: true,
      message: 'Seller verification submitted for review',
      data
    });
  } catch (error) {
    if (
      error.message === 'Seller verification has already been approved'
      || error.message === 'All verification steps must be completed before submission'
      || error.message === 'Step 1 information is incomplete'
      || error.message === 'Step 2 information is incomplete'
      || error.message === 'Step 3 information is incomplete'
    ) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};
