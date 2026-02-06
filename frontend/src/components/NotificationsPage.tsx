import { Heart, MessageCircle, UserPlus, ShoppingBag, Star, Check } from 'lucide-react';
import { User, Notification } from '../App';
import { PageLayout } from './Layout/PageLayout';

interface NotificationsPageProps {
  currentUser: User;
  onNavigate: (page: any) => void;
  onLogout: () => void;
}

export function NotificationsPage({ currentUser, onNavigate, onLogout }: NotificationsPageProps) {
  const notifications: Notification[] = [
    {
      id: '1',
      userId: currentUser.id,
      type: 'like',
      content: 'Trần Thị Mai và 15 người khác đã thích bài viết của bạn',
      timestamp: '5 phút trước',
      read: false
    },
    {
      id: '2',
      userId: currentUser.id,
      type: 'comment',
      content: 'Lê Văn Hoàng đã bình luận: "Sản phẩm rất đẹp!"',
      timestamp: '30 phút trước',
      read: false
    },
    {
      id: '3',
      userId: currentUser.id,
      type: 'follow',
      content: 'Phạm Thị Lan đã bắt đầu theo dõi bạn',
      timestamp: '1 giờ trước',
      read: false
    },
    {
      id: '4',
      userId: currentUser.id,
      type: 'order',
      content: 'Bạn có đơn hàng mới từ Hoàng Văn Nam',
      timestamp: '2 giờ trước',
      read: true
    },
    {
      id: '5',
      userId: currentUser.id,
      type: 'review',
      content: 'Nguyễn Thị Hương đã đánh giá 5 sao cho sản phẩm của bạn',
      timestamp: '3 giờ trước',
      read: true
    },
    {
      id: '6',
      userId: currentUser.id,
      type: 'message',
      content: 'Bạn có tin nhắn mới từ Trần Văn Đức',
      timestamp: '5 giờ trước',
      read: true
    },
    {
      id: '7',
      userId: currentUser.id,
      type: 'order',
      content: 'Đơn hàng #1234 đã được giao thành công',
      timestamp: '1 ngày trước',
      read: true
    },
    {
      id: '8',
      userId: currentUser.id,
      type: 'like',
      content: 'Bài viết của bạn đã đạt 100 lượt thích',
      timestamp: '2 ngày trước',
      read: true
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'order':
        return <ShoppingBag className="w-5 h-5 text-purple-500" />;
      case 'review':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Check className="w-5 h-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <PageLayout 
      currentUser={currentUser}
      onNavigate={onNavigate}
      onLogout={onLogout}
      activePage="notifications"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl">Thông báo</h1>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500">{unreadCount} thông báo chưa đọc</p>
              )}
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <div className="flex border-b border-gray-200">
            <button className="flex-1 py-3 text-sm text-blue-600 border-b-2 border-blue-600">
              Tất cả
            </button>
            <button className="flex-1 py-3 text-sm text-gray-500 hover:text-gray-700">
              Chưa đọc ({unreadCount})
            </button>
            <button className="flex-1 py-3 text-sm text-gray-500 hover:text-gray-700">
              Tương tác
            </button>
            <button className="flex-1 py-3 text-sm text-gray-500 hover:text-gray-700">
              Mua bán
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  !notification.read ? 'bg-white' : 'bg-gray-100'
                }`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm mb-1 ${!notification.read ? 'font-medium' : ''}`}>
                    {notification.content}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{notification.timestamp}</span>
                    {!notification.read && (
                      <span className="text-xs text-blue-600">Mới</span>
                    )}
                  </div>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-6">
          <button className="text-sm text-blue-600 hover:text-blue-700">
            Xem thêm thông báo
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
