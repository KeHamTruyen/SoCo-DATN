import { useState } from 'react';
import { X, Image, Tag, Sparkles, Calendar, Search, Check } from 'lucide-react';
import { User } from '../App';

interface CreatePostModalProps {
  currentUser: User;
  onClose: () => void;
  onSubmit: (post: any) => void;
}

export function CreatePostModal({ currentUser, onClose, onSubmit }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [useAI, setUseAI] = useState(false);
  const [aiMode, setAIMode] = useState<'text' | 'image' | 'product' | 'multi'>('text');
  const [schedulePost, setSchedulePost] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Mock products của seller
  const myProducts = [
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
    },
    {
      id: '3',
      title: 'Túi xách da thật sang trọng',
      price: 1290000,
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
      stock: 45
    },
    {
      id: '4',
      title: 'Đồng hồ thời trang nam nữ',
      price: 599000,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      stock: 120
    },
    {
      id: '5',
      title: 'Balo laptop chống nước',
      price: 450000,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      stock: 90
    }
  ];

  const filteredProducts = myProducts.filter(p => 
    p.title.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleProductToggle = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      if (selectedProducts.length < 5) {
        setSelectedProducts([...selectedProducts, productId]);
      } else {
        alert('Tối đa 5 sản phẩm cho mỗi bài viết!');
      }
    }
  };

  const handleAIGenerate = () => {
    // Mock AI generation
    const aiTexts = {
      text: 'Khám phá những sản phẩm tuyệt vời trong ngày! 🌟 Đừng bỏ lỡ cơ hội sở hữu những món đồ chất lượng với giá ưu đãi.',
      image: 'Hình ảnh thật ấn tượng! Sản phẩm này chắc chắn sẽ làm bạn hài lòng. ✨',
      product: '🔥 Sale sốc! Giảm giá đến 50% cho sản phẩm này. Nhanh tay đặt hàng ngay!',
      multi: '💎 Combo ưu đãi đặc biệt! Mua ngay để nhận voucher giảm thêm 10%. Số lượng có hạn!'
    };
    setContent(aiTexts[aiMode]);
  };

  const handleSubmit = () => {
    const post = {
      content,
      products: selectedProducts,
      scheduled: schedulePost ? scheduledDate : null,
      createdAt: new Date().toISOString()
    };
    onSubmit(post);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl">Tạo bài viết</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-12 h-12 rounded-full" />
            <div>
              <p className="text-sm">{currentUser.name}</p>
              <p className="text-xs text-gray-500">Công khai</p>
            </div>
          </div>

          {/* AI Toggle */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="text-sm">Sử dụng AI hỗ trợ viết</span>
            </div>
            <button
              onClick={() => setUseAI(!useAI)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                useAI ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  useAI ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* AI Mode Selection */}
          {useAI && (
            <div className="space-y-3">
              <p className="text-sm">Chọn chế độ AI:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'text', label: 'Text-to-Text', desc: 'Tạo từ ý tưởng' },
                  { value: 'image', label: 'Image-to-Text', desc: 'Tạo từ hình ảnh' },
                  { value: 'product', label: 'Product-to-Text', desc: 'Tạo từ sản phẩm' },
                  { value: 'multi', label: 'Multi-modal', desc: 'Kết hợp tất cả' }
                ].map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => setAIMode(mode.value as any)}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      aiMode === mode.value
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <p className="text-sm">{mode.label}</p>
                    <p className="text-xs text-gray-500">{mode.desc}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={handleAIGenerate}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                Tạo nội dung bằng AI
              </button>
            </div>
          )}

          {/* Content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Bạn đang nghĩ gì?"
            className="w-full min-h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
          />

          {/* Tagged Products Preview */}
          {selectedProducts.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Sản phẩm được gắn thẻ</span>
                </div>
                <span className="text-xs text-gray-500">{selectedProducts.length}/5 sản phẩm</span>
              </div>
              
              {/* Products Grid */}
              <div className="grid grid-cols-1 gap-3">
                {selectedProducts.map(productId => {
                  const product = myProducts.find(p => p.id === productId);
                  return product ? (
                    <div 
                      key={productId} 
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors group"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img 
                          src={product.image} 
                          alt={product.title} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {product.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-base font-semibold text-blue-600">
                            {product.price.toLocaleString('vi-VN')}đ
                          </span>
                          <span className="text-xs text-gray-500">• Còn {product.stock} sản phẩm</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            🔗 Link sản phẩm
                          </span>
                        </div>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductToggle(productId);
                        }}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors flex-shrink-0"
                        title="Xóa sản phẩm"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : null;
                })}
              </div>

              {/* Info Note */}
              <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  💡 Sản phẩm được gắn thẻ sẽ hiển thị dưới bài viết với link trực tiếp để người xem có thể mua ngay
                </p>
              </div>
            </div>
          )}

          {/* Schedule Post */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm">Lên lịch đăng bài</span>
            </div>
            <button
              onClick={() => setSchedulePost(!schedulePost)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                schedulePost ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  schedulePost ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {schedulePost && (
            <div>
              <label className="block text-sm mb-2">Chọn ngày giờ đăng</label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
              <Image className="w-5 h-5" />
              <span className="text-sm">Thêm ảnh</span>
            </button>
            {currentUser.role === 'seller' && (
              <button 
                onClick={() => setShowProductSelector(!showProductSelector)}
                className={`flex items-center gap-2 transition-colors ${
                  showProductSelector ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Tag className="w-5 h-5" />
                <span className="text-sm">Gắn sản phẩm ({selectedProducts.length})</span>
              </button>
            )}
          </div>

          {/* Product Selector */}
          {currentUser.role === 'seller' && showProductSelector && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm">Chọn sản phẩm gắn thẻ</h3>
                <span className="text-xs text-gray-500">Tối đa 5 sản phẩm</span>
              </div>
              
              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              {/* Selected Products */}
              {selectedProducts.length > 0 && (
                <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 mb-2">Đã chọn {selectedProducts.length} sản phẩm:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProducts.map(productId => {
                      const product = myProducts.find(p => p.id === productId);
                      return product ? (
                        <div key={productId} className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg text-sm">
                          <img src={product.image} alt="" className="w-6 h-6 rounded" />
                          <span className="max-w-32 truncate">{product.title}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductToggle(productId);
                            }}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Product List */}
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => handleProductToggle(product.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedProducts.includes(product.id) 
                          ? 'bg-blue-50 border-2 border-blue-600' 
                          : 'border-2 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-clamp-1">{product.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-blue-600">{product.price.toLocaleString('vi-VN')}đ</span>
                          <span className="text-xs text-gray-500">• Kho: {product.stock}</span>
                        </div>
                      </div>
                      {selectedProducts.includes(product.id) && (
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Không tìm thấy sản phẩm nào</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {schedulePost ? 'Lên lịch đăng' : 'Đăng bài'}
          </button>
        </div>
      </div>
    </div>
  );
}