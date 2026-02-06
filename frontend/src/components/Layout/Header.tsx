import { ShoppingCart, MessageCircle, Search, Bell, User, Store, LogOut, Settings, Calendar, Users, LayoutDashboard } from 'lucide-react';
import { NotificationCenter } from '../NotificationCenter';

interface HeaderProps {
  currentUser: any;
  onNavigate: (page: string, id?: string) => void;
  onLogout: () => void;
  cartItemCount?: number;
  showSearch?: boolean;
  variant?: 'default' | 'simple'; // default: full header, simple: back button only
  backButton?: {
    show: boolean;
    onClick: () => void;
    label?: string;
  };
  title?: string;
}

export function Header({ 
  currentUser, 
  onNavigate, 
  onLogout, 
  cartItemCount = 0,
  showSearch = true,
  variant = 'default',
  backButton,
  title
}: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('search-results');
    }
  };

  // Simple header with back button
  if (variant === 'simple') {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {backButton?.show && (
              <button
                onClick={backButton.onClick}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {backButton.label && <span>{backButton.label}</span>}
              </button>
            )}
            {title && (
              <h1 className="text-lg font-semibold text-gray-900 flex-1 text-center">{title}</h1>
            )}
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>
    );
  }

  // Full header with all features
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center gap-8">
            <button onClick={() => onNavigate('home')}>
              <h1 className="text-xl font-bold text-blue-600">Social Commerce</h1>
            </button>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => onNavigate('marketplace')}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Marketplace
              </button>
              <button 
                onClick={() => onNavigate('groups')}
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Nhóm
              </button>
            </nav>

            {/* Search Bar */}
            {showSearch && (
              <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-96">
                <Search className="w-5 h-5 text-gray-400" />
                <form onSubmit={handleSearch} className="w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm, người bán..."
                    className="bg-transparent border-none outline-none ml-2 w-full"
                  />
                </form>
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-6">
            {/* Notifications */}
            <NotificationCenter onNavigate={onNavigate} />

            {/* Messages */}
            <button 
              className="relative"
              onClick={() => onNavigate('messages')}
            >
              <MessageCircle className="w-6 h-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                2
              </span>
            </button>

            {/* Cart */}
            <button 
              className="relative"
              onClick={() => onNavigate('cart')}
            >
              <ShoppingCart className="w-6 h-6 text-gray-600" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)}>
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </button>

              {showUserMenu && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{currentUser.name}</p>
                          <p className="text-sm text-gray-500">@{currentUser.username}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate('profile');
                        }}
                      >
                        <User className="w-4 h-4" />
                        Trang cá nhân
                      </button>

                      <button
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                        onClick={() => {
                          setShowUserMenu(false);
                          onNavigate('settings');
                        }}
                      >
                        <Settings className="w-4 h-4" />
                        Cài đặt
                      </button>

                      {/* Seller Options */}
                      {currentUser.role === 'seller' && (
                        <>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                            onClick={() => {
                              setShowUserMenu(false);
                              onNavigate('seller-dashboard');
                            }}
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Bảng điều khiển
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                            onClick={() => {
                              setShowUserMenu(false);
                              onNavigate('store', currentUser.id);
                            }}
                          >
                            <Store className="w-4 h-4" />
                            Cửa hàng của tôi
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                            onClick={() => {
                              setShowUserMenu(false);
                              onNavigate('schedule-posts');
                            }}
                          >
                            <Calendar className="w-4 h-4" />
                            Lịch đăng bài
                          </button>
                        </>
                      )}

                      {/* Buyer - Become Seller */}
                      {currentUser.role === 'buyer' && (
                        <>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-3"
                            onClick={() => {
                              setShowUserMenu(false);
                              onNavigate('become-seller');
                            }}
                          >
                            <Store className="w-4 h-4" />
                            Trở thành người bán
                          </button>
                        </>
                      )}

                      {/* Admin Options */}
                      {currentUser.role === 'admin' && (
                        <>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 flex items-center gap-3"
                            onClick={() => {
                              setShowUserMenu(false);
                              onNavigate('admin-dashboard');
                            }}
                          >
                            <Users className="w-4 h-4" />
                            Quản trị hệ thống
                          </button>
                        </>
                      )}

                      {/* Logout */}
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// Import React at top
import React from 'react';
