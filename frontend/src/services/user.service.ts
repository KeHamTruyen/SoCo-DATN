import api from './api';

// =====================================================
// TYPES
// =====================================================

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  _count?: {
    products?: number;
    followers?: number;
    following?: number;
    orders?: number;
    reviews?: number;
  };
  products?: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    images: Array<{
      imageUrl: string;
      isPrimary: boolean;
    }>;
  }>;
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
// USER SERVICE
// =====================================================

const userService = {
  /**
   * Get user profile by username
   */
  getUserByUsername: async (username: string): Promise<ApiResponse<UserProfile>> => {
    const response = await api.get<ApiResponse<UserProfile>>(`/users/username/${username}`);
    return response.data;
  },

  /**
   * Get user profile by ID
   */
  getUserById: async (userId: string): Promise<ApiResponse<UserProfile>> => {
    const response = await api.get<ApiResponse<UserProfile>>(`/users/${userId}`);
    return response.data;
  },

  /**
   * Get current user profile
   */
  getMyProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await api.get<ApiResponse<UserProfile>>('/users/me');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put<ApiResponse<User>>('/users/me', data);
    return response.data;
  },
};

export default userService;
