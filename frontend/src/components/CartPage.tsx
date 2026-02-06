import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { CartItem, User } from '../App';
import { PageLayout } from './Layout';

interface CartPageProps {
  currentUser: User;
  cart: CartItem[];
  onNavigate: (page: any) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
  onLogout: () => void;
}

export function CartPage({ currentUser, cart, onNavigate, onUpdateQuantity, onClearCart, onLogout }: CartPageProps) {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    onNavigate('checkout');
  };

  return (
    <PageLayout
      currentUser={currentUser}
      onNavigate={onNavigate}
      onLogout={onLogout}
      cartItemCount={cart.length}
      activePage="cart"
      showFooter={true}
      showMobileNav={true}
    >
      <div>
        {cart.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-6">
              Bạn chưa có sản phẩm nào trong giỏ hàng
            </p>
            <button
              onClick={() => onNavigate('home')}
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
                  <h2 className="text-lg">Sản phẩm đã chọn ({cart.length})</h2>
                  {cart.length > 0 && (
                    <button
                      onClick={onClearCart}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Xóa tất cả
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex gap-4 pb-4 border-b border-gray-100 last:border-0"
                    >
                      <div
                        className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                        onClick={() => onNavigate('product-detail', item.product.id)}
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-sm mb-1 line-clamp-2 cursor-pointer hover:text-blue-600"
                          onClick={() => onNavigate('product-detail', item.product.id)}
                        >
                          {item.product.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">{item.product.sellerName}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-blue-600">
                            {item.product.price.toLocaleString('vi-VN')}đ
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, 0)}
                              className="ml-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
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
                  onClick={() => onNavigate('home')}
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
    </PageLayout>
  );
}