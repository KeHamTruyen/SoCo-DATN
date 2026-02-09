import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Star, Plus, Minus, Check, Truck, Shield, RotateCcw, MapPin } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import productService, { Product as ProductType } from '../services/product.service';
import { PageLayout } from './Layout/PageLayout';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  content: string;
  timestamp: string;
  images?: string[];
  likes: number;
  isLiked: boolean;
}

export function ProductDetailPage() {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await productService.getProduct(productId);
        setProduct(response.data);
        setLikes(response.data.likesCount || 0);
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.message || 'Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Product images from API or fallback
  const productImages = product?.images && product.images.length > 0
    ? product.images.map(img => img.imageUrl)
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'];

  // Mock reviews
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      userId: '2',
      userName: 'Trần Thị B',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      rating: 5,
      content: 'Sản phẩm rất đẹp và chất lượng! Giao hàng nhanh, đóng gói cẩn thận. Mình rất hài lòng và sẽ ủng hộ shop tiếp.',
      timestamp: '2 ngày trước',
      images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400'],
      likes: 24,
      isLiked: false
    },
    {
      id: '2',
      userId: '3',
      userName: 'Lê Văn C',
      userAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400',
      rating: 4,
      content: 'Chất lượng tốt, giá cả hợp lý. Có điều màu sắc hơi khác so với hình một chút nhưng vẫn đẹp.',
      timestamp: '5 ngày trước',
      likes: 12,
      isLiked: false
    },
    {
      id: '3',
      userId: '4',
      userName: 'Phạm Thị D',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      rating: 5,
      content: 'Chất vải mềm mại, form dáng vừa vặn. Mình cao 1m6 nặng 50kg mặc size M vừa đẹp!',
      timestamp: '1 tuần trước',
      images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400'],
      likes: 18,
      isLiked: true
    }
  ]);

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải sản phẩm...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !product) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl mb-4">Không tìm thấy sản phẩm</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay về trang chủ
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleVariantSelect = (variantName: string, option: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantName]: option
    }));
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Convert API Product to App Product type for CartContext
    const cartProduct = {
      id: product.id,
      sellerId: product.sellerId,
      sellerName: product.seller?.fullName || 'Unknown',
      sellerAvatar: product.seller?.avatarUrl || '',
      sellerUsername: product.seller?.username || '',
      title: product.title,
      price: Number(product.price),
      image: product.images?.[0]?.imageUrl || '',
      description: product.description || '',
      likes: product.likesCount,
      comments: product.commentsCount,
      isLiked: isLiked,
      createdAt: product.createdAt,
      category: product.category?.name || '',
      stock: product.stockQuantity,
      variants: product.variants?.map(v => ({
        id: v.id,
        name: v.variantName,
        options: Object.values(v.options as Record<string, string>)
      }))
    };
    
    for (let i = 0; i < quantity; i++) {
      addToCart(cartProduct, selectedVariants);
    }
    
    alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reviewText.trim()) return;
    
    const newReview: Review = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.fullName,
      userAvatar: user.avatar || '',
      rating: reviewRating,
      content: reviewText,
      timestamp: 'Vừa xong',
      likes: 0,
      isLiked: false
    };
    setReviews([newReview, ...reviews]);
    setReviewText('');
    setReviewRating(5);
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : (product?._count?.reviews ? 4.5 : 0);
  
  // TODO: Implement related products API
  const relatedProducts: any[] = [];

  // Color options with hex values
  const colorMap: { [key: string]: string } = {
    'Trắng': '#FFFFFF',
    'Xanh nhạt': '#E0F2FE',
    'Hồng': '#FFC0CB',
    'Đen': '#000000',
    'Nâu': '#8B4513',
    'Be': '#F5F5DC',
    'Xanh đậm': '#1E3A8A',
    'Xanh': '#3B82F6'
  };

  return (
    <PageLayout
      activePage="product-detail"
      showFooter={true}
      showMobileNav={true}
    >
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left: Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="aspect-square relative bg-gray-100">
                <img
                  src={productImages[selectedImage]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {product.stockQuantity < 10 && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                    Chỉ còn {product.stockQuantity} sản phẩm
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-3">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index 
                      ? 'border-blue-600 scale-105' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Category & Date */}
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                  {product.category?.name || 'Chưa phân loại'}
                </span>
                <span className="text-sm text-gray-500">{new Date(product.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>

              {/* Product Title */}
              <h1 className="text-3xl mb-4">{product.title}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= averageRating
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {averageRating.toFixed(1)} ({reviews.length} đánh giá)
                </span>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Heart className={isLiked ? 'text-red-500 fill-current' : ''} />
                  <span>{likes} lượt thích</span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                {product.compareAtPrice && (
                  <span className="text-xl text-gray-500 line-through mr-3">
                    {Number(product.compareAtPrice).toLocaleString('vi-VN')}đ
                  </span>
                )}
                <span className="text-4xl text-blue-600">{Number(product.price).toLocaleString('vi-VN')}đ</span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm text-gray-500 mb-2">Mô tả</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-4 mb-6">
                  {product.variants.map((variant) => (
                    <div key={variant.id}>
                      <h3 className="text-sm text-gray-700 mb-3">
                        {variant.variantName}: 
                        {selectedVariants[variant.variantName] && (
                          <span className="ml-2 text-blue-600">{selectedVariants[variant.variantName]}</span>
                        )}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.values(variant.options as Record<string, string>).map((option: string, idx: number) => {
                          const isColorVariant = variant.variantName === 'Màu sắc';
                          const colorHex = colorMap[option];
                          const isSelected = selectedVariants[variant.variantName] === option;

                          return (
                            <button
                              key={`${variant.id}-${idx}`}
                              onClick={() => handleVariantSelect(variant.variantName, option)}
                              className={`relative px-4 py-2 rounded-lg border-2 transition-all ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              {isColorVariant && colorHex && (
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-6 h-6 rounded-full border-2 border-gray-300"
                                    style={{ backgroundColor: colorHex }}
                                  />
                                  <span className="text-sm">{option}</span>
                                </div>
                              )}
                              {!isColorVariant && (
                                <span className="text-sm">{option}</span>
                              )}
                              {isSelected && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="text-sm text-gray-700 mb-3">Số lượng</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stockQuantity, parseInt(e.target.value) || 1)))}
                    className="w-20 text-center py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-500">{product.stockQuantity} sản phẩm có sẵn</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Thêm vào giỏ hàng
                </button>
                <button
                  onClick={handleLike}
                  className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                    isLiked
                      ? 'bg-red-50 border-red-300 text-red-600'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Giao hàng</p>
                    <p className="text-sm">Miễn phí</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Bảo hành</p>
                    <p className="text-sm">12 tháng</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <RotateCcw className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-500">Đổi trả</p>
                    <p className="text-sm">7 ngày</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm text-gray-500 mb-4">Người bán</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={product.seller?.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'}
                    alt={product.seller?.fullName || 'Seller'}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{product.seller?.fullName || 'Unknown Seller'}</span>
                      {product.seller?.isVerified && (
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>4.8</span>
                      </div>
                      <span>•</span>
                      <span>245 đánh giá</span>
                      <span>•</span>
                      <span>1.2k người theo dõi</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>Hà Nội, Việt Nam</span>
                    </div>
                  </div>
                </div>
                <button className="px-5 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  Theo dõi
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                { key: 'description', label: 'Mô tả chi tiết' },
                { key: 'reviews', label: `Đánh giá (${reviews.length})` },
                { key: 'shipping', label: 'Vận chuyển' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-6 py-4 text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <h3 className="text-lg mb-4">Thông tin chi tiết</h3>
                <p className="text-gray-700 leading-relaxed mb-4">{product.description}</p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Danh mục</span>
                    <span className="text-gray-900">{product.category?.name || 'Chưa phân loại'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Tình trạng</span>
                    <span className="text-green-600">Còn {product.stockQuantity} sản phẩm</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Thương hiệu</span>
                    <span className="text-gray-900">Việt Nam</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Xuất xứ</span>
                    <span className="text-gray-900">Việt Nam</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {/* Rating Summary */}
                <div className="flex items-start gap-8 mb-8 pb-8 border-b border-gray-200">
                  <div className="text-center">
                    <div className="text-5xl mb-2">{averageRating.toFixed(1)}</div>
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= averageRating
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">{reviews.length} đánh giá</p>
                  </div>

                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter(r => r.rating === star).length;
                      const percentage = (count / reviews.length) * 100;
                      return (
                        <div key={star} className="flex items-center gap-3 mb-2">
                          <span className="text-sm w-8">{star} ⭐</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Add Review Form */}
                <form onSubmit={handleAddReview} className="mb-8 pb-8 border-b border-gray-200">
                  <h3 className="text-lg mb-4">Viết đánh giá của bạn</h3>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-700 mb-2">Đánh giá của bạn</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-2xl"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= reviewRating
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-700 mb-2">Nội dung đánh giá</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                      rows={4}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!reviewText.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Gửi đánh giá
                  </button>
                </form>

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0">
                      <div className="flex items-start gap-4">
                        <img
                          src={review.userAvatar}
                          alt={review.userName}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-sm mb-1">{review.userName}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= review.rating
                                          ? 'text-yellow-500 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500">{review.timestamp}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3">{review.content}</p>
                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-2 mb-3">
                              {review.images.map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Review ${index + 1}`}
                                  className="w-20 h-20 rounded-lg object-cover"
                                />
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-sm">
                            <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600">
                              <Heart className={`w-4 h-4 ${review.isLiked ? 'fill-current text-red-500' : ''}`} />
                              <span>Hữu ích ({review.likes})</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg mb-4">Thông tin vận chuyển</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Truck className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-sm mb-1">Giao hàng miễn phí</h4>
                        <p className="text-sm text-gray-600">Miễn phí vận chuyển cho đơn hàng từ 500.000đ trở lên</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <RotateCcw className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-sm mb-1">Đổi trả trong 7 ngày</h4>
                        <p className="text-sm text-gray-600">Miễn phí đổi trả trong vòng 7 ngày nếu sản phẩm lỗi hoặc không đúng mô tả</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-sm mb-1">Bảo hành 12 tháng</h4>
                        <p className="text-sm text-gray-600">Bảo hành chính hãng từ nhà sản xuất trong 12 tháng</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-sm mb-3">Thời gian giao hàng dự kiến</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>Nội thành Hà Nội: 1-2 ngày</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>Nội thành TP.HCM: 2-3 ngày</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>Các tỉnh thành khác: 3-5 ngày</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h3 className="text-2xl mb-6">Sản phẩm gợi ý</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
                  onClick={() => navigate(`/product/${relatedProduct.id}`)}
                >
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="text-sm line-clamp-2 mb-2 min-h-[40px]">{relatedProduct.title}</h4>
                    <p className="text-lg text-blue-600 mb-2">{relatedProduct.price.toLocaleString('vi-VN')}đ</p>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>4.8</span>
                      <span className="text-gray-400">•</span>
                      <span>{relatedProduct.likes} lượt thích</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
