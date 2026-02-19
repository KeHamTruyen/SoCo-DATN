import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Banknote, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import cartService, { Cart } from '../services/cart.service';
import orderService, { CreateOrderRequest } from '../services/order.service';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Form data
  const [shippingName, setShippingName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingDistrict, setShippingDistrict] = useState('');
  const [shippingWard, setShippingWard] = useState('');
  const [shippingNote, setShippingNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK_TRANSFER' | 'MOMO' | 'VNPAY' | 'ZALOPAY'>('COD');

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      setCart(response.data);

      // Pre-fill with user info
      if (user) {
        setShippingName(user.fullName || '');
        setShippingPhone(user.phone || '');
      }
    } catch (err: any) {
      console.error('Load cart error:', err);
      setError(err.response?.data?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cart || cart.items.length === 0) {
      alert('Cart is empty');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const orderData: CreateOrderRequest = {
        shippingName,
        shippingPhone,
        shippingAddress,
        shippingCity,
        shippingDistrict,
        shippingWard,
        shippingNote,
        paymentMethod,
      };

      const response = await orderService.createOrder(orderData);

      // If payment method is mock (COD), auto-confirm payment
      if (paymentMethod === 'COD') {
        await orderService.confirmPayment(response.data.id);
      }

      setOrderSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/orders/${response.data.id}`);
      }, 2000);
    } catch (err: any) {
      console.error('Create order error:', err);
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  const subtotal = cart?.subtotal || 0;
  const shippingFee = subtotal > 500000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Order placed successfully!</h2>
          <p className="text-gray-600">Redirecting to order details...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate('/cart')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/cart')}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to Cart
          </button>
          <h1 className="text-2xl font-semibold">Checkout</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold">Shipping Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      required
                      pattern="[0-9]{10,11}"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Address *</label>
                    <input
                      type="text"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      type="text"
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">District</label>
                    <input
                      type="text"
                      value={shippingDistrict}
                      onChange={(e) => setShippingDistrict(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Ward</label>
                    <input
                      type="text"
                      value={shippingWard}
                      onChange={(e) => setShippingWard(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Note</label>
                    <textarea
                      value={shippingNote}
                      onChange={(e) => setShippingNote(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold">Payment Method</h2>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-blue-600 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Banknote className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Cash on Delivery (COD)</p>
                      <p className="text-sm text-gray-500">Pay when you receive</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-blue-600 transition-colors opacity-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="MOMO"
                      disabled
                      className="w-4 h-4 text-blue-600"
                    />
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">MoMo E-Wallet</p>
                      <p className="text-sm text-gray-500">Coming soon</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-blue-600 transition-colors opacity-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="VNPAY"
                      disabled
                      className="w-4 h-4 text-blue-600"
                    />
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">VNPay</p>
                      <p className="text-sm text-gray-500">Coming soon</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4 pb-4 border-b">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.product.images[0]?.imageUrl || '/placeholder.png'}
                        alt={item.product.name}
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">
                        {(Number(item.product.price) * item.quantity).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span>{shippingFee === 0 ? 'Free' : `${shippingFee.toLocaleString('vi-VN')}đ`}</span>
                  </div>
                </div>

                <div className="flex justify-between mb-6">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-semibold text-blue-600">
                    {total.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
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