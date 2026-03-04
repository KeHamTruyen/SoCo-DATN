import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Banknote, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import cartService, { Cart } from '../services/cart.service';
import orderService, { CreateOrderRequest } from '../services/order.service';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshCartCount } = useCart();
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

      await refreshCartCount();

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
