import api, { type ApiResponse } from './api';

export interface Review {
  id: string;
  productId: string;
  orderItemId?: string;
  userId: string;
  rating: number;
  title?: string;
  content?: string;
  images: string[];
  sellerResponse?: string;
  sellerResponseAt?: string;
  helpfulCount: number;
  isVerifiedPurchase: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    images: string[];
    price: number;
  };
  user?: {
    id: string;
    username: string;
    fullName?: string;
    avatarUrl?: string;
  };
  orderItem?: {
    id: string;
    quantity: number;
  };
}

export interface ReviewFilters {
  hasResponse?: 'true' | 'false';
  page?: number;
  limit?: number;
}

export interface ProductReviewFilters {
  page?: number;
  limit?: number;
}

export interface RespondToReviewRequest {
  response: string;
}

export interface CreateReviewRequest {
  productId: string;
  orderItemId?: string;
  rating: number;
  title?: string;
  content?: string;
  images?: string[];
}

export interface ReviewListResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductReviewListResponse extends ReviewListResponse {
  averageRating: number;
  ratingCount: number;
}

class ReviewService {
  /**
   * Get product reviews
   */
  async getProductReviews(
    productId: string,
    filters?: ProductReviewFilters
  ): Promise<ApiResponse<ProductReviewListResponse>> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const query = params.toString();
    const response = await api.get(
      `/reviews/product/${productId}${query ? `?${query}` : ''}`
    );
    return response.data;
  }

  /**
   * Buyer creates a review
   */
  async createReview(data: CreateReviewRequest): Promise<ApiResponse<Review>> {
    const response = await api.post('/reviews', data);
    return response.data;
  }

  /**
   * Get seller's product reviews
   */
  async getMyReviews(filters?: ReviewFilters): Promise<ApiResponse<ReviewListResponse>> {
    const params = new URLSearchParams();
    if (filters?.hasResponse) params.append('hasResponse', filters.hasResponse);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/reviews/seller/me?${params.toString()}`);
    return response.data;
  }

  /**
   * Respond to a review
   */
  async respondToReview(reviewId: string, data: RespondToReviewRequest): Promise<ApiResponse<Review>> {
    const response = await api.post(`/reviews/${reviewId}/response`, data);
    return response.data;
  }

  /**
   * Delete seller response
   */
  async deleteResponse(reviewId: string): Promise<ApiResponse<Review>> {
    const response = await api.delete(`/reviews/${reviewId}/response`);
    return response.data;
  }
}

export const reviewService = new ReviewService();
export default reviewService;
