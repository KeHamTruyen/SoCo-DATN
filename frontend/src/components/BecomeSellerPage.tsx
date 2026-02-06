import { useState } from 'react';
import { ArrowLeft, Upload, CheckCircle, ShieldCheck, Store, TrendingUp } from 'lucide-react';

interface BecomeSellerPageProps {
  onNavigate: (page: 'home' | 'profile' | 'become-seller' | 'product-detail' | 'cart') => void;
  onComplete: () => void;
}

type Step = 'intro' | 'form' | 'verification' | 'success';

export function BecomeSellerPage({ onNavigate, onComplete }: BecomeSellerPageProps) {
  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [formData, setFormData] = useState({
    shopName: '',
    description: '',
    phoneNumber: '',
    address: '',
    idCardFront: null as File | null,
    idCardBack: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'idCardFront' | 'idCardBack') => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('verification');
    // Simulate verification process
    setTimeout(() => {
      setCurrentStep('success');
    }, 3000);
  };

  const handleComplete = () => {
    onComplete();
  };

  if (currentStep === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button
                onClick={() => onNavigate('home')}
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
              onClick={() => setCurrentStep('form')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all text-lg shadow-lg"
            >
              Bắt đầu đăng ký
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'form') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <button
                onClick={() => setCurrentStep('intro')}
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
            <h1 className="text-3xl mb-2">Thông tin đăng ký</h1>
            <p className="text-gray-600">Vui lòng điền đầy đủ thông tin để xác thực tài khoản người bán</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Bước 2/3</span>
              <span className="text-sm text-gray-600">67%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full" style={{ width: '67%' }}></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div>
              <label className="block text-sm mb-2">Tên cửa hàng *</label>
              <input
                type="text"
                required
                value={formData.shopName}
                onChange={(e) => setFormData(prev => ({ ...prev, shopName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="VD: Thời trang ABC"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Mô tả cửa hàng *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Giới thiệu về cửa hàng của bạn..."
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Số điện thoại *</label>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="0123456789"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Địa chỉ *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Số nhà, đường, phường, quận, thành phố"
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg mb-4">Xác thực danh tính</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">CMND/CCCD mặt trước *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-600 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      required
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
                  <label className="block text-sm mb-2">CMND/CCCD mặt sau *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-600 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      required
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
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700">
              <p className="mb-2">📌 Lưu ý:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Thông tin phải chính xác và trung thực</li>
                <li>Ảnh CMND/CCCD cần rõ nét, đầy đủ thông tin</li>
                <li>Quá trình xác thực có thể mất 1-3 ngày làm việc</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Gửi yêu cầu xác thực
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (currentStep === 'verification') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-12 shadow-sm">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <ShieldCheck className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl mb-4">Đang xác thực...</h2>
            <p className="text-gray-600 mb-6">
              Hệ thống đang kiểm tra thông tin của bạn. Vui lòng đợi trong giây lát.
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-12 shadow-lg">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl mb-4">Chúc mừng! 🎉</h2>
            <p className="text-gray-600 mb-8">
              Tài khoản của bạn đã được xác thực thành công. Giờ đây bạn có thể bắt đầu bán hàng trên Social Commerce.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleComplete}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Đến trang cá nhân
              </button>
              <button
                onClick={() => onNavigate('home')}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Khám phá trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
