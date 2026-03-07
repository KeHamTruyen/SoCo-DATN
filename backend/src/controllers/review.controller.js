import * as reviewService from '../services/review.service.js';

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
