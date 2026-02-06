import { useState } from 'react';
import { Heart, MessageCircle, ShoppingCart, Store, Users } from 'lucide-react';
import { User as UserType, Product } from '../App';
import { mockProducts } from '../data/mockData';
import { CreatePostModal } from './CreatePostModal';
import { PostWithProducts } from './PostWithProducts';
import { PageLayout } from './Layout';

interface HomePageProps {
  currentUser: UserType;
  onNavigate: (page: any, productId?: string) => void;
  onLogout: () => void;
  cartItemCount: number;
  onAddToCart: (product: Product) => void;
}

export function HomePage({ currentUser, onNavigate, onLogout, cartItemCount, onAddToCart }: HomePageProps) {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [activeTab, setActiveTab] = useState<'for-you' | 'following'>('for-you');
  const [showCreatePost, setShowCreatePost] = useState(false);

  const handleLike = (productId: string) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  const handleCreatePost = (post: any) => {
    console.log('Bài viết mới:', post);
    alert('Bài viết đã được tạo thành công!');
  };

  return (
    <PageLayout
      currentUser={currentUser}
      onNavigate={onNavigate}
      onLogout={onLogout}
      cartItemCount={cartItemCount}
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
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="text-sm font-medium">{currentUser.name}</h3>
                <p className="text-sm text-gray-500">@{currentUser.username}</p>
              </div>
            </div>
            <div className="flex gap-4 text-sm mb-4">
              <div>
                <span className="text-gray-900">{currentUser.followers}</span>
                <span className="text-gray-500 ml-1">Người theo dõi</span>
              </div>
              <div>
                <span className="text-gray-900">{currentUser.following}</span>
                <span className="text-gray-500 ml-1">Đang theo dõi</span>
              </div>
            </div>
            {currentUser.role === 'buyer' && (
              <button
                onClick={() => onNavigate('become-seller')}
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
                  onClick={() => onNavigate('group-detail', String(group.id))}
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
              onClick={() => onNavigate('groups')}
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
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full"
              />
              <span className="text-gray-500">Bạn đang nghĩ gì?</span>
            </button>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {/* Post with Tagged Products - Example */}
            <PostWithProducts
              post={{
                id: 'post-tagged-1',
                author: {
                  id: 'seller-1',
                  name: 'Shop Thời Trang Việt',
                  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
                  isVerified: true
                },
                content: '🔥 FLASH SALE CUỐI TUẦN! 🔥\n\nGiảm giá SỐC lên đến 50% cho tất cả sản phẩm áo thun và giày sneaker! \n\nCác bạn nhanh tay đặt hàng ngay kẻo hết nhé! Số lượng có hạn! 🛒✨\n\n#FlashSale #ThờiTrang #SaleOff #MuaSắm',
                image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800',
                timestamp: '2 giờ trước',
                likes: 456,
                comments: 89,
                shares: 34,
                isLiked: false,
                taggedProducts: [
                  {
                    id: '1',
                    title: 'Áo thun nam cotton cao cấp',
                    price: 299000,
                    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
                    stock: 150
                  },
                  {
                    id: '2',
                    title: 'Giày sneaker thể thao năng động',
                    price: 899000,
                    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
                    stock: 80
                  }
                ]
              }}
              onNavigate={onNavigate}
              onLike={() => console.log('Liked post')}
              onAddToCart={onAddToCart}
            />

            {/* Sample Posts */}
            {[
              {
                id: 'post-1',
                type: 'post',
                author: {
                  id: '1',
                  name: 'Nguyễn Văn A',
                  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
                  isVerified: true
                },
                content: 'Hôm nay mình nhận được bộ outfit mới! Chất vải mềm mại, thiết kế sang trọng. Các bạn xem hình nhé! 🔥✨',
                image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
                timestamp: '3 giờ trước',
                likes: 234,
                comments: 45,
                shares: 12,
                isLiked: false
              },
              {
                id: 'post-2',
                type: 'post',
                author: {
                  id: '2',
                  name: 'Trần Thị B',
                  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
                  isVerified: false
                },
                content: 'Review chi tiết về chiếc túi xách mới! Link các sản phẩm tương tự ở trong bài viết nhé 👜💕',
                image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
                timestamp: '5 giờ trước',
                likes: 189,
                comments: 32,
                shares: 8,
                isLiked: true
              }
            ].map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onNavigate('post-detail', post.id)}
              >
                {/* Author Info */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{post.author.name}</span>
                        {post.author.isVerified && (
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{post.timestamp}</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-400"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </div>

                {/* Post Content */}
                <div className="px-4 pb-3">
                  <p className="text-gray-700">{post.content}</p>
                </div>

                {/* Post Image */}
                <div className="relative">
                  <img
                    src={post.image}
                    alt=""
                    className="w-full h-auto"
                  />
                </div>

                {/* Interaction Bar */}
                <div className="flex items-center justify-between p-4 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className={`flex items-center gap-2 ${
                      post.isLiked ? 'text-red-500' : 'text-gray-600'
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`}
                    />
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 text-gray-600"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">{post.comments}</span>
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span className="text-sm">{post.shares}</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Products Feed (existing products) */}
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onNavigate('product-detail', product.id)}
              >
                {/* Seller Info */}
                <div className="flex items-center justify-between p-4">
                  <div 
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('store', product.sellerId);
                    }}
                  >
                    <img
                      src={product.sellerAvatar}
                      alt={product.sellerName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm hover:text-blue-600">{product.sellerName}</span>
                        {product.id === '1' && (
                          <span className="text-blue-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{product.createdAt}</p>
                    </div>
                  </div>
                  <button className="text-gray-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </div>

                {/* Product Image */}
                <div className="relative aspect-square">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                    {product.category}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-lg mb-2">{product.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl text-blue-600">{product.price.toLocaleString('vi-VN')}đ</span>
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Thêm vào giỏ
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(product.id);
                      }}
                      className={`flex items-center gap-2 ${
                        product.isLiked ? 'text-red-500' : 'text-gray-600'
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${product.isLiked ? 'fill-current' : ''}`}
                      />
                      <span className="text-sm">{product.likes}</span>
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-gray-600"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm">{product.comments}</span>
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-600 ml-auto"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal
          currentUser={currentUser}
          onClose={() => setShowCreatePost(false)}
          onSubmit={handleCreatePost}
        />
      )}
    </PageLayout>
  );
}