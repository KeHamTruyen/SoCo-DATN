import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ShoppingBag, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function RegisterPage() {
  const { register, error, clearError, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'BUYER' as 'BUYER' | 'SELLER'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Mật khẩu không khớp!');
      return;
    }
    if (!acceptTerms) {
      setLocalError('Vui lòng đồng ý với điều khoản sử dụng!');
      return;
    }
    if (formData.password.length < 8) {
      setLocalError('Mật khẩu phải có ít nhất 8 ký tự!');
      return;
    }

    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        role: formData.role
      });

      // Success! AuthContext will update user state
      navigate('/home', { replace: true });
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Social Commerce
            </h1>
          </div>
          <h2 className="text-2xl mb-2">Tạo tài khoản</h2>
          <p className="text-gray-600">Tham gia cộng đồng mua bán ngay hôm nay!</p>
        </div>

        {displayError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{displayError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Họ và tên *</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Nguyễn Văn A"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Tên người dùng *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="nguyenvana"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
                minLength={3}
                maxLength={50}
                pattern="^[a-zA-Z0-9_]+$"
                title="Chỉ được sử dụng chữ cái, số và dấu gạch dưới"
                disabled={loading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">3-50 ký tự, chỉ chữ cái, số và gạch dưới</p>
          </div>

          <div>
            <label className="block text-sm mb-2">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@email.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Số điện thoại *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0123456789"
                pattern="^[0-9]{10,15}$"
                title="Số điện thoại phải có 10-15 chữ số"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Loại tài khoản *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'BUYER' })}
                className={`py-3 px-4 border rounded-lg transition-all ${
                  formData.role === 'BUYER'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                disabled={loading}
              >
                <div className="text-sm font-medium">Người mua</div>
                <div className="text-xs text-gray-500">Mua sắm</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'SELLER' })}
                className={`py-3 px-4 border rounded-lg transition-all ${
                  formData.role === 'SELLER'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                disabled={loading}
              >
                <div className="text-sm font-medium">Người bán</div>
                <div className="text-xs text-gray-500">Bán hàng</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Mật khẩu *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
                minLength={8}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số</p>
          </div>

          <div>
            <label className="block text-sm mb-2">Xác nhận mật khẩu *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600 mt-1"
                required
                disabled={loading}
              />
              <span className="text-sm text-gray-600">
                Tôi đồng ý với{' '}
                <button type="button" className="text-blue-600 hover:text-blue-700">
                  Điều khoản dịch vụ
                </button>{' '}
                và{' '}
                <button type="button" className="text-blue-600 hover:text-blue-700">
                  Chính sách bảo mật
                </button>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>

          <div className="text-center text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700"
              disabled={loading}
            >
              Đăng nhập ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}