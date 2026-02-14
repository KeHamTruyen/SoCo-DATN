import { useState, useEffect } from 'react';
import { X, Image, Tag, Sparkles, Calendar, Search, Check, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as postService from '../services/post.service';
import * as productService from '../services/product.service';
import uploadService from '../services/upload.service';

interface CreatePostModalProps {
  onClose: () => void;
  onSubmit: (post: any) => void;
}

export function CreatePostModal({ onClose, onSubmit }: CreatePostModalProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(undefined);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO' | 'NONE'>('NONE');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'FOLLOWERS' | 'PRIVATE'>('PUBLIC');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');
  const [useAI, setUseAI] = useState(false);
  const [aiMode, setAIMode] = useState<'text' | 'image' | 'product' | 'multi'>('text');
  const [schedulePost] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Load user's products if they're a seller
  useEffect(() => {
    const loadProducts = async () => {
      if (user?.role === 'SELLER') {
        try {
          setLoadingProducts(true);
          const response = await productService.getSellerProducts();
          setMyProducts(response.data || []);
        } catch (err) {
          console.error('Error loading products:', err);
        } finally {
          setLoadingProducts(false);
        }
      }
    };

    loadProducts();
  }, [user]);

  if (!user) return null;

  const filteredProducts = myProducts.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleProductToggle = (productId: string) => {
    if (selectedProduct === productId) {
      setSelectedProduct(undefined);
    } else {
      setSelectedProduct(productId);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Limit to 10 files
    const filesToUpload = Array.from(files).slice(0, 10 - mediaUrls.length);
    
    try {
      setUploading(true);
      setError(null);

      const uploadPromises = filesToUpload.map(file => 
        uploadService.uploadPostMedia(file)
      );

      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.data.url);
      
      setMediaUrls([...mediaUrls, ...newUrls]);
      
      // Determine media type from first file
      if (mediaUrls.length === 0 && filesToUpload.length > 0) {
        const firstFile = filesToUpload[0];
        if (firstFile.type.startsWith('image/')) {
          setMediaType('IMAGE');
        } else if (firstFile.type.startsWith('video/')) {
          setMediaType('VIDEO');
        }
      }
    } catch (err: any) {
      console.error('Error uploading media:', err);
      setError(err.response?.data?.message || 'Không thể tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveMedia = (index: number) => {
    const newUrls = mediaUrls.filter((_, i) => i !== index);
    setMediaUrls(newUrls);
    if (newUrls.length === 0) {
      setMediaType('NONE');
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

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('Vui lòng nhập nội dung bài viết');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const postData: postService.CreatePostData = {
        content: content.trim(),
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        mediaType,
        productId: selectedProduct,
        status,
        visibility,
      };

      const response = await postService.createPost(postData);
      
      onSubmit(response.data.post);
      onClose();
    } catch (err: any) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.message || 'Không thể tạo bài viết');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tạo bài viết</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* User Info */}
          <div className="flex items-center gap-3">
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.username)}`} 
              alt={user.fullName || user.username} 
              className="w-12 h-12 rounded-full object-cover" 
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{user.fullName || user.username}</p>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="text-xs text-gray-500 bg-gray-100 border-none rounded px-2 py-1 cursor-pointer"
              >
                <option value="PUBLIC">🌍 Công khai</option>
                <option value="FOLLOWERS">👥 Người theo dõi</option>
                <option value="PRIVATE">🔒 Chỉ mình tôi</option>
              </select>
            </div>
          </div>

          {/* AI Toggle */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">Sử dụng AI hỗ trợ viết</span>
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
              <p className="text-sm font-medium">Chọn chế độ AI:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'text', label: 'Text-to-Text', desc: 'Tạo từ ý tưởng' },
                  { value: 'image', label: 'Image-to-Text', desc: 'Tạo từ hình ảnh' },
                  { value: 'product', label: 'Product-to-Text', desc: 'Tạo từ sản phẩm' },
                  { value: 'multi', label: 'Multi-modal', desc: 'Kết hợp tất cả' }
                ].map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setAIMode(mode.value as any)}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      aiMode === mode.value
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <p className="text-sm font-medium">{mode.label}</p>
                    <p className="text-xs text-gray-500">{mode.desc}</p>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAIGenerate}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium"
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

          {/* Media Preview */}
          {mediaUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {mediaUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={url} alt={`Media ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia(index)}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tagged Product Preview */}
          {selectedProduct && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Sản phẩm được gắn thẻ</span>
                </div>
              </div>
              
              {(() => {
                const product = myProducts.find(p => p.id === selectedProduct);
                return product ? (
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img 
                        src={product.images[0]?.url || 'https://via.placeholder.com/64'} 
                        alt={product.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium line-clamp-1">{product.name}</h4>
                      <span className="text-base font-semibold text-blue-600">
                        {product.price.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(undefined)}
                      className="text-gray-400 hover:text-red-600 p-2 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
            <label className="flex items-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleMediaUpload}
                className="hidden"
                disabled={uploading || mediaUrls.length >= 10}
              />
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
              <span className="text-sm">
                {uploading ? 'Đang tải...' : `Thêm ảnh/video (${mediaUrls.length}/10)`}
              </span>
            </label>
            
            {user.role === 'SELLER' && (
              <button 
                type="button"
                onClick={() => setShowProductSelector(!showProductSelector)}
                className={`flex items-center gap-2 transition-colors ${
                  showProductSelector ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Tag className="w-5 h-5" />
                <span className="text-sm">
                  Gắn sản phẩm {selectedProduct ? '(1)' : ''}
                </span>
              </button>
            )}
          </div>

          {/* Product Selector */}
          {user.role === 'SELLER' && showProductSelector && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Chọn sản phẩm gắn thẻ</h3>
                <span className="text-xs text-gray-500">Chọn 1 sản phẩm</span>
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

              {/* Product List */}
              <div className="max-h-60 overflow-y-auto space-y-2">
                {loadingProducts ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                  </div>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => handleProductToggle(product.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedProduct === product.id
                          ? 'bg-blue-50 border-2 border-blue-600' 
                          : 'border-2 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img 
                          src={product.images[0]?.url || 'https://via.placeholder.com/48'} 
                          alt={product.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-clamp-1 font-medium">{product.name}</p>
                        <span className="text-sm text-blue-600 font-semibold">
                          {product.price.toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      {selectedProduct === product.id && (
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">
                      {myProducts.length === 0 
                        ? 'Bạn chưa có sản phẩm nào' 
                        : 'Không tìm thấy sản phẩm nào'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Selection */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Trạng thái:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="PUBLISHED"
                checked={status === 'PUBLISHED'}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Đăng ngay</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="DRAFT"
                checked={status === 'DRAFT'}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Lưu nháp</span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim() || loading || uploading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang đăng...
              </>
            ) : (
              schedulePost ? 'Lên lịch đăng' : status === 'PUBLISHED' ? 'Đăng bài' : 'Lưu nháp'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}