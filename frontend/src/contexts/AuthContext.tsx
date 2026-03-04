import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { LoginData, RegisterData } from '../services/auth.service';

interface User {
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
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<{ requires2FA?: boolean; tempToken?: string }>;
  verify2FA: (data: { tempToken: string; otpCode: string }) => Promise<void>;
  register: (data: RegisterData) => Promise<{ requiresVerification?: boolean }>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const initAuth = async () => {
      try {
        const token = authService.getToken();
        const savedUser = authService.getCurrentUser();
        
        console.log('🔐 Auth Init:', { hasToken: !!token, hasSavedUser: !!savedUser });
        
        // If no token, user is not logged in
        if (!token) {
          console.log('❌ No token found, user not logged in');
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Load user from localStorage immediately to prevent flash
        if (savedUser) {
          console.log('✅ Loading cached user:', savedUser.username);
          setUser(savedUser);
        }
        
        // Then verify token with API
        try {
          const response = await authService.getProfile();
          console.log('✅ Token verified, user updated:', response.data.user.username);
          setUser(response.data.user);
        } catch (apiErr: any) {
          console.warn('⚠️ Failed to verify token:', apiErr.message);
          
          // Only clear auth if token is actually invalid (401)
          if (apiErr.response?.status === 401) {
            console.error('❌ Token invalid (401), logging out');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          } else {
            // Network error or backend down - keep user logged in with cached data
            console.warn('⚠️ Network error, keeping cached user');
            // If we have savedUser, make sure it's set (in case it wasn't set above)
            if (savedUser) {
              setUser(savedUser);
            }
          }
        }
      } catch (err) {
        console.error('❌ Failed to initialize auth:', err);
        // Even if outer try fails, if we have token and savedUser, keep user logged in
        const token = authService.getToken();
        const savedUser = authService.getCurrentUser();
        if (token && savedUser) {
          console.log('✅ Keeping cached user despite outer error');
          setUser(savedUser);
        }
      } finally {
        setLoading(false);
        console.log('✅ Auth initialization complete');
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(data);
      if (response.data.requires2FA) {
        return {
          requires2FA: true,
          tempToken: response.data.tempToken,
        };
      }
      if (response.data.user) {
        setUser(response.data.user);
      }
      return {};
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      await authService.register(data);
      return { requiresVerification: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0]?.message ||
                          err.response?.data?.errors?.[0]?.msg || 
                          'Đăng ký thất bại';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async (data: { tempToken: string; otpCode: string }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.verify2FA(data);
      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Xác thực 2FA thất bại';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.updateProfile(data);
      setUser(response.data.user);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Cập nhật thất bại';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        verify2FA,
        register,
        logout,
        updateProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
