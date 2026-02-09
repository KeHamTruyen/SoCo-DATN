import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { ProfilePage } from './components/ProfilePage';
import { BecomeSellerPage } from './components/BecomeSellerPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CartPage } from './components/CartPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { MessagesPage } from './components/MessagesPage';
import { NotificationsPage } from './components/NotificationsPage';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { ProductManagementPage } from './components/seller/ProductManagementPage';
import { OrderManagementPage } from './components/seller/OrderManagementPage';
import { AddProductPage } from './components/seller/AddProductPage';
import { SchedulePostsPage } from './components/SchedulePostsPage';
import { GroupsPage } from './components/GroupsPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SettingsPage } from './components/SettingsPage';
import { StorePage } from './components/StorePage';
import { MarketplacePage } from './components/MarketplacePage';
import { SearchResultsPage } from './components/SearchResultsPage';
import { GroupDetailPage } from './components/GroupDetailPage';
import { PostDetailPage } from './components/PostDetailPage';
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

type Page = 
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'home'
  | 'profile'
  | 'become-seller'
  | 'product-detail'
  | 'cart'
  | 'messages'
  | 'notifications'
  | 'seller-dashboard'
  | 'product-management'
  | 'order-management'
  | 'add-product'
  | 'schedule-posts'
  | 'groups'
  | 'admin-dashboard'
  | 'settings'
  | 'store'
  | 'marketplace'
  | 'search-results'
  | 'group-detail'
  | 'post-detail'
  | 'checkout';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCurrentPage('login');
    setCart([]);
  };

  const handleNavigate = (page: Page, productId?: string) => {
    setCurrentPage(page);
    if (productId) {
      setSelectedProductId(productId);
    }
  };

  const handleBecomeSeller = () => {
    if (currentUser) {
      setCurrentUser(prev => prev ? ({
        ...prev,
        role: 'seller',
        isVerified: true
      }) : null);
    }
    setCurrentPage('seller-dashboard');
  };

  const addToCart = (product: Product, variant?: { [key: string]: string }) => {
    setCart(prev => {
      const existing = prev.find(item => 
        item.product.id === product.id && 
        JSON.stringify(item.selectedVariant) === JSON.stringify(variant)
      );
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && 
          JSON.stringify(item.selectedVariant) === JSON.stringify(variant)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selectedVariant: variant }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number, variant?: { [key: string]: string }) => {
    if (quantity === 0) {
      setCart(prev => prev.filter(item => 
        !(item.product.id === productId && 
          JSON.stringify(item.selectedVariant) === JSON.stringify(variant))
      ));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.product.id === productId && 
          JSON.stringify(item.selectedVariant) === JSON.stringify(variant)
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  if (!isLoggedIn) {
    if (currentPage === 'register') {
      return <RegisterPage onNavigate={() => setCurrentPage('login')} />;
    }
    if (currentPage === 'forgot-password') {
      return <ForgotPasswordPage onNavigate={() => setCurrentPage('login')} />;
    }
    return <LoginPage 
      onLogin={handleLogin} 
      onNavigate={() => setCurrentPage('register')}
      onForgotPassword={() => setCurrentPage('forgot-password')}
    />;
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'home' && (
        <HomePage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          cartItemCount={cart.length}
          onAddToCart={addToCart}
        />
      )}
      {currentPage === 'profile' && (
        <ProfilePage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'become-seller' && (
        <BecomeSellerPage
          onNavigate={handleNavigate}
          onComplete={handleBecomeSeller}
        />
      )}
      {currentPage === 'product-detail' && selectedProductId && (
        <ProductDetailPage
          productId={selectedProductId}
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onAddToCart={addToCart}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'cart' && (
        <CartPage
          currentUser={currentUser}
          cart={cart}
          onNavigate={handleNavigate}
          onUpdateQuantity={updateCartQuantity}
          onClearCart={clearCart}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'messages' && (
        <MessagesPage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'notifications' && (
        <NotificationsPage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'seller-dashboard' && currentUser.role === 'seller' && (
        <SellerDashboard
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'product-management' && currentUser.role === 'seller' && (
        <ProductManagementPage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'order-management' && currentUser.role === 'seller' && (
        <OrderManagementPage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'add-product' && currentUser.role === 'seller' && (
        <AddProductPage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onAddProduct={(product) => {
            console.log('Product added:', product);
            // In real app, this would save to database
          }}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'schedule-posts' && (
        <SchedulePostsPage
          currentUser={currentUser}
          onNavigate={handleNavigate}
        />
      )}
      {currentPage === 'groups' && (
        <GroupsPage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'admin-dashboard' && currentUser.role === 'admin' && (
        <AdminDashboard
          currentUser={currentUser}
          onNavigate={handleNavigate}
        />
      )}
      {currentPage === 'settings' && (
        <SettingsPage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'store' && (
        <StorePage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onAddToCart={addToCart}
        />
      )}
      {currentPage === 'marketplace' && (
        <MarketplacePage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onAddToCart={addToCart}
          cartItemCount={cart.length}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'search-results' && (
        <SearchResultsPage
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onAddToCart={addToCart}
        />
      )}
      {currentPage === 'group-detail' && selectedProductId && (
        <GroupDetailPage
          currentUser={currentUser}
          groupId={selectedProductId}
          onNavigate={handleNavigate}
        />
      )}
      {currentPage === 'post-detail' && selectedProductId && (
        <PostDetailPage
          currentUser={currentUser}
          postId={selectedProductId}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'checkout' && (
        <CheckoutPage
          currentUser={currentUser}
          cart={cart}
          onNavigate={handleNavigate}
          onClearCart={clearCart}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}