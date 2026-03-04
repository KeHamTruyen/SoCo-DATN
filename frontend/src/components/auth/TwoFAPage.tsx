import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function TwoFAPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verify2FA, loading, error, clearError } = useAuth();
  const [otpCode, setOtpCode] = useState('');
  const [localError, setLocalError] = useState('');

  const state = location.state as { tempToken?: string; from?: string };
  const tempToken = state?.tempToken;
  const from = state?.from || '/home';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError('');

    if (!tempToken) {
      setLocalError('Phiên đăng nhập 2FA đã hết hạn. Vui lòng đăng nhập lại.');
      return;
    }

    if (!/^\d{6}$/.test(otpCode)) {
      setLocalError('Mã OTP phải gồm đúng 6 chữ số.');
      return;
    }

    try {
      await verify2FA({ tempToken, otpCode });
      navigate(from, { replace: true });
    } catch (err) {
      console.error('2FA verification failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Quay lại đăng nhập</span>
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl mb-2">Xác thực hai yếu tố</h2>
          <p className="text-gray-600">Nhập mã OTP 6 chữ số đã gửi đến email của bạn.</p>
        </div>

        {(error || localError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error || localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm mb-2">Mã OTP</label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-center text-2xl tracking-widest"
              placeholder="000000"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Đang xác thực...' : 'Xác thực và đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
