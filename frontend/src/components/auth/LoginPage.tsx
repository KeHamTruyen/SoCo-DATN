import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShoppingBag } from 'lucide-react';
import { User } from '../../App';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onNavigate: () => void;
  onForgotPassword?: () => void;
}

export function LoginPage({ onLogin, onNavigate, onForgotPassword }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [code2FA, setCode2FA] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock login - show 2FA
    if (!show2FA) {
      setShow2FA(true);
      return;
    }

    // Determine user role based on email
    let userRole: 'buyer' | 'seller' | 'admin' = 'buyer';
    if (email.toLowerCase().includes('admin')) {
      userRole = 'admin';
    } else if (email.toLowerCase().includes('seller')) {
      userRole = 'seller';
    }

    // Mock user data
    const mockUser: User = {
      id: '1',
      name: userRole === 'admin' ? 'Admin User' : userRole === 'seller' ? 'Nguyễn Văn Seller' : 'Nguyễn Văn A',
      username: userRole === 'admin' ? 'admin' : userRole === 'seller' ? 'seller123' : 'nguyenvana',
      email: email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
      coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200',
      role: userRole,
      isVerified: userRole !== 'buyer',
      followers: 128,
      following: 95,
      bio: userRole === 'admin' ? 'Quản trị viên hệ thống' : userRole === 'seller' ? 'Người bán chuyên nghiệp' : 'Yêu thích công nghệ và thời trang',
      phone: '0123456789',
      address: 'Hà Nội, Việt Nam',
      createdAt: '2024-11-15'
    };

    onLogin(mockUser);
  };

  if (show2FA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl mb-2">Xác thực hai yếu tố</h2>
            <p className="text-gray-600">
              Chúng tôi đã gửi mã xác thực đến email <strong>{email}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm mb-2">Mã xác thực</label>
              <input
                type="text"
                value={code2FA}
                onChange={(e) => setCode2FA(e.target.value)}
                placeholder="Nhập mã 6 chữ số"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-center text-2xl tracking-widest"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Xác nhận
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShow2FA(false)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Quay lại đăng nhập
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              Không nhận được mã?{' '}
              <button type="button" className="text-blue-600 hover:text-blue-700">
                Gửi lại
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

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
          <h2 className="text-2xl mb-2">Đăng nhập</h2>
          <p className="text-gray-600">Chào mừng bạn quay trở lại!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
              />
              <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Quên mật khẩu?
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Đăng nhập
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Hoặc đăng nhập với</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm">Google</span>
            </button>
            <button
              type="button"
              className="py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-sm">Facebook</span>
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <button
              type="button"
              onClick={onNavigate}
              className="text-blue-600 hover:text-blue-700"
            >
              Đăng ký ngay
            </button>
          </div>

          {/* Demo Hint */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700 mb-2">💡 <strong>Demo tips:</strong></p>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>• Email chứa "admin" → Đăng nhập với quyền Admin</li>
              <li>• Email chứa "seller" → Đăng nhập với quyền Seller</li>
              <li>• Email khác → Đăng nhập với quyền Buyer</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
}