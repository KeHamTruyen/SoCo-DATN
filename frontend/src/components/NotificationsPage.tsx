import { useState, useEffect } from 'react';
import { Heart, MessageCircle, UserPlus, ShoppingBag, Star, Check, Package, Tag } from 'lucide-react';
import { PageLayout } from './Layout/PageLayout';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import notificationService, { Notification } from '../services/notification.service';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

type TabType = 'all' | 'unread' | 'interaction' | 'commerce';

export function NotificationsPage() {
  const { user } = useAuth();
  const { isConnected, onNewNotification } = useSocket();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, activeTab]);

  // Setup real-time notifications
  useEffect(() => {
    if (!isConnected || !user) return;

    const unsubscribe = onNewNotification((notification) => {
      console.log('📬 New notification received:', notification);
      
      // Add to list if matches current tab
      if (shouldShowInTab(notification, activeTab)) {
        setNotifications((prev) => [notification, ...prev]);
      }
      
      // Update unread count
      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    return unsubscribe;
  }, [isConnected, user, activeTab, onNewNotification]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const isRead = activeTab === 'unread' ? false : undefined;
      const response = await notificationService.getUserNotifications(1, 20, isRead);
      
      let filteredNotifications = response.data.notifications;
      
      // Filter by tab type
      if (activeTab === 'interaction') {
        filteredNotifications = filteredNotifications.filter(n => 
          ['LIKE', 'COMMENT', 'FOLLOW'].includes(n.type)
        );
      } else if (activeTab === 'commerce') {
        filteredNotifications = filteredNotifications.filter(n => 
          ['ORDER', 'PRODUCT_TAG', 'REVIEW'].includes(n.type)
        );
      }
      
      setNotifications(filteredNotifications);
      setUnreadCount(response.data.unreadCount);
      setHasMore(response.data.pagination.page < response.data.pagination.totalPages);
      setPage(1);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const shouldShowInTab = (notification: Notification, tab: TabType): boolean => {
    if (tab === 'all') return true;
    if (tab === 'unread') return !notification.isRead;
    if (tab === 'interaction') return ['LIKE', 'COMMENT', 'FOLLOW'].includes(notification.type);
    if (tab === 'commerce') return ['ORDER', 'PRODUCT_TAG', 'REVIEW'].includes(notification.type);
    return true;
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      );
      
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }
    
    // Navigate to action URL if exists
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LIKE':
        return <Heart className="w-5 h-5 text-red-500" fill="currentColor" />;
      case 'COMMENT':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'FOLLOW':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'ORDER':
        return <ShoppingBag className="w-5 h-5 text-purple-500" />;
      case 'REVIEW':
        return <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />;
      case 'MESSAGE':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'PRODUCT_TAG':
        return <Tag className="w-5 h-5 text-indigo-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: vi });
    } catch {
      return timestamp;
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <PageLayout activePage="notifications">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Thông báo</h1>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500 mt-1">{unreadCount} thông báo chưa đọc</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-3 text-sm ${
                activeTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`flex-1 py-3 text-sm ${
                activeTab === 'unread'
                  ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => setActiveTab('interaction')}
              className={`flex-1 py-3 text-sm ${
                activeTab === 'interaction'
                  ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tương tác
            </button>
            <button
              onClick={() => setActiveTab('commerce')}
              className={`flex-1 py-3 text-sm ${
                activeTab === 'commerce'
                  ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mua bán
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-500">Đang tải...</div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Chưa có thông báo nào</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.isRead ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon or Avatar */}
                  {notification.relatedUser?.avatarUrl ? (
                    <img
                      src={notification.relatedUser.avatarUrl}
                      alt={notification.relatedUser.fullName}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        !notification.isRead ? 'bg-white' : 'bg-gray-100'
                      }`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm mb-1 ${!notification.isRead ? 'font-medium' : ''}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(notification.createdAt)}
                      </span>
                      {!notification.isRead && (
                        <span className="text-xs text-blue-600 font-medium">Mới</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
