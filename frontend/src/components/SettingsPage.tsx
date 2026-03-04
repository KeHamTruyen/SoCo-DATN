import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Shield, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/auth.service';
import uploadService from '../services/upload.service';

type TabKey = 'profile' | 'privacy' | 'security';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    username: '',
    phone: '',
    bio: '',
    address: '',
    avatarUrl: '',
    coverImage: '',
  });

  const [privacyForm, setPrivacyForm] = useState({
    profileVisibility: 'public' as 'public' | 'followers' | 'private',
    postVisibility: 'public' as 'public' | 'followers' | 'private',
    messagePermission: 'everyone' as 'everyone' | 'followers' | 'nobody',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [enableOtp, setEnableOtp] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      fullName: user.fullName || '',
      username: user.username || '',
      phone: user.phone || '',
      bio: user.bio || '',
      address: user.address || '',
      avatarUrl: user.avatarUrl || '',
      coverImage: user.coverImage || '',
    });
  }, [user]);

  useEffect(() => {
    const loadPrivacy = async () => {
      try {
        const res = await authService.getPrivacy();
        setPrivacyForm({
          profileVisibility: res.data.profileVisibility,
          postVisibility: res.data.postVisibility,
          messagePermission: res.data.messagePermission,
        });
      } catch {
        // Keep defaults if request fails.
      }
    };
    loadPrivacy();
  }, []);

  if (!user) return null;

  const handleUpload = async (file: File, field: 'avatarUrl' | 'coverImage') => {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      const uploaded = await uploadService.uploadAvatar(file);
      setProfileForm((prev) => ({ ...prev, [field]: uploaded.data.url }));
      setMessage('Đã tải ảnh lên thành công. Nhấn "Lưu hồ sơ" để cập nhật.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Tải ảnh thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      await updateProfile({
        fullName: profileForm.fullName,
        username: profileForm.username,
        phone: profileForm.phone || null,
        bio: profileForm.bio || null,
        address: profileForm.address || null,
        avatarUrl: profileForm.avatarUrl || null,
        coverImage: profileForm.coverImage || null,
      });
      setMessage('Cập nhật hồ sơ thành công.');
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrivacy = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      await authService.updatePrivacy(privacyForm);
      setMessage('Cập nhật quyền riêng tư thành công.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể cập nhật quyền riêng tư.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      await authService.changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('Đổi mật khẩu thành công.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể đổi mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FAStart = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      await authService.enable2FA();
      setMessage('Đã gửi OTP xác nhận bật 2FA về email của bạn.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể bắt đầu bật 2FA.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FAConfirm = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      const res = await authService.confirm2FAEnable(enableOtp);
      setBackupCodes(res.data.backupCodes || []);
      setEnableOtp('');
      setMessage('Bật 2FA thành công.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Xác nhận bật 2FA thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      await authService.disable2FA(disablePassword);
      setDisablePassword('');
      setBackupCodes([]);
      setMessage('Đã tắt 2FA.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tắt 2FA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-gray-700">
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại hồ sơ</span>
          </button>
          <button
            onClick={logout}
            className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl mb-6">Cài đặt tài khoản</h1>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'}`}
          >
            Hồ sơ
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'privacy' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'}`}
          >
            Quyền riêng tư
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'security' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300'}`}
          >
            Bảo mật
          </button>
        </div>

        {error && <div className="mb-4 p-3 text-sm rounded-lg bg-red-50 border border-red-200 text-red-700">{error}</div>}
        {message && <div className="mb-4 p-3 text-sm rounded-lg bg-green-50 border border-green-200 text-green-700">{message}</div>}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-5">
            <h2 className="text-lg">Thông tin cá nhân</h2>

            <div>
              <label className="block text-sm mb-2">Ảnh đại diện</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={profileForm.avatarUrl}
                  onChange={(e) => setProfileForm((p) => ({ ...p, avatarUrl: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="URL ảnh đại diện"
                />
                <label className="px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>Tải lên</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file, 'avatarUrl');
                    }}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">Ảnh bìa</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={profileForm.coverImage}
                  onChange={(e) => setProfileForm((p) => ({ ...p, coverImage: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="URL ảnh bìa"
                />
                <label className="px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>Tải lên</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file, 'coverImage');
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Họ và tên</label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Username</label>
                <input
                  type="text"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Số điện thoại</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Địa chỉ</label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">Giới thiệu</label>
              <textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Lưu hồ sơ
            </button>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-5">
            <h2 className="text-lg">Quyền riêng tư</h2>

            <div>
              <label className="block text-sm mb-2">Hiển thị hồ sơ</label>
              <select
                value={privacyForm.profileVisibility}
                onChange={(e) =>
                  setPrivacyForm((p) => ({ ...p, profileVisibility: e.target.value as typeof p.profileVisibility }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="public">Công khai</option>
                <option value="followers">Chỉ người theo dõi</option>
                <option value="private">Riêng tư</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2">Hiển thị bài viết</label>
              <select
                value={privacyForm.postVisibility}
                onChange={(e) =>
                  setPrivacyForm((p) => ({ ...p, postVisibility: e.target.value as typeof p.postVisibility }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="public">Công khai</option>
                <option value="followers">Chỉ người theo dõi</option>
                <option value="private">Riêng tư</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2">Ai có thể nhắn tin</label>
              <select
                value={privacyForm.messagePermission}
                onChange={(e) =>
                  setPrivacyForm((p) => ({ ...p, messagePermission: e.target.value as typeof p.messagePermission }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="everyone">Mọi người</option>
                <option value="followers">Người theo dõi</option>
                <option value="nobody">Không ai</option>
              </select>
            </div>

            <button
              onClick={handleSavePrivacy}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Lưu quyền riêng tư
            </button>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <h2 className="text-lg">Bảo mật tài khoản</h2>

            <div className="p-4 border border-gray-200 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-gray-800">
                <Shield className="w-4 h-4" />
                <span>Đổi mật khẩu</span>
              </div>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                placeholder="Mật khẩu hiện tại"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="Mật khẩu mới"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Xác nhận mật khẩu mới"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Cập nhật mật khẩu
              </button>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg space-y-3">
              <h3 className="text-sm">Bật 2FA</h3>
              <p className="text-xs text-gray-600">Bước 1: gửi OTP xác nhận đến email.</p>
              <button
                onClick={handleEnable2FAStart}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Gửi OTP bật 2FA
              </button>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={enableOtp}
                  onChange={(e) => setEnableOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Nhập OTP 6 số"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={handleEnable2FAConfirm}
                  disabled={loading || enableOtp.length !== 6}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Xác nhận
                </button>
              </div>
              {backupCodes.length > 0 && (
                <div className="text-xs bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="mb-2">Mã backup (lưu lại ở nơi an toàn):</p>
                  <div className="grid grid-cols-2 gap-1">
                    {backupCodes.map((code) => (
                      <code key={code}>{code}</code>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border border-gray-200 rounded-lg space-y-3">
              <h3 className="text-sm">Tắt 2FA</h3>
              <input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Nhập mật khẩu để tắt 2FA"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={handleDisable2FA}
                disabled={loading || !disablePassword}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                Tắt 2FA
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
