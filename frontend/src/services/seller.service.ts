import api, { type ApiResponse } from './api';
import type { Order } from './order.service';

export interface SellerStats {
  revenue: {
    total: number;
    currency: string;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipping: number;
    completed: number;
    cancelled: number;
    refunded: number;
  };
  products: {
    total: number;
    active: number;
  };
  rating: {
    average: number;
    count: number;
  };
  recentOrders: Order[];
  topProducts: TopProduct[];
}

export interface TopProduct {
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  } | null;
  totalSold: number;
  orderCount: number;
}

class SellerService {
  /**
   * Get seller statistics and dashboard data
   */
  async getStats(): Promise<ApiResponse<SellerStats>> {
    const response = await api.get('/seller/stats');
    return response.data;
  }
}

export const sellerService = new SellerService();
export default sellerService;
