import { Trash2, Plus, Minus, ShoppingBag, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import cartService, { Cart as CartType } from '../services/cart.service';

export function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null); // Track which item is being updated

  // Load cart data
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartService.getCart();
      setCart(response.data);
    } catch (err: any) {
      console.error('Load cart error:', err);
      setError(err.response?.data?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      // Remove item
      await handleRemoveItem(itemId);
      return;
    }

    try {
      setUpdating(itemId);
      const response = await cartService.updateCartItem(itemId, { quantity: newQuantity });
      setCart(response.data);
    } catch (err: any) {
      console.error('Update quantity error:', err);
      alert(err.response?.data?.message || 'Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setUpdating(itemId);
      const response = await cartService.removeFromCart(itemId);
      setCart(response.data);
    } catch (err: any) {
      console.error('Remove item error:', err);
      alert(err.response?.data?.message || 'Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await cartService.clearCart();
      setCart(response.data);
    } catch (err: any) {
      console.error('Clear cart error:', err);
      alert(err.response?.data?.message || 'Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (!user) {
    return null;
  }

  const subtotal = cart?.subtotal || 0;
  const shipping = subtotal > 500000 ? 0 : 30000;
  const total = subtotal + shipping;
  const cartItems = cart?.items || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadCart}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to Home
          </button>
          <h1 className="text-2xl font-semibold">Shopping Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-6">
              Bạn chưa có sản phẩm nào trong giỏ hàng
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Khám phá sản phẩm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg">Sản phẩm đã chọn ({cartItems.length})</h2>
                  {cartItems.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Xóa tất cả
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 pb-4 border-b border-gray-100 last:border-0"
                    >
                      <div
                        className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                        onClick={() => navigate(`/product/${item.product.slug}`)}
                      >
                        <img
                          src={item.product.images[0]?.imageUrl || '/placeholder.png'}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-sm mb-1 line-clamp-2 cursor-pointer hover:text-blue-600"
                          onClick={() => navigate(`/product/${item.product.slug}`)}
                        >
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">{item.product.seller.fullName}</p>
                        {item.selectedVariant && (
                          <p className="text-xs text-gray-500 mb-2">
                            Variant: {JSON.stringify(item.selectedVariant)}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-blue-600">
                            {Number(item.product.price).toLocaleString('vi-VN')}đ
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={updating === item.id}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={updating === item.id}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={updating === item.id}
                              className="ml-2 text-red-600 hover:text-red-700 disabled:opacity-50"
                            >
                              {updating === item.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-lg mb-4">Thông tin đơn hàng</h2>
                
                <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính</span>
                    <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span>{shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString('vi-VN')}đ`}</span>
                  </div>
                  {subtotal < 500000 && shipping > 0 && (
                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                      Mua thêm {(500000 - subtotal).toLocaleString('vi-VN')}đ để được miễn phí vận chuyển
                    </div>
                  )}
                </div>

                <div className="flex justify-between mb-6">
                  <span className="text-lg">Tổng cộng</span>
                  <span className="text-2xl text-blue-600">{total.toLocaleString('vi-VN')}đ</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-3"
                >
                  Thanh toán
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Tiếp tục mua hàng
                </button>

                <div className="mt-6 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Thanh toán an toàn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Đổi trả trong 7 ngày</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Hỗ trợ 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}