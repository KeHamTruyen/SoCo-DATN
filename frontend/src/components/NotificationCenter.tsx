import { useState } from 'react';
import { Bell, Heart, MessageCircle, ShoppingCart, UserPlus, AtSign, Package, Tag, X, Check, Trash2, Settings } from 'lucide-react';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'order' | 'follow' | 'mention' | 'system' | 'product';
  title: string;
  message: string;
  avatar?: string;
  image?: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

interface NotificationCenterProps {
  onNavigate: (page: any, data?: any) => void;
}

export function NotificationCenter({ onNavigate }: NotificationCenterProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'like',
      title: 'Minh Anh',
      message: 'đã thích bài viết của bạn',
      avatar: 'https://i.pravatar.cc/150?img=5',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100',
      timestamp: '2 phút trước',
      isRead: false
    },
    {
      id: '2',
      type: 'comment',
      title: 'Quang Huy',
      message: 'đã bình luận: "Sản phẩm này có màu xanh không shop?"',
      avatar: 'https://i.pravatar.cc/150?img=12',
      timestamp: '15 phút trước',
      isRead: false
    },
    {
      id: '3',
      type: 'order',
      title: 'Đơn hàng mới',
      message: 'Bạn có 1 đơn hàng mới trị giá 850,000đ',
      avatar: 'https://i.pravatar.cc/150?img=25',
      timestamp: '1 giờ trước',
      isRead: false
    },
    {
      id: '4',
      type: 'follow',
      title: 'Thu Hà',
      message: 'đã bắt đầu theo dõi bạn',
      avatar: 'https://i.pravatar.cc/150?img=9',
      timestamp: '2 giờ trước',
      isRead: true
    },
    {
      id: '5',
      type: 'mention',
      title: 'Văn Đức',
      message: 'đã nhắc đến bạn trong một bình luận',
      avatar: 'https://i.pravatar.cc/150?img=33',
      timestamp: '3 giờ trước',
      isRead: true
    },
    {
      id: '6',
      type: 'product',
      title: 'Sản phẩm được tag',
      message: 'Lan Anh đã tag sản phẩm của bạn vào bài viết',
      avatar: 'https://i.pravatar.cc/150?img=47',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100',
      timestamp: '5 giờ trước',
      isRead: true
    },
    {
      id: '7',
      type: 'system',
      title: 'Cập nhật hệ thống',
      message: 'Phiên bản mới với tính năng AI đã được ra mắt! 🎉',
      timestamp: 'Hôm qua',
      isRead: true
    },
    {
      id: '8',
      type: 'order',
      title: 'Đơn hàng đã giao',
      message: 'Đơn hàng #DH1234 đã được giao thành công',
      avatar: 'https://i.pravatar.cc/150?img=18',
      timestamp: 'Hôm qua',
      isRead: true
    },
    {
      id: '9',
      type: 'like',
      title: 'Hoàng Nam và 15 người khác',
      message: 'đã thích bài viết của bạn',
      avatar: 'https://i.pravatar.cc/150?img=52',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
      timestamp: '2 ngày trước',
      isRead: true
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" fill="currentColor" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'order':
        return <ShoppingCart className="w-5 h-5 text-green-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-purple-500" />;
      case 'mention':
        return <AtSign className="w-5 h-5 text-orange-500" />;
      case 'product':
        return <Tag className="w-5 h-5 text-pink-500" />;
      case 'system':
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'order':
        onNavigate('order-management');
        break;
      case 'like':
      case 'comment':
      case 'product':
        onNavigate('home');
        break;
      case 'follow':
        // Navigate to profile
        break;
    }
    
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />

          {/* Notification Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg">Thông báo</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('settings')}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Cài đặt thông báo"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tất cả ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                    filter === 'unread'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Chưa đọc ({unreadCount})
                </button>
              </div>

              {/* Mark all as read */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="w-full mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Đánh dấu tất cả là đã đọc
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto">
              {filteredNotifications.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`group relative p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3">
                        {/* Avatar/Icon */}
                        <div className="relative flex-shrink-0">
                          {notification.avatar ? (
                            <img
                              src={notification.avatar}
                              alt=""
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              {getIcon(notification.type)}
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-white">
                            {getIcon(notification.type)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm">
                                <span className="font-medium">{notification.title}</span>
                                {' '}
                                <span className="text-gray-700">{notification.message}</span>
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                            </div>

                            {notification.image && (
                              <img
                                src={notification.image}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                          </div>

                          {/* Unread indicator */}
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full absolute top-4 right-4" />
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="p-1.5 bg-white hover:bg-blue-50 rounded-lg shadow-sm border border-gray-200"
                            title="Đánh dấu đã đọc"
                          >
                            <Check className="w-4 h-4 text-blue-600" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1.5 bg-white hover:bg-red-50 rounded-lg shadow-sm border border-gray-200"
                          title="Xóa thông báo"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg mb-2">Không có thông báo</h3>
                  <p className="text-sm text-gray-500 text-center">
                    {filter === 'unread' 
                      ? 'Bạn đã đọc hết tất cả thông báo'
                      : 'Chưa có thông báo nào'}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {filteredNotifications.length > 0 && (
              <div className="p-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // Navigate to full notifications page
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-700 py-2"
                >
                  Xem tất cả thông báo
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
