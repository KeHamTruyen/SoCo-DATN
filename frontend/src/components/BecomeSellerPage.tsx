import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle, ShieldCheck, Store, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import sellerService from '../services/seller.service';
import uploadService from '../services/upload.service';

type Step = 1 | 2 | 3;

export function BecomeSellerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'submitted' | 'approved' | 'rejected'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    idCardNumber: '',
    dateOfBirth: '',
    address: '',
    businessName: '',
    businessType: '',
    businessLicenseNumber: '',
    taxCode: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
    bankBranch: '',
    idCardFront: null as File | null,
    idCardBack: null as File | null,
    businessLicense: null as File | null,
  });

  const canSubmitStep1 = useMemo(() => {
    return Boolean(formData.idCardNumber && formData.dateOfBirth && formData.address);
  }, [formData.idCardNumber, formData.dateOfBirth, formData.address]);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await sellerService.getStatus();
        const s = res.data.status;
        if (s === 'not_started') return;

        setStarted(true);
        if (s === 'APPROVED') {
          setStatus('approved');
          setStatusMessage('Hồ sơ đã được duyệt. Tài khoản của bạn đã là người bán.');
          return;
        }
        if (s === 'REVIEWING') {
          setStatus('submitted');
          setStatusMessage('Hồ sơ đang được xét duyệt.');
          return;
        }
        if (s === 'REJECTED') {
          setStatus('rejected');
          setStatusMessage(res.data.rejectionReason || 'Hồ sơ bị từ chối. Bạn có thể chỉnh sửa và gửi lại.');
        }

        if (res.data.step2Completed) setCurrentStep(3);
        else if (res.data.step1Completed) setCurrentStep(2);
        else setCurrentStep(1);
      } catch (err: any) {
        console.error('Failed to load seller status', err);
      }
    };

    loadStatus();
  }, []);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'idCardFront' | 'idCardBack' | 'businessLicense'
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  const startApplication = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await sellerService.startApplication();
      setStarted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      let idCardFrontUrl: string | undefined;
      let idCardBackUrl: string | undefined;
      if (formData.idCardFront) {
        const uploaded = await uploadService.uploadProductImage(formData.idCardFront);
        idCardFrontUrl = uploaded.data.url;
      }
      if (formData.idCardBack) {
        const uploaded = await uploadService.uploadProductImage(formData.idCardBack);
        idCardBackUrl = uploaded.data.url;
      }

      await sellerService.submitStep1({
        idCardNumber: formData.idCardNumber,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        idCardFrontUrl,
        idCardBackUrl,
      });
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi bước 1.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      let businessLicenseUrl: string | undefined;
      if (formData.businessLicense) {
        const uploaded = await uploadService.uploadProductImage(formData.businessLicense);
        businessLicenseUrl = uploaded.data.url;
      }
      await sellerService.submitStep2({
        businessName: formData.businessName,
        businessType: formData.businessType || undefined,
        businessLicenseNumber: formData.businessLicenseNumber || undefined,
        businessLicenseUrl,
        taxCode: formData.taxCode || undefined,
      });
      setCurrentStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi bước 2.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await sellerService.submitStep3({
        bankName: formData.bankName,
        bankAccountNumber: formData.bankAccountNumber,
        bankAccountName: formData.bankAccountName || undefined,
        bankBranch: formData.bankBranch || undefined,
      });
      setStatus('submitted');
      setStatusMessage('Hồ sơ đã được gửi thành công và đang chờ xét duyệt.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi bước 3.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'approved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-12 shadow-lg">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl mb-4">Bạn đã là người bán</h2>
            <p className="text-gray-600 mb-8">{statusMessage}</p>
            <button
              onClick={() => navigate('/seller/dashboard')}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Đi đến trang người bán
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'submitted') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-12 shadow-sm">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl mb-4">Đang chờ xét duyệt</h2>
            <p className="text-gray-600 mb-6">{statusMessage}</p>
            <button
              onClick={() => navigate('/profile')}
              className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Về trang cá nhân
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Quay lại</span>
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Trở thành người bán
            </h1>
            <p className="text-xl text-gray-600">
              Bắt đầu hành trình kinh doanh của bạn trên Social Commerce
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg mb-2">Tạo cửa hàng</h3>
              <p className="text-gray-600 text-sm">
                Xây dựng thương hiệu của riêng bạn với giao diện chuyên nghiệp
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg mb-2">Xác thực an toàn</h3>
              <p className="text-gray-600 text-sm">
                Quy trình xác minh giúp tăng độ tin cậy với khách hàng
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg mb-2">Phát triển doanh số</h3>
              <p className="text-gray-600 text-sm">
                Tiếp cận hàng ngàn khách hàng tiềm năng mỗi ngày
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
            <h2 className="text-2xl mb-6">Lợi ích khi trở thành người bán</h2>
            <div className="space-y-4">
              {[
                'Đăng bán sản phẩm không giới hạn',
                'Tích hợp mạng xã hội để tăng tương tác',
                'Công cụ quản lý đơn hàng chuyên nghiệp',
                'Hỗ trợ thanh toán an toàn, nhanh chóng',
                'Phân tích dữ liệu và báo cáo chi tiết',
                'Hỗ trợ khách hàng 24/7'
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={startApplication}
              disabled={isSubmitting}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all text-lg shadow-lg"
            >
              {isSubmitting ? 'Đang tạo hồ sơ...' : 'Bắt đầu đăng ký'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Quay lại</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Đăng ký người bán</h1>
          <p className="text-gray-600">Hoàn thành 3 bước để gửi hồ sơ xét duyệt.</p>
          {user?.role === 'SELLER' && (
            <p className="text-green-700 text-sm mt-2">Tài khoản hiện tại đã có quyền người bán.</p>
          )}
          {status === 'rejected' && (
            <p className="text-red-600 text-sm mt-2">{statusMessage}</p>
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Bước {currentStep}/3</span>
            <span className="text-sm text-gray-600">{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {currentStep === 1 && (
          <form onSubmit={submitStep1} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <h3 className="text-lg">Bước 1: Thông tin cá nhân</h3>

            <div>
              <label className="block text-sm mb-2">Số CMND/CCCD *</label>
              <input
                type="text"
                required
                value={formData.idCardNumber}
                onChange={(e) => setFormData((p) => ({ ...p, idCardNumber: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Ngày sinh *</label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData((p) => ({ ...p, dateOfBirth: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Địa chỉ *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Ảnh CCCD mặt trước</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'idCardFront')}
                  className="hidden"
                  id="id-front"
                />
                <label htmlFor="id-front" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {formData.idCardFront ? formData.idCardFront.name : 'Nhấn để tải ảnh lên'}
                  </p>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">Ảnh CCCD mặt sau</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'idCardBack')}
                  className="hidden"
                  id="id-back"
                />
                <label htmlFor="id-back" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {formData.idCardBack ? formData.idCardBack.name : 'Nhấn để tải ảnh lên'}
                  </p>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !canSubmitStep1}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Lưu và tiếp tục bước 2'}
            </button>
          </form>
        )}

        {currentStep === 2 && (
          <form onSubmit={submitStep2} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <h3 className="text-lg">Bước 2: Thông tin kinh doanh</h3>

            <div>
              <label className="block text-sm mb-2">Tên doanh nghiệp/cửa hàng *</label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData((p) => ({ ...p, businessName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Loại hình kinh doanh</label>
              <input
                type="text"
                value={formData.businessType}
                onChange={(e) => setFormData((p) => ({ ...p, businessType: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Số giấy phép kinh doanh</label>
              <input
                type="text"
                value={formData.businessLicenseNumber}
                onChange={(e) => setFormData((p) => ({ ...p, businessLicenseNumber: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Mã số thuế</label>
              <input
                type="text"
                value={formData.taxCode}
                onChange={(e) => setFormData((p) => ({ ...p, taxCode: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Giấy phép kinh doanh (ảnh)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'businessLicense')}
                  className="hidden"
                  id="business-license"
                />
                <label htmlFor="business-license" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {formData.businessLicense ? formData.businessLicense.name : 'Nhấn để tải ảnh lên'}
                  </p>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-1/2 py-3 border border-gray-300 text-gray-700 rounded-lg"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.businessName}
                className="w-1/2 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Lưu và tiếp tục bước 3'}
              </button>
            </div>
          </form>
        )}

        {currentStep === 3 && (
          <form onSubmit={submitStep3} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <h3 className="text-lg">Bước 3: Thông tin ngân hàng</h3>

            <div>
              <label className="block text-sm mb-2">Tên ngân hàng *</label>
              <input
                type="text"
                required
                value={formData.bankName}
                onChange={(e) => setFormData((p) => ({ ...p, bankName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Số tài khoản *</label>
              <input
                type="text"
                required
                value={formData.bankAccountNumber}
                onChange={(e) => setFormData((p) => ({ ...p, bankAccountNumber: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Tên chủ tài khoản</label>
              <input
                type="text"
                value={formData.bankAccountName}
                onChange={(e) => setFormData((p) => ({ ...p, bankAccountName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Chi nhánh</label>
              <input
                type="text"
                value={formData.bankBranch}
                onChange={(e) => setFormData((p) => ({ ...p, bankBranch: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-1/2 py-3 border border-gray-300 text-gray-700 rounded-lg"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.bankName || !formData.bankAccountNumber}
                className="w-1/2 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi hồ sơ xét duyệt'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
