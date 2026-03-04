import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Mail } from 'lucide-react';
import authService from '../../services/auth.service';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(searchParams.get('email') || '');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        setStatus('loading');
        const response = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Xác thực email thành công.');
        setTimeout(() => navigate('/home', { replace: true }), 1200);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Liên kết xác thực không hợp lệ hoặc đã hết hạn.');
      }
    };

    verify();
  }, [token, navigate]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setStatus('loading');
      const response = await authService.resendVerification(email);
      setStatus('idle');
      setMessage(response.message || 'Đã gửi lại email xác thực.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Không thể gửi lại email xác thực.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            {status === 'success' ? <CheckCircle2 className="w-8 h-8 text-white" /> : <Mail className="w-8 h-8 text-white" />}
          </div>
          <h2 className="text-2xl mb-2">Xác thực email</h2>
          <p className="text-gray-600">
            {token ? 'Hệ thống đang xác thực tài khoản của bạn.' : 'Nhập email để nhận lại liên kết xác thực.'}
          </p>
        </div>

        {message && (
          <div
            className={`mb-4 rounded-lg p-3 text-sm ${
              status === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-blue-50 border border-blue-200 text-blue-700'
            }`}
          >
            {message}
          </div>
        )}

        {!token && (
          <form onSubmit={handleResend} className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="example@email.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {status === 'loading' ? 'Đang gửi...' : 'Gửi lại email xác thực'}
            </button>
          </form>
        )}

        <Link to="/login" className="mt-6 block text-center text-sm text-blue-600 hover:text-blue-700">
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
