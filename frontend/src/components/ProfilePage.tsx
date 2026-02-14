import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Package, Star, LayoutDashboard, Store } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { mockProducts } from '../data/mockData';
import { PageLayout } from './Layout';

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  if (!user) return null;
  
  // For now, just show the current user's profile
  // Later, fetch profile by username parameter
  const userProducts = mockProducts.filter(p => p.sellerId === user.id);

  return (
    <PageLayout
      activePage="profile"
      showFooter={true}
      showMobileNav={true}
    >
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <img
              src={user.avatarUrl || 'https://i.pravatar.cc/150'}
              alt={user.fullName || 'User'}
              className="w-24 h-24 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl">{user.fullName}</h2>
                {user.isVerified && (
                  <span className="text-blue-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-1">@{user.username}</p>
              {user.bio && (
                <p className="text-gray-700 mb-4">{user.bio}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Hà Nội, Việt Nam</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Tham gia tháng 11/2024</span>
                </div>
              </div>

              <div className="flex gap-6 mb-4">
                <div>
                  <span className="text-lg">0</span>
                  <span className="text-gray-500 ml-1">Người theo dõi</span>
                </div>
                <div>
                  <span className="text-lg">0</span>
                  <span className="text-gray-500 ml-1">Đang theo dõi</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/settings')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Chỉnh sửa hồ sơ
                </button>
                {user.role === 'BUYER' && (
                  <button
                    onClick={() => navigate('/become-seller')}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    Trở thành người bán
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Role Badge */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(user.role === 'SELLER' || user.role === 'ADMIN') ? (
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-gray-600" />
                </div>
              )}
              <div>
                <h3 className="text-lg">
                  {(user.role === 'SELLER' || user.role === 'ADMIN') ? 'Người bán đã xác thực' : 'Người mua'}
                </h3>
                <p className="text-sm text-gray-600">
                  {(user.role === 'SELLER' || user.role === 'ADMIN')
                    ? 'Bạn có thể đăng bán sản phẩm và tiếp cận khách hàng'
                    : 'Nâng cấp lên người bán để bắt đầu kinh doanh'}
                </p>
              </div>
            </div>
            {(user.role === 'SELLER' || user.role === 'ADMIN') && user.isVerified && (
              <div className="text-green-600 flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Đã xác thực</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats for Sellers */}
        {(user.role === 'SELLER' || user.role === 'ADMIN') && (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => navigate('/seller/dashboard')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6 hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <LayoutDashboard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg mb-1">Bảng điều khiển</h3>
                    <p className="text-sm text-blue-100">Quản lý kinh doanh của bạn</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => navigate(`/store/${user.id}`)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-6 hover:from-purple-700 hover:to-purple-800 transition-all shadow-sm hover:shadow-md text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg mb-1">Cửa hàng của tôi</h3>
                    <p className="text-sm text-purple-100">Xem cửa hàng công khai</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sản phẩm</p>
                    <p className="text-2xl">{userProducts.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Đơn hàng</p>
                    <p className="text-2xl">24</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Đánh giá</p>
                    <p className="text-2xl">4.8</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Products */}
        {(user.role === 'SELLER' || user.role === 'ADMIN') && userProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg mb-4">Sản phẩm của tôi</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {userProducts.map((product) => (
                <div
                  key={product.id}
                  className="cursor-pointer group"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="aspect-square rounded-lg overflow-hidden mb-2">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="text-sm line-clamp-1">{product.title}</h4>
                  <p className="text-blue-600">{product.price.toLocaleString('vi-VN')}đ</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State for Buyers */}
        {user.role === 'BUYER' && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg mb-2">Bạn chưa có sản phẩm nào</h3>
            <p className="text-gray-600 mb-6">
              Trở thành người bán để bắt đầu kinh doanh trên nền tảng
            </p>
            <button
              onClick={() => navigate('/become-seller')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Bắt đầu bán hàng
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
