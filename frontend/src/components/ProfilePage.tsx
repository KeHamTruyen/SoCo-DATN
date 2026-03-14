import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Package, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PageLayout } from './Layout';
import { useState, useEffect } from 'react';
import userService, { UserProfile } from '../services/user.service';
import * as postService from '../services/post.service';

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<postService.Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!profileData) return;

      const isSellerLike = profileData.role === 'SELLER' || profileData.role === 'ADMIN';
      if (isSellerLike) {
        setUserPosts([]);
        return;
      }

      try {
        setLoadingPosts(true);
        const response = await postService.getUserPosts(profileData.id, {
          page: 1,
          limit: 20,
          status: 'PUBLISHED'
        });
        setUserPosts(response.data || []);
      } catch (err) {
        console.error('Error fetching user posts:', err);
        setUserPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchUserPosts();
  }, [profileData]);

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
  const followerCount = profileData._count?.followers || 0;
  const followingCount = profileData._count?.following || 0;

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
                  <>
                    <button
                      onClick={() => {/* TODO: Implement follow/unfollow */}}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Theo dõi
                    </button>
                    <button
                      onClick={() => navigate(`/messages?recipientId=${profileData.id}`)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Nhắn tin"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Role-specific badge/stats moved to store page */}

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

        {/* Posts for non-seller users */}
        {profileData.role === 'BUYER' && loadingPosts && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-600">
            Đang tải bài đăng...
          </div>
        )}

        {profileData.role === 'BUYER' && !loadingPosts && userPosts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg mb-4">{isOwnProfile ? 'Bài đăng của tôi' : `Bài đăng của ${profileData.fullName}`}</h3>
            <div className="space-y-4">
              {userPosts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="w-full text-left border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm text-gray-700 line-clamp-3 mb-3">{post.content}</p>
                  {post.mediaUrls?.[0] && (
                    <img
                      src={post.mediaUrls[0]}
                      alt="Post media"
                      className="w-full max-h-64 object-cover rounded-lg mb-3"
                    />
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </span>
                    <span>
                      {(post._count?.likes || 0)} lượt thích • {(post._count?.comments || 0)} bình luận
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
