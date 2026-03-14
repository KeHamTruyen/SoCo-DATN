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
 * Update own review by buyer
 * @route PUT /api/reviews/:id
 * @access Private
 */
export const updateOwnReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const updatedReview = await reviewService.updateOwnReview(id, userId, req.body);

    res.json({
      success: true,
      data: updatedReview,
      message: 'Review updated successfully'
    });
  } catch (error) {
    if (error.message === 'Review not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Unauthorized to update this review') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    next(error);
  }
};

/**
 * Delete own review by buyer
 * @route DELETE /api/reviews/:id
 * @access Private
 */
export const deleteOwnReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await reviewService.deleteOwnReview(id, userId);

    res.json({
      success: true,
      data: result,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    if (error.message === 'Review not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Unauthorized to delete this review') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

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

/**
 * Admin: get reviews for moderation.
 * @route GET /api/reviews/admin
 * @access Private (Admin only)
 */
export const getReviewsForModeration = async (req, res, next) => {
  try {
    const result = await reviewService.getReviewsForModeration(req.query);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: publish/unpublish a review.
 * @route PATCH /api/reviews/:id/moderation
 * @access Private (Admin only)
 */
export const moderateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    const review = await reviewService.setReviewPublishedStatus(id, isPublished);

    res.json({
      success: true,
      message: isPublished ? 'Review published successfully' : 'Review unpublished successfully',
      data: review
    });
  } catch (error) {
    if (error.message === 'Review not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    next(error);
  }
};
