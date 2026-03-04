import api from './api';

// =====================================================
// TYPES
// =====================================================

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity?: string;
  shippingDistrict?: string;
  shippingWard?: string;
  shippingNote?: string;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paidAt?: string;
  status: OrderStatus;
  trackingNumber?: string;
  carrier?: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  buyer?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl?: string;
  };
  items: OrderItem[];
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  sellerId: string;
  productName: string;
  productImageUrl?: string;
  variantInfo?: any;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  review?: {
    id: string;
    rating: number;
  };
  product?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    status: string;
  };
  seller?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl?: string;
  };
}

export interface CreateOrderRequest {
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity?: string;
  shippingDistrict?: string;
  shippingWard?: string;
  shippingNote?: string;
  paymentMethod: 'COD' | 'BANK_TRANSFER' | 'MOMO' | 'VNPAY' | 'ZALOPAY';
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface CancelOrderRequest {
  reason?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =====================================================
// ORDER SERVICE
// =====================================================

const orderService = {
  /**
   * Create new order from cart
   */
  createOrder: async (data: CreateOrderRequest): Promise<ApiResponse<Order>> => {
    const response = await api.post<ApiResponse<Order>>('/orders', data);
    return response.data;
  },

  /**
   * Get order by ID
   */
  getOrder: async (orderId: string): Promise<ApiResponse<Order>> => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Get user's orders (as buyer)
   */
  getMyOrders: async (filters?: OrderFilters): Promise<PaginatedResponse<Order>> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get<PaginatedResponse<Order>>(
      `/orders/my/purchases?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get seller's orders (as seller)
   */
  getMySales: async (filters?: OrderFilters): Promise<PaginatedResponse<Order>> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get<PaginatedResponse<Order>>(
      `/orders/my/sales?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (
    orderId: string,
    data: UpdateOrderStatusRequest
  ): Promise<ApiResponse<Order>> => {
    const response = await api.put<ApiResponse<Order>>(
      `/orders/${orderId}/status`,
      data
    );
    return response.data;
  },

  /**
   * Cancel order
   */
  cancelOrder: async (
    orderId: string,
    data?: CancelOrderRequest
  ): Promise<ApiResponse<Order>> => {
    const response = await api.post<ApiResponse<Order>>(
      `/orders/${orderId}/cancel`,
      data || {}
    );
    return response.data;
  },

  /**
   * Confirm payment (mock for development)
   */
  confirmPayment: async (orderId: string): Promise<ApiResponse<Order>> => {
    const response = await api.post<ApiResponse<Order>>(
      `/orders/${orderId}/payment/confirm`
    );
    return response.data;
  },

  requestRefund: async (
    orderId: string,
    data?: { reason?: string }
  ): Promise<ApiResponse<Order>> => {
    const response = await api.post<ApiResponse<Order>>(
      `/orders/${orderId}/refund-request`,
      data || {}
    );
    return response.data;
  },

  getMyRefundRequests: async (filters?: { page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    const response = await api.get(
      `/orders/my/refund-requests?${params.toString()}`
    );
    return response.data;
  },

  getSellerRefundRequests: async (filters?: { page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    const response = await api.get(`/orders/seller/refunds?${params.toString()}`);
    return response.data;
  },

  processRefund: async (
    orderId: string,
    data: { accept: boolean; reason?: string }
  ): Promise<ApiResponse<Order>> => {
    const response = await api.post<ApiResponse<Order>>(
      `/orders/${orderId}/refund`,
      data
    );
    return response.data;
  },
};

export default orderService;
