import api from './api';

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  fullName: string;
  phone: string;
  role?: 'BUYER' | 'SELLER';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      username: string;
      fullName: string;
      phone: string | null;
      avatarUrl: string | null;
      coverImage: string | null;
      bio: string | null;
      address: string | null;
      role: 'BUYER' | 'SELLER' | 'ADMIN';
      isActive: boolean;
      isVerified: boolean;
      createdAt: string;
      _count?: {
        followers: number;
        following: number;
        products: number;
        posts: number;
      };
    };
    token: string;
  };
}

export interface UpdateProfileData {
  fullName?: string;
  username?: string;
  phone?: string;
  bio?: string;
  address?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  async getProfile(): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>('/auth/me');
    if (response.data.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  async updateProfile(data: UpdateProfileData): Promise<AuthResponse> {
    const response = await api.put<AuthResponse>('/auth/profile', data);
    if (response.data.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  }

  async changePassword(data: ChangePasswordData): Promise<{ success: boolean; message: string }> {
    const response = await api.put('/auth/password', data);
    return response.data;
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default new AuthService();
