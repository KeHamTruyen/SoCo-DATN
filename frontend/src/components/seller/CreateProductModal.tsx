import { useState } from 'react';
import { X, Plus, Sparkles, Image as ImageIcon, Upload, Wand2 } from 'lucide-react';
import { User } from '../../App';

interface CreateProductModalProps {
  currentUser: User;
  onClose: () => void;
  onSubmit: (product: any) => void;
}

export function CreateProductModal({ currentUser, onClose, onSubmit }: CreateProductModalProps) {
  const [useAI, setUseAI] = useState(false);
  const [aiMode, setAIMode] = useState<'image' | 'text' | 'enhance'>('enhance');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: 'Thời trang',
    description: '',
    stock: '',
    images: [] as string[]
  });

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      if (aiMode === 'image') {
        // AI tạo mô tả từ hình ảnh
        setFormData(prev => ({
          ...prev,
          description: 'Áo thun cao cấp, chất liệu cotton 100%, thiết kế hiện đại và trẻ trung. Phù hợp cho mọi hoạt động hàng ngày. Màu sắc tươi sáng, dễ phối đồ. Size từ S đến XXL.'
        }));
      } else if (aiMode === 'text') {
        // AI tạo nội dung từ tiêu đề
        const title = formData.title || 'sản phẩm';
        setFormData(prev => ({
          ...prev,
          description: `${title} - Sản phẩm chất lượng cao, được thiết kế đặc biệt để đáp ứng nhu cầu của bạn. Với chất liệu cao cấp và kiểu dáng thời trang, đây là lựa chọn hoàn hảo cho phong cách hiện đại. Cam kết hàng chính hãng 100%, bảo hành đầy đủ.`
        }));
      } else if (aiMode === 'enhance') {
        // AI cải thiện nội dung hiện có
        const enhanced = formData.description 
          ? `✨ ${formData.description}\n\n🎁 ƯU ĐÃI ĐẶC BIỆT:\n• Miễn phí vận chuyển cho đơn hàng trên 500k\n• Bảo hành 12 tháng\n• Đổi trả trong 7 ngày\n• Tích điểm thành viên\n\n📦 Giao hàng nhanh chóng toàn quốc!`
          : '✨ Sản phẩm chất lượng cao cấp\n\n🎁 ƯU ĐÃI ĐẶC BIỆT:\n• Miễn phí vận chuyển\n• Bảo hành 12 tháng\n• Đổi trả dễ dàng\n\n📦 Giao hàng toàn quốc!';
        setFormData(prev => ({
          ...prev,
          description: enhanced
        }));
      }
      setIsGenerating(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleImageUpload = () => {
    // Mock image upload
    alert('Chức năng tải ảnh lên đang được phát triển');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <h2 className="text-xl">Thêm sản phẩm mới</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* AI Toggle */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="text-sm">Sử dụng AI hỗ trợ</span>
            </div>
            <button
              type="button"
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
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'image', label: 'Từ hình ảnh', icon: ImageIcon, desc: 'Tạo mô tả từ ảnh' },
                  { value: 'text', label: 'Từ tiêu đề', icon: Wand2, desc: 'Tạo mô tả từ tên' },
                  { value: 'enhance', label: 'Cải thiện', icon: Sparkles, desc: 'Nâng cao nội dung' }
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
                    <mode.icon className="w-5 h-5 text-purple-600 mb-1" />
                    <p className="text-sm">{mode.label}</p>
                    <p className="text-xs text-gray-500">{mode.desc}</p>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={isGenerating}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang tạo...
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Tạo nội dung bằng AI
                  </>
                )}
              </button>
            </div>
          )}

          {/* Product Images */}
          <div>
            <label className="block text-sm mb-2">Hình ảnh sản phẩm *</label>
            <div 
              onClick={handleImageUpload}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-600 transition-colors cursor-pointer"
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Nhấn để tải ảnh lên</p>
              <p className="text-xs text-gray-500 mt-1">Hỗ trợ JPG, PNG. Tối đa 5 ảnh</p>
            </div>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                    <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm mb-2">Tên sản phẩm *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="VD: Áo sơ mi cao cấp"
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Giá (VNĐ) *</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="450000"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Số lượng *</label>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="100"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm mb-2">Danh mục *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option>Thời trang</option>
              <option>Điện tử</option>
              <option>Thể thao</option>
              <option>Nội thất</option>
              <option>Mỹ phẩm</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-2">Mô tả sản phẩm *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Mô tả chi tiết về sản phẩm, chất liệu, kích thước, màu sắc..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length} ký tự
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm sản phẩm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
