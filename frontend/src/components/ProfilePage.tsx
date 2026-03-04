import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Package, Star, LayoutDashboard, Store } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PageLayout } from './Layout';
import { useState, useEffect } from 'react';
import userService, { UserProfile } from '../services/user.service';
import followService from '../services/follow.service';

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Determine if viewing own profile
  const isOwnProfile = !username || username === currentUser?.username;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        if (isOwnProfile) {
          // Fetch current user's profile
          response = await userService.getMyProfile();
        } else if (username) {
          // Fetch profile by username
          response = await userService.getUserByUsername(username);
        }
        
        if (response?.data) {
          setProfileData(response.data);
          setIsFollowing(Boolean(response.data.isFollowing));
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.response?.data?.message || 'Không thể tải hồ sơ người dùng');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchProfile();
    }
  }, [username, currentUser, isOwnProfile]);

  if (!currentUser) return null;

  if (loading) {
    return (
      <PageLayout activePage="profile" showFooter={true} showMobileNav={true}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải hồ sơ...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !profileData) {
    return (
      <PageLayout activePage="profile" showFooter={true} showMobileNav={true}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg mb-2">Không tìm thấy người dùng</h3>
            <p className="text-gray-600 mb-6">{error || 'Hồ sơ người dùng không tồn tại'}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const userProducts = profileData.products || [];
  const productCount = profileData._count?.products || userProducts.length;
  const followerCount = profileData._count?.followers || 0;
  const followingCount = profileData._count?.following || 0;
  const orderCount = profileData._count?.orders || 0;
  const reviewCount = profileData._count?.reviews || 0;

  const handleToggleFollow = async () => {
    if (!profileData || followLoading) return;

    try {
      setFollowLoading(true);
      const previous = isFollowing;
      setIsFollowing(!previous);
      setProfileData((prev) => {
        if (!prev) return prev;
        const currentFollowers = prev._count?.followers || 0;
        return {
          ...prev,
          _count: {
            ...prev._count,
            followers: previous ? Math.max(0, currentFollowers - 1) : currentFollowers + 1,
          },
        };
      });

      const response = await followService.toggleFollow(profileData.id);
      setIsFollowing(response.data.followed);
    } catch (err) {
      console.error('Error toggling follow:', err);
      setIsFollowing((prev) => !prev);
      setProfileData((prev) => {
        if (!prev) return prev;
        const currentFollowers = prev._count?.followers || 0;
        return {
          ...prev,
          _count: {
            ...prev._count,
            followers: isFollowing ? currentFollowers + 1 : Math.max(0, currentFollowers - 1),
          },
        };
      });
    } finally {
      setFollowLoading(false);
    }
  };

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
              src={profileData.avatarUrl || 'https://i.pravatar.cc/150'}
              alt={profileData.fullName || 'User'}
              className="w-24 h-24 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl">{profileData.fullName}</h2>
                {profileData.isVerified && (
                  <span className="text-blue-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-1">@{profileData.username}</p>
              {profileData.bio && (
                <p className="text-gray-700 mb-4">{profileData.bio}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Hà Nội, Việt Nam</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Tham gia {new Date(profileData.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="flex gap-6 mb-4">
                <div>
                  <span className="text-lg">{followerCount}</span>
                  <span className="text-gray-500 ml-1">Người theo dõi</span>
                </div>
                <div>
                  <span className="text-lg">{followingCount}</span>
                  <span className="text-gray-500 ml-1">Đang theo dõi</span>
                </div>
              </div>

              <div className="flex gap-3">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => navigate('/settings')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Chỉnh sửa hồ sơ
                    </button>
                    {profileData.role === 'BUYER' && (
                      <button
                        onClick={() => navigate('/become-seller')}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                      >
                        Trở thành người bán
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={handleToggleFollow}
                    disabled={followLoading}
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      isFollowing
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {followLoading ? 'Đang xử lý...' : isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
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
              {(profileData.role === 'SELLER' || profileData.role === 'ADMIN') ? (
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
                  {(profileData.role === 'SELLER' || profileData.role === 'ADMIN') ? 'Người bán đã xác thực' : 'Người mua'}
                </h3>
                <p className="text-sm text-gray-600">
                  {(profileData.role === 'SELLER' || profileData.role === 'ADMIN')
                    ? (isOwnProfile ? 'Bạn có thể đăng bán sản phẩm và tiếp cận khách hàng' : 'Người dùng này có thể bán sản phẩm')
                    : (isOwnProfile ? 'Nâng cấp lên người bán để bắt đầu kinh doanh' : 'Người dùng này là người mua')}
                </p>
              </div>
            </div>
            {(profileData.role === 'SELLER' || profileData.role === 'ADMIN') && profileData.isVerified && (
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
        {(profileData.role === 'SELLER' || profileData.role === 'ADMIN') && (
          <>
            {/* Quick Actions - Only show for own profile */}
            {isOwnProfile && (
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
                  onClick={() => navigate(`/store/${profileData.id}`)}
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
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sản phẩm</p>
                    <p className="text-2xl">{productCount}</p>
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
                    <p className="text-2xl">{orderCount}</p>
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
                    <p className="text-2xl">{reviewCount > 0 ? '4.8' : '0'}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Products */}
        {(profileData.role === 'SELLER' || profileData.role === 'ADMIN') && userProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg mb-4">{isOwnProfile ? 'Sản phẩm của tôi' : 'Sản phẩm'}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {userProducts.map((product) => {
                const primaryImage = product.images?.find(img => img.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl;
                return (
                  <div
                    key={product.id}
                    className="cursor-pointer group"
                    onClick={() => navigate(`/product/${product.slug || product.id}`)}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden mb-2">
                      <img
                        src={primaryImage || 'https://via.placeholder.com/300'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h4 className="text-sm line-clamp-1">{product.name}</h4>
                    <p className="text-blue-600">{product.price.toLocaleString('vi-VN')}đ</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State for Buyers */}
        {profileData.role === 'BUYER' && isOwnProfile && (
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

        {/* Empty State for viewing Buyer's profile */}
        {profileData.role === 'BUYER' && !isOwnProfile && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg mb-2">Người dùng này chưa có sản phẩm</h3>
            <p className="text-gray-600">
              {profileData.fullName} là người mua hàng trên nền tảng
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
