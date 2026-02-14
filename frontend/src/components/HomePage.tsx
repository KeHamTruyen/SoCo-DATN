import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Store, Users, Loader2, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { CreatePostModal } from './CreatePostModal';
import { PageLayout } from './Layout';
import * as postService from '../services/post.service';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [posts, setPosts] = useState<postService.Post[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  if (!user) return null;

  // Load posts
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const response = await postService.getPosts({ page: 1, limit: 20, status: 'PUBLISHED' });
        setPosts(response.data);
        setHasMore(response.pagination.currentPage < response.pagination.totalPages);
      } catch (error) {
        console.error('Error loading posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Load more posts
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await postService.getPosts({ page: nextPage, limit: 20, status: 'PUBLISHED' });
      setPosts([...posts, ...response.data]);
      setPage(nextPage);
      setHasMore(response.pagination.currentPage < response.pagination.totalPages);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      // Optimistic update
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { 
                ...p, 
                isLiked: !p.isLiked, 
                likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1 
              }
            : p
        )
      );

      await postService.toggleLike(postId);
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { 
                ...p, 
                isLiked: !p.isLiked, 
                likesCount: p.isLiked ? p.likesCount + 1 : p.likesCount - 1 
              }
            : p
        )
      );
    }
  };

  const handleCreatePost = (post: postService.Post) => {
    // Add new post to the top of the feed
    setPosts([post, ...posts]);
  };

  const formatTime = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
    } catch {
      return 'Vừa xong';
    }
  };

  return (
    <PageLayout
      activePage="home"
      showFooter={true}
    >
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="md:col-span-1">
          {/* User Profile Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={user.avatarUrl || 'https://i.pravatar.cc/150'}
                alt={user.fullName || 'User'}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="text-sm font-medium">{user.fullName}</h3>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
            </div>
            <div className="flex gap-4 text-sm mb-4">
              <div>
                <span className="text-gray-900">0</span>
                <span className="text-gray-500 ml-1">Người theo dõi</span>
              </div>
              <div>
                <span className="text-gray-900">0</span>
                <span className="text-gray-500 ml-1">Đang theo dõi</span>
              </div>
            </div>
            {user.role === 'BUYER' && (
              <button
                onClick={() => navigate('/become-seller')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                <Store className="w-4 h-4 inline mr-2" />
                Trở thành người bán
              </button>
            )}
          </div>

          {/* Groups Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm mt-4">
            <h3 className="text-sm mb-4">Nhóm của bạn</h3>
            <div className="space-y-3 mb-4">
              {[
                { id: 1, name: 'Cộng đồng Thời trang Việt', members: 12500, image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400' },
                { id: 2, name: 'Đam mê Công nghệ', members: 8900, image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400' },
                { id: 3, name: 'Review Sản phẩm', members: 6700, image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400' }
              ].map((group) => (
                <button
                  key={group.id}
                  onClick={() => navigate(`/groups/${group.id}`)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <img
                    src={group.image}
                    alt={group.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{group.name}</p>
                    <p className="text-xs text-gray-500">{group.members.toLocaleString()} thành viên</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/groups')}
              className="w-full text-blue-600 hover:text-blue-700 text-sm py-2 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Users className="w-4 h-4 inline mr-1" />
              Xem tất cả nhóm
            </button>
          </div>

          {/* Popular Categories Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm mt-4">
            <h3 className="text-sm mb-4">Danh mục phổ biến</h3>
            <div className="space-y-2">
              {['Thời trang', 'Điện tử', 'Nội thất', 'Mỹ phẩm', 'Thể thao'].map((category) => (
                <button
                  key={category}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Feed */}
        <div className="md:col-span-3">
          {/* Create Post Button */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <button
              onClick={() => setShowCreatePost(true)}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <img
                src={user.avatarUrl || 'https://i.pravatar.cc/150'}
                alt={user.fullName || 'User'}
                className="w-10 h-10 rounded-full"
              />
              <span className="text-gray-500">Bạn đang nghĩ gì?</span>
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}

          {/* Posts Feed */}
          <div className="space-y-4">
            {!loading && posts.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500 mb-4">Chưa có bài viết nào</p>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Tạo bài viết đầu tiên
                </button>
              </div>
            )}

            {/* Real Posts from API */}
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/posts/${post.id}`)}
              >
                {/* Author Info */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.fullName || post.author.username)}`}
                      alt={post.author.fullName || post.author.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium">{post.author.fullName || post.author.username}</p>
                      <p className="text-xs text-gray-500">{formatTime(post.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="px-4 pb-3">
                  <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Post Media */}
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <div className={`grid gap-2 ${post.mediaUrls.length === 1 ? 'grid-cols-1' : post.mediaUrls.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                    {post.mediaUrls.slice(0, 4).map((url, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={url}
                          alt={`Media ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === 3 && post.mediaUrls.length > 4 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-2xl font-bold">
                            +{post.mediaUrls.length - 4}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Tagged Product */}
                {post.product && (
                  <div 
                    className="mx-4 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/product/${post.product!.slug}`);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img 
                          src={post.product.images[0]?.url || 'https://via.placeholder.com/64'} 
                          alt={post.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{post.product.name}</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {post.product.price.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                      <ShoppingBag className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                )}

                {/* Interaction Bar */}
                <div className="flex items-center justify-between p-4 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(post.id);
                    }}
                    className={`flex items-center gap-2 ${
                      post.isLiked ? 'text-red-500' : 'text-gray-600'
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`}
                    />
                    <span className="text-sm">{post.likesCount}</span>
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 text-gray-600"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">{post.commentsCount}</span>
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 text-gray-600"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">{post.sharesCount}</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {!loading && hasMore && (
              <div className="flex justify-center py-6">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    'Xem thêm bài viết'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onSubmit={handleCreatePost}
        />
      )}
    </PageLayout>
  );
}