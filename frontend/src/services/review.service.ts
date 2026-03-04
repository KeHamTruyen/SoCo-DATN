import api from './api';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  orderItemId?: string;
  rating: number;
  title?: string;
  content?: string;
  images: string[];
  sellerResponse?: string;
  sellerResponseAt?: string;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl?: string;
  };
  product?: {
    id: string;
    name: string;
    slug: string;
  };
}

const reviewService = {
  getProductReviews: async (
    productId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{
    success: boolean;
    data: Review[];
    ratingDistribution?: Record<string, number>;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const response = await api.get(
      `/reviews/product/${productId}${query.toString() ? `?${query.toString()}` : ''}`
    );
    return response.data;
  },

  createReview: async (payload: {
    orderItemId: string;
    rating: number;
    title?: string;
    content?: string;
    images?: string[];
  }): Promise<{ success: boolean; message?: string; data: Review }> => {
    const response = await api.post('/reviews', payload);
    return response.data;
  },

  replyReview: async (
    reviewId: string,
    payload: { reply: string }
  ): Promise<{ success: boolean; message?: string; data: Review }> => {
    const response = await api.post(`/reviews/${reviewId}/reply`, payload);
    return response.data;
  },
};

export default reviewService;
