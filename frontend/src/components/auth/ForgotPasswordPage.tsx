import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import authService from '../../services/auth.service';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      setLoading(true);
      const response = await authService.forgotPassword(email);
      setMessage(response.message || 'Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi yêu cầu đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Quay lại đăng nhập</span>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl mb-2">Quên mật khẩu?</h2>
          <p className="text-gray-600">
            Nhập email tài khoản. Hệ thống sẽ gửi liên kết đặt lại mật khẩu cho bạn.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmitEmail} className="space-y-6">
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
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại mật khẩu'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Nhớ mật khẩu rồi?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700">
                Đăng nhập
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
