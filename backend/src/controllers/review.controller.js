import * as reviewService from '../services/review.service.js';

export const createReview = async (req, res) => {
  try {
    const review = await reviewService.createReview(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  } catch (error) {
    console.error('Create review error:', error);

    if (error.message === 'Order item not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === 'Unauthorized') {
      return res.status(403).json({ success: false, message: error.message });
    }
    if (
      error.message === 'Order item is not eligible for review' ||
      error.message === 'You already reviewed this item'
    ) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message,
    });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { page, limit, rating, hasMedia, hasSellerReply, sortBy, sortOrder } = req.query;
    const result = await reviewService.getProductReviews(req.params.productId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      rating: rating ? parseInt(rating, 10) : undefined,
      hasMedia:
        typeof hasMedia === 'string' ? hasMedia === 'true' : undefined,
      hasSellerReply:
        typeof hasSellerReply === 'string' ? hasSellerReply === 'true' : undefined,
      sortBy: typeof sortBy === 'string' ? sortBy : undefined,
      sortOrder: typeof sortOrder === 'string' ? sortOrder : undefined,
    });

    res.json({
      success: true,
      data: result.reviews,
      ratingDistribution: result.ratingDistribution,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get product reviews',
      error: error.message,
    });
  }
};

export const replyReview = async (req, res) => {
  try {
    const review = await reviewService.replyReview(
      req.params.reviewId,
      req.user.id,
      req.body.reply
    );

    res.status(201).json({
      success: true,
      message: 'Reply submitted successfully',
      data: review,
    });
  } catch (error) {
    console.error('Reply review error:', error);

    if (error.message === 'Review not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === 'Unauthorized') {
      return res.status(403).json({ success: false, message: error.message });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to reply review',
      error: error.message,
    });
  }
};
