import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicRoute } from './components/routes/PublicRoute';
import { ProtectedRoute, RoleRoute } from './components/routes/ProtectedRoute';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { HomePage } from './components/HomePage';
import { ProfilePage } from './components/ProfilePage';
import { BecomeSellerPage } from './components/BecomeSellerPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CartPage } from './components/CartPage';
import { MessagesPage } from './components/MessagesPage';
import { NotificationsPage } from './components/NotificationsPage';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { ProductManagementPage } from './components/seller/ProductManagementPage';
import { OrderManagementPage } from './components/seller/OrderManagementPage';
import { AddProductPage } from './components/seller/AddProductPage';
import { SchedulePostsPage } from './components/SchedulePostsPage';
import { GroupsPage } from './components/GroupsPage';
import { GroupDetailPage } from './components/GroupDetailPage';
import { PostDetailPage } from './components/PostDetailPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SettingsPage } from './components/SettingsPage';
import { StorePage } from './components/StorePage';
import { MarketplacePage } from './components/MarketplacePage';
import { SearchResultsPage } from './components/SearchResultsPage';
import { CheckoutPage } from './components/CheckoutPage';

export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  coverImage?: string;
  role: UserRole;
  isVerified: boolean;
  followers: number;
  following: number;
  bio?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerUsername: string;
  title: string;
  price: number;
  image: string;
  description: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
  category: string;
  stock: number;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  name: string;
  options: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: { [key: string]: string };
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'order' | 'review' | 'message';
  content: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Redirect to /home if already logged in */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        } />

        {/* Protected Routes - Require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/store/:username" element={<StorePage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/group/:id" element={<GroupDetailPage />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
          <Route path="/schedule-posts" element={<SchedulePostsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/become-seller" element={<BecomeSellerPage />} />
        </Route>

        {/* Seller Routes - Require SELLER or ADMIN role */}
        <Route element={<RoleRoute allowedRoles={['SELLER', 'ADMIN']} />}>
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/products" element={<ProductManagementPage />} />
          <Route path="/seller/products/add" element={<AddProductPage />} />
          <Route path="/seller/orders" element={<OrderManagementPage />} />
        </Route>

        {/* Admin Routes - Require ADMIN role */}
        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
