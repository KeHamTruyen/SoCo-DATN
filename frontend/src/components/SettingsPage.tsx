import { useState } from 'react';
import { 
  ArrowLeft, User as UserIcon, Lock, Bell, Shield, Globe, Moon, Eye, 
  CreditCard, HelpCircle, Save, X, Check, Smartphone, Monitor, AlertCircle,
  Camera, Mail, Phone, MapPin, Calendar, EyeOff, MessageSquare, KeyRound,
  UserX, Filter, Archive, Reply, Info
} from 'lucide-react';
import { User } from '../App';

interface SettingsPageProps {
  currentUser: User;
  onNavigate: (page: any) => void;
  onLogout: () => void;
}

export function SettingsPage({ currentUser, onNavigate, onLogout }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<'account' | 'privacy' | 'notifications' | 'security' | 'messaging' | 'recovery'>('account');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryEmailSent, setRecoveryEmailSent] = useState(false);

  // User info state
  const [userInfo, setUserInfo] = useState({
    name: currentUser.name,
    username: currentUser.username,
    email: currentUser.email,
    phone: currentUser.phone || '',
    bio: currentUser.bio || '',
    address: currentUser.address || ''
  });

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    orderUpdates: true,
    messageNotifications: true,
    profilePublic: true,
    showEmail: false,
    showPhone: false,
    showLastSeen: true,
    allowMessages: true,
    allowComments: true,
    twoFactorAuth: false,
    darkMode: false,
    language: 'vi'
  });

  const activeSessions = [
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'Hà Nội, Việt Nam',
      lastActive: 'Đang hoạt động',
      current: true,
      icon: Monitor
    },
    {
      id: '2',
      device: 'iPhone 14 Pro',
      location: 'Hà Nội, Việt Nam',
      lastActive: '2 giờ trước',
      current: false,
      icon: Smartphone
    },
    {
      id: '3',
      device: 'Safari on MacBook Pro',
      location: 'TP. HCM, Việt Nam',
      lastActive: '1 ngày trước',
      current: false,
      icon: Monitor
    }
  ];

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleSaveUserInfo = () => {
    // Mock save
    alert('Thông tin đã được cập nhật thành công!');
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Mật khẩu mới không khớp!');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      alert('Mật khẩu phải có ít nhất 8 ký tự!');
      return;
    }
    // Mock change password
    alert('Mật khẩu đã được thay đổi thành công!');
    setShowChangePassword(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleLogoutSession = (sessionId: string) => {
    alert(`Đã đăng xuất phiên: ${sessionId}`);
  };

  const handleDeleteAccount = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!')) {
      alert('Tài khoản đã được đánh dấu để xóa. Bạn có 30 ngày để khôi phục.');
      onLogout();
    }
  };

  const handleSendRecoveryEmail = () => {
    if (recoveryEmail.trim() === '') {
      alert('Vui lòng nhập địa chỉ email khôi phục!');
      return;
    }
    // Mock send recovery email
    alert('Email khôi phục đã được gửi!');
    setRecoveryEmailSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button 
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Quay lại</span>
            </button>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl">Cài đặt</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý thông tin tài khoản và tùy chọn của bạn</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-1 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-2 px-8 py-4 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'account' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <UserIcon className="w-5 h-5" />
              <span className="text-sm">Tài khoản</span>
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-2 px-8 py-4 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'privacy' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Eye className="w-5 h-5" />
              <span className="text-sm">Quyền riêng tư</span>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 px-8 py-4 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'notifications' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Bell className="w-5 h-5" />
              <span className="text-sm">Thông báo</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-8 py-4 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'security' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span className="text-sm">Bảo mật</span>
            </button>
            <button
              onClick={() => setActiveTab('messaging')}
              className={`flex items-center gap-2 px-8 py-4 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'messaging' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm">Tin nhắn</span>
            </button>
            <button
              onClick={() => setActiveTab('recovery')}
              className={`flex items-center gap-2 px-8 py-4 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'recovery' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <KeyRound className="w-5 h-5" />
              <span className="text-sm">Khôi phục</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Content */}
          <div className="lg:col-span-3">
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-4">
                {/* Profile Picture */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg mb-4">Ảnh đại diện</h2>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                      <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Tải ảnh lên
                      </button>
                      <p className="text-xs text-gray-500 mt-2">JPG, PNG hoặc GIF. Tối đa 5MB.</p>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg mb-4">Thông tin tài khoản</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2">Họ và tên *</label>
                        <input
                          type="text"
                          value={userInfo.name}
                          onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                          placeholder="Nhập họ và tên"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2">Tên người dùng *</label>
                        <input
                          type="text"
                          value={userInfo.username}
                          onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                          placeholder="Nhập tên người dùng"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          Email *
                        </label>
                        <input
                          type="email"
                          value={userInfo.email}
                          onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                          placeholder="example@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          value={userInfo.phone}
                          onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                          placeholder="0123456789"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        Địa chỉ
                      </label>
                      <input
                        type="text"
                        value={userInfo.address}
                        onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        placeholder="Nhập địa chỉ của bạn"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Giới thiệu bản thân</label>
                      <textarea
                        value={userInfo.bio}
                        onChange={(e) => setUserInfo({ ...userInfo, bio: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                        placeholder="Viết vài dòng về bản thân..."
                      />
                      <p className="text-xs text-gray-500 mt-1">{userInfo.bio.length}/500 ký tự</p>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={handleSaveUserInfo}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Lưu thay đổi
                      </button>
                      <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>

                {/* Display Settings */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg mb-4">Tùy chỉnh giao diện</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Moon className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-sm">Chế độ tối</p>
                          <p className="text-xs text-gray-500">Giảm ánh sáng màn hình</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggle('darkMode')}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.darkMode ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.darkMode ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        Ngôn ngữ
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      >
                        <option value="vi">Tiếng Việt</option>
                        <option value="en">English</option>
                        <option value="ja">日本語</option>
                        <option value="ko">한국어</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg mb-4">Quyền riêng tư</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm">Hồ sơ công khai</p>
                      <p className="text-xs text-gray-500">Mọi người có thể xem hồ sơ của bạn</p>
                    </div>
                    <button
                      onClick={() => handleToggle('profilePublic')}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.profilePublic ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.profilePublic ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm">Hiển thị email</p>
                      <p className="text-xs text-gray-500">Người khác có thể nhìn thấy email của bạn</p>
                    </div>
                    <button
                      onClick={() => handleToggle('showEmail')}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.showEmail ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.showEmail ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm">Hiển thị số điện thoại</p>
                      <p className="text-xs text-gray-500">Người khác có thể nhìn thấy SĐT của bạn</p>
                    </div>
                    <button
                      onClick={() => handleToggle('showPhone')}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.showPhone ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.showPhone ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm">Hiển thị trạng thái hoạt động</p>
                      <p className="text-xs text-gray-500">Người khác biết khi nào bạn online</p>
                    </div>
                    <button
                      onClick={() => handleToggle('showLastSeen')}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.showLastSeen ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.showLastSeen ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm">Cho phép tin nhắn</p>
                      <p className="text-xs text-gray-500">Mọi người có thể gửi tin nhắn cho bạn</p>
                    </div>
                    <button
                      onClick={() => handleToggle('allowMessages')}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.allowMessages ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.allowMessages ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm">Cho phép bình luận</p>
                      <p className="text-xs text-gray-500">Mọi người có thể bình luận vào bài đăng của bạn</p>
                    </div>
                    <button
                      onClick={() => handleToggle('allowComments')}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.allowComments ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.allowComments ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg mb-4">Cài đặt thông báo</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm mb-3 text-gray-700">Kênh nhận thông báo</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="text-sm">Thông báo qua Email</p>
                            <p className="text-xs text-gray-500">Nhận thông báo qua email</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggle('emailNotifications')}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.emailNotifications ? 'translate-x-7' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="text-sm">Thông báo đẩy</p>
                            <p className="text-xs text-gray-500">Nhận thông báo trên thiết bị</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggle('pushNotifications')}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            settings.pushNotifications ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.pushNotifications ? 'translate-x-7' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="text-sm">Thông báo SMS</p>
                            <p className="text-xs text-gray-500">Nhận thông báo qua tin nhắn</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleToggle('smsNotifications')}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            settings.smsNotifications ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.smsNotifications ? 'translate-x-7' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-sm mb-3 text-gray-700">Loại thông báo</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm">Cập nhật đơn hàng</p>
                          <p className="text-xs text-gray-500">Thông báo về trạng thái đơn hàng</p>
                        </div>
                        <button
                          onClick={() => handleToggle('orderUpdates')}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            settings.orderUpdates ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.orderUpdates ? 'translate-x-7' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm">Tin nhắn mới</p>
                          <p className="text-xs text-gray-500">Thông báo khi có tin nhắn mới</p>
                        </div>
                        <button
                          onClick={() => handleToggle('messageNotifications')}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            settings.messageNotifications ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.messageNotifications ? 'translate-x-7' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm">Email Marketing</p>
                          <p className="text-xs text-gray-500">Nhận thông tin khuyến mãi</p>
                        </div>
                        <button
                          onClick={() => handleToggle('marketingEmails')}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            settings.marketingEmails ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.marketingEmails ? 'translate-x-7' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg mb-4">Bảo mật tài khoản</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="text-sm">Xác thực hai yếu tố (2FA)</p>
                          <p className="text-xs text-gray-500">Bảo vệ tài khoản với mã xác thực</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggle('twoFactorAuth')}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.twoFactorAuth ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>

                    <button 
                      onClick={() => setShowChangePassword(true)}
                      className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-gray-600" />
                        <div className="text-left">
                          <p className="text-sm">Đổi mật khẩu</p>
                          <p className="text-xs text-gray-500">Cập nhật mật khẩu của bạn</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <button 
                      onClick={() => setShowSessions(true)}
                      className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-gray-600" />
                        <div className="text-left">
                          <p className="text-sm">Phiên đăng nhập</p>
                          <p className="text-xs text-gray-500">Quản lý các thiết bị đã đăng nhập</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{activeSessions.length} thiết bị</span>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm text-red-900 mb-1">Vùng nguy hiểm</h3>
                      <p className="text-xs text-red-700">
                        Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Xóa tài khoản vĩnh viễn
                  </button>
                </div>
              </div>
            )}

            {/* Messaging Tab */}
            {activeTab === 'messaging' && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg mb-4">Cài đặt tin nhắn</h2>
                  <div className="space-y-4">
                    <button 
                      onClick={() => setShowBlockedUsers(true)}
                      className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <UserX className="w-5 h-5 text-gray-600" />
                        <div className="text-left">
                          <p className="text-sm">Người dùng bị chặn</p>
                          <p className="text-xs text-gray-500">Xem và quản lý người dùng bị chặn</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Recovery Tab */}
            {activeTab === 'recovery' && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg mb-4">Cài đặt khôi phục</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2">Email khôi phục</label>
                      <input
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        placeholder="Nhập email khôi phục"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email này sẽ được sử dụng để khôi phục tài khoản của bạn</p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleSendRecoveryEmail}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Gửi email khôi phục
                      </button>
                      <button
                        onClick={() => setRecoveryEmail('')}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Hủy
                      </button>
                    </div>

                    {recoveryEmailSent && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">Email khôi phục đã được gửi đến <strong>{recoveryEmail}</strong>.</p>
                        <p className="text-sm text-gray-500">Vui lòng kiểm tra hộp thư đến của bạn.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg">Đổi mật khẩu</h3>
              <button onClick={() => setShowChangePassword(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Mật khẩu hiện tại</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Nhập mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Mật khẩu phải có ít nhất 8 ký tự</p>
              </div>

              <div>
                <label className="block text-sm mb-2">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleChangePassword}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Đổi mật khẩu
                </button>
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sessions Modal */}
      {showSessions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg">Phiên đăng nhập</h3>
              <button onClick={() => setShowSessions(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div key={session.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <session.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm">{session.device}</p>
                          <p className="text-xs text-gray-500">{session.location}</p>
                        </div>
                        {session.current && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Thiết bị này
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">{session.lastActive}</p>
                        {!session.current && (
                          <button
                            onClick={() => handleLogoutSession(session.id)}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Đăng xuất
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowSessions(false)}
              className="w-full mt-6 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg mb-2">Xóa tài khoản?</h3>
                <p className="text-sm text-gray-600">
                  Bạn có chắc chắn muốn xóa tài khoản vĩnh viễn? Hành động này không thể hoàn tác và tất cả dữ liệu của bạn sẽ bị xóa.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Xóa vĩnh viễn
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blocked Users Modal */}
      {showBlockedUsers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg">Người dùng bị chặn</h3>
              <button onClick={() => setShowBlockedUsers(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserX className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm">Nguyễn Văn A</p>
                        <p className="text-xs text-gray-500">Hà Nội, Việt Nam</p>
                      </div>
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        Đã chặn
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">2 giờ trước</p>
                      <button
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Bỏ chặn
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowBlockedUsers(false)}
              className="w-full mt-6 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}