import * as reviewService from '../services/review.service.js';

/**
 * Get product reviews for buyers
 * @route GET /api/reviews/product/:productId
 * @access Public
 */
export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page, limit } = req.query;

    const result = await reviewService.getProductReviews(productId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create review by buyer
 * @route POST /api/reviews
 * @access Private
 */
export const createReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const review = await reviewService.createReview(userId, req.body);

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get seller's product reviews
 * @route GET /api/reviews/seller/me
 * @access Private (Seller only)
 */
export const getMyReviews = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const { hasResponse, page, limit } = req.query;

    const result = await reviewService.getSellerReviews(sellerId, {
      hasResponse,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Respond to a review
 * @route POST /api/reviews/:id/response
 * @access Private (Seller only)
 */
export const respondToReview = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const { id } = req.params;
    const { response } = req.body;

    if (!response || response.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Response is required'
      });
    }

    if (response.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Response must be less than 1000 characters'
      });
    }

    const updatedReview = await reviewService.respondToReview(id, sellerId, response);

    res.json({
      success: true,
      data: updatedReview,
      message: 'Response added successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete seller response
 * @route DELETE /api/reviews/:id/response
 * @access Private (Seller only)
 */
export const deleteResponse = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const { id } = req.params;

    const updatedReview = await reviewService.deleteSellerResponse(id, sellerId);

    res.json({
      success: true,
      data: updatedReview,
      message: 'Response deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
