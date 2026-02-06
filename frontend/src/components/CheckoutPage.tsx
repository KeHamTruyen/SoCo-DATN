import { useState } from 'react';
import { MapPin, Plus, CreditCard, Wallet, Banknote, Check, Tag, Truck, Package, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { User, CartItem } from '../App';
import { PageLayout } from './Layout';

interface CheckoutPageProps {
  currentUser: User;
  cart: CartItem[];
  onNavigate: (page: any) => void;
  onClearCart: () => void;
  onLogout: () => void;
}

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: any;
  type: 'cod' | 'card' | 'ewallet';
}

export function CheckoutPage({ currentUser, cart, onNavigate, onClearCart, onLogout }: CheckoutPageProps) {
  const [selectedAddress, setSelectedAddress] = useState('1');
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null);
  const [note, setNote] = useState('');

  // Mock addresses
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      name: 'Nguyễn Văn A',
      phone: '0912345678',
      address: '123 Đường ABC, Phường XYZ',
      city: 'Hà Nội',
      district: 'Cầu Giấy',
      isDefault: true
    },
    {
      id: '2',
      name: 'Nguyễn Văn A',
      phone: '0912345678',
      address: '456 Đường DEF, Phường UVW',
      city: 'Hà Nội',
      district: 'Hoàn Kiếm',
      isDefault: false
    }
  ]);

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'cod',
      name: 'Thanh toán khi nhận hàng (COD)',
      description: 'Thanh toán bằng tiền mặt khi nhận hàng',
      icon: Banknote,
      type: 'cod'
    },
    {
      id: 'card',
      name: 'Thẻ tín dụng/Ghi nợ',
      description: 'Visa, Mastercard, JCB',
      icon: CreditCard,
      type: 'card'
    },
    {
      id: 'momo',
      name: 'Ví MoMo',
      description: 'Thanh toán qua ví điện tử MoMo',
      icon: Wallet,
      type: 'ewallet'
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      description: 'Thanh toán qua ví điện tử ZaloPay',
      icon: Wallet,
      type: 'ewallet'
    }
  ];

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const discount = appliedVoucher?.discount || 0;
  const total = subtotal + shippingFee - discount;

  const handleApplyVoucher = () => {
    if (voucherCode.toUpperCase() === 'WELCOME10') {
      setAppliedVoucher({ code: voucherCode, discount: subtotal * 0.1 });
      alert('Áp dụng mã giảm giá thành công! Giảm 10%');
    } else if (voucherCode.toUpperCase() === 'FREESHIP') {
      setAppliedVoucher({ code: voucherCode, discount: shippingFee });
      alert('Áp dụng mã miễn phí vận chuyển thành công!');
    } else {
      alert('Mã giảm giá không hợp lệ!');
    }
  };

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      alert('Vui lòng chọn địa chỉ giao hàng!');
      return;
    }
    if (!selectedPayment) {
      alert('Vui lòng chọn phương thức thanh toán!');
      return;
    }

    const selectedAddr = addresses.find(a => a.id === selectedAddress);
    const selectedPay = paymentMethods.find(p => p.id === selectedPayment);

    const orderData = {
      address: selectedAddr,
      payment: selectedPay,
      items: cart,
      subtotal,
      shippingFee,
      discount,
      total,
      note
    };

    console.log('Order placed:', orderData);
    onClearCart();
    alert('Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.');
    onNavigate('home');
  };

  return (
    <PageLayout
      currentUser={currentUser}
      onNavigate={onNavigate}
      onLogout={onLogout}
      cartItemCount={cart.length}
      activePage="checkout"
      showFooter={true}
      showMobileNav={false}
    >
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg">Địa chỉ giao hàng</h2>
                </div>
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Thêm địa chỉ mới
                </button>
              </div>

              <div className="space-y-3">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    onClick={() => setSelectedAddress(address.id)}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedAddress === address.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm">{address.name}</span>
                          <span className="text-sm text-gray-500">|</span>
                          <span className="text-sm text-gray-600">{address.phone}</span>
                          {address.isDefault && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{address.address}</p>
                        <p className="text-sm text-gray-600">
                          {address.district}, {address.city}
                        </p>
                      </div>
                      {selectedAddress === address.id && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                      <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                        <Edit2 className="w-4 h-4" />
                        Chỉnh sửa
                      </button>
                      {!address.isDefault && (
                        <button className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg">Phương thức thanh toán</h2>
              </div>

              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedPayment === method.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            selectedPayment === method.id ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <Icon className={`w-6 h-6 ${
                              selectedPayment === method.id ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm mb-1">{method.name}</p>
                            <p className="text-xs text-gray-500">{method.description}</p>
                          </div>
                        </div>
                        {selectedPayment === method.id && (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Voucher */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg">Mã giảm giá</h2>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã giảm giá"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                <button
                  onClick={handleApplyVoucher}
                  disabled={!voucherCode.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Áp dụng
                </button>
              </div>

              {appliedVoucher && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-700">
                      Đã áp dụng mã "{appliedVoucher.code}" - Giảm {appliedVoucher.discount.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setAppliedVoucher(null);
                      setVoucherCode('');
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Hủy
                  </button>
                </div>
              )}

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 mb-2">Mã giảm giá có sẵn:</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-600">WELCOME10</span>
                    <span className="text-xs text-gray-600">Giảm 10%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-600">FREESHIP</span>
                    <span className="text-xs text-gray-600">Miễn phí vận chuyển</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Note */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg mb-4">Ghi chú đơn hàng</h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú cho người bán (tùy chọn)..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-lg mb-4">Tóm tắt đơn hàng</h2>

              {/* Products List */}
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2 mb-1">{item.product.title}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">x{item.quantity}</span>
                        <span className="text-sm text-blue-600">
                          {item.product.price.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Details */}
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tạm tính ({cart.length} sản phẩm)</span>
                  <span className="text-gray-900">{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Phí vận chuyển</span>
                  </div>
                  <span className={`${shippingFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}đ`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span className="text-gray-600">Giảm giá</span>
                    </div>
                    <span className="text-green-600">-{discount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                {subtotal >= 500000 && (
                  <div className="p-2 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-700 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Đủ điều kiện miễn phí vận chuyển
                    </p>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg">Tổng cộng</span>
                <span className="text-2xl text-blue-600">{total.toLocaleString('vi-VN')}đ</span>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-lg"
              >
                <Package className="w-5 h-5" />
                Đặt hàng
              </button>

              {/* Policies */}
              <div className="mt-6 space-y-2">
                <div className="flex items-start gap-2 text-xs text-gray-600">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Miễn phí đổi trả trong 7 ngày</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-600">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Bảo hành chính hãng 12 tháng</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-600">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Thanh toán an toàn & bảo mật</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddAddress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-xl">Thêm địa chỉ mới</h3>
              <button
                onClick={() => setShowAddAddress(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Họ và tên</label>
                <input
                  type="text"
                  placeholder="Nhập họ và tên"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Tỉnh/Thành phố</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent">
                    <option>Hà Nội</option>
                    <option>TP. Hồ Chí Minh</option>
                    <option>Đà Nẵng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Quận/Huyện</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent">
                    <option>Cầu Giấy</option>
                    <option>Hoàn Kiếm</option>
                    <option>Đống Đa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Địa chỉ cụ thể</label>
                <textarea
                  placeholder="Số nhà, tên đường, phường/xã..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="setDefault"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                />
                <label htmlFor="setDefault" className="text-sm text-gray-700">
                  Đặt làm địa chỉ mặc định
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddAddress(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    setShowAddAddress(false);
                    alert('Địa chỉ đã được thêm!');
                  }}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Lưu địa chỉ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}