import api from './api';

// =====================================================
// TYPES
// =====================================================

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  selectedVariant?: any;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    status: string;
    trackInventory: boolean;
    stockQuantity: number;
    images: Array<{
      id: string;
      imageUrl: string;
      isPrimary: boolean;
    }>;
    seller: {
      id: string;
      username: string;
      fullName: string;
      avatarUrl?: string;
    };
  };
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity?: number;
  selectedVariant?: any;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// =====================================================
// CART SERVICE
// =====================================================

const cartService = {
  /**
   * Get user's cart
   */
  getCart: async (): Promise<ApiResponse<Cart>> => {
    const response = await api.get<ApiResponse<Cart>>('/cart');
    return response.data;
  },

  /**
   * Get cart items count
   */
  getCartCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await api.get<ApiResponse<{ count: number }>>('/cart/count');
    return response.data;
  },

  /**
   * Add item to cart
   */
  addToCart: async (data: AddToCartRequest): Promise<ApiResponse<Cart>> => {
    const response = await api.post<ApiResponse<Cart>>('/cart/items', data);
    return response.data;
  },

  /**
   * Update cart item quantity
   */
  updateCartItem: async (
    itemId: string,
    data: UpdateCartItemRequest
  ): Promise<ApiResponse<Cart>> => {
    const response = await api.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, data);
    return response.data;
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (itemId: string): Promise<ApiResponse<Cart>> => {
    const response = await api.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`);
    return response.data;
  },

  /**
   * Clear cart
   */
  clearCart: async (): Promise<ApiResponse<Cart>> => {
    const response = await api.delete<ApiResponse<Cart>>('/cart');
    return response.data;
  },
};

export default cartService;
