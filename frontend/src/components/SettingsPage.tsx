import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateProfile, loading } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    username: '',
    phone: '',
    bio: '',
    address: ''
  });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    setForm({
      fullName: user.fullName || '',
      username: user.username || '',
      phone: user.phone || '',
      bio: user.bio || '',
      address: user.address || ''
    });
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    try {
      setSaving(true);

      const payload = {
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
        address: form.address.trim()
      };

      if (!payload.fullName) {
        throw new Error('Vui lòng nhập họ và tên.');
      }
      if (!payload.username) {
        throw new Error('Vui lòng nhập tên người dùng.');
      }

      await updateProfile(payload);
      setSuccessMessage('Đã lưu thay đổi. Đang chuyển về trang hồ sơ...');

      const nextUsername = payload.username.toLowerCase();
      setTimeout(() => {
        navigate(`/profile/${nextUsername}`);
      }, 700);
    } catch (error: any) {
      setErrorMessage(error?.message || 'Không thể cập nhật thông tin.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
          <h1 className="text-lg">Cài đặt tài khoản</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg">Chỉnh sửa trang cá nhân</h2>
                <p className="text-sm text-gray-500">Cập nhật thông tin hiển thị trên hồ sơ của bạn</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} autoComplete="on" className="p-6 space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm mb-2">Họ và tên</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                autoComplete="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Nhập họ và tên"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm mb-2">Tên người dùng</label>
              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={(e) => handleChange('username', e.target.value)}
                autoComplete="username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Nhập username"
              />
              <p className="text-xs text-gray-500 mt-1">Username sẽ được chuẩn hóa về chữ thường khi lưu.</p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm mb-2">Số điện thoại</label>
              <input
                id="phone"
                name="phone"
                type="text"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                autoComplete="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm mb-2">Địa chỉ</label>
              <input
                id="address"
                name="address"
                type="text"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                autoComplete="street-address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Nhập địa chỉ"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm mb-2">Tiểu sử</label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={form.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Viết vài dòng giới thiệu"
              />
            </div>

            {errorMessage && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                {successMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/profile/${user.username}`)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Xem hồ sơ
              </button>
              <button
                type="submit"
                disabled={saving || loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
