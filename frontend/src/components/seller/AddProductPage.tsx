import { useState } from 'react';
import { X, Plus, Trash2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import productService from '../../services/product.service';
import { PageLayout } from '../Layout/PageLayout';
import { ImageUpload } from '../common/ImageUpload';

interface ProductVariant {
  id: string;
  name: string;
  options: string[];
}

export function AddProductPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [useAI, setUseAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const categories = [
    'Thời trang nam',
    'Thời trang nữ',
    'Điện thoại & Phụ kiện',
    'Máy tính & Laptop',
    'Đồng hồ',
    'Giày dép',
    'Túi xách',
    'Mỹ phẩm',
    'Đồ gia dụng',
    'Thể thao',
    'Sức khỏe',
    'Sách'
  ];

  const handleImageUploaded = (url: string) => {
    if (url && !images.includes(url)) {
      setImages([...images, url]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      name: '',
      options: ['']
    };
    setVariants([...variants, newVariant]);
  };

  const updateVariantName = (id: string, name: string) => {
    setVariants(variants.map(v => v.id === id ? { ...v, name } : v));
  };

  const updateVariantOption = (variantId: string, optionIndex: number, value: string) => {
    setVariants(variants.map(v => {
      if (v.id === variantId) {
        const newOptions = [...v.options];
        newOptions[optionIndex] = value;
        return { ...v, options: newOptions };
      }
      return v;
    }));
  };

  const addVariantOption = (variantId: string) => {
    setVariants(variants.map(v => 
      v.id === variantId ? { ...v, options: [...v.options, ''] } : v
    ));
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  const removeVariantOption = (variantId: string, optionIndex: number) => {
    setVariants(variants.map(v => {
      if (v.id === variantId) {
        return { ...v, options: v.options.filter((_, i) => i !== optionIndex) };
      }
      return v;
    }));
  };

  const handleAIGenerate = () => {
    if (!productName) {
      alert('Vui lòng nhập tên sản phẩm trước!');
      return;
    }

    // Mock AI generation
    const aiDescriptions = [
      `${productName} được thiết kế với chất liệu cao cấp, mang lại sự thoải mái tối đa cho người dùng. Sản phẩm có kiểu dáng hiện đại, phù hợp với nhiều phong cách khác nhau. Đây là lựa chọn hoàn hảo cho những ai yêu thích sự tinh tế và chất lượng.`,
      `Khám phá ${productName} - sản phẩm hot nhất mùa này! Với thiết kế độc đáo và tính năng vượt trội, đây chắc chắn sẽ là món đồ không thể thiếu trong bộ sưu tập của bạn. Chất lượng đảm bảo, giá cả hợp lý.`,
      `${productName} mang đến trải nghiệm tuyệt vời với chất liệu bền bỉ, thiết kế sang trọng. Phù hợp cho mọi lứa tuổi, mọi phong cách. Đặt hàng ngay để nhận ưu đãi hấp dẫn!`
    ];

    setDescription(aiDescriptions[Math.floor(Math.random() * aiDescriptions.length)]);
    alert('Đã tạo mô tả bằng AI!');
  };

  const handleSubmit = async () => {
    if (!productName || !price || !category || images.length === 0) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    setIsSubmitting(true);
    try {
      await productService.createProduct({
        title: productName,
        description,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        categoryId: category, // This should be a category UUID in real implementation
        stockQuantity: stock ? parseInt(stock) : 0,
        sku: sku || undefined,
        images: images.map((url) => ({
          url,
          altText: productName
        })),
        variants: variants.map(v => ({
          name: v.name,
          options: v.options.reduce((acc, opt, idx) => ({
            ...acc,
            [`option${idx + 1}`]: opt
          }), {}),
          stockQuantity: 0
        })),
        metaKeywords: tags
      });

      alert('Đã thêm sản phẩm thành công!');
      navigate('/seller/products');
    } catch (error: any) {
      console.error('Error creating product:', error);
      alert(error.response?.data?.message || 'Không thể thêm sản phẩm. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      activePage="add-product"
      showFooter={false}
      showMobileNav={false}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl">Thêm sản phẩm mới</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/seller/products')}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg mb-4">Thông tin sản phẩm</h2>

              <div className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="VD: Áo thun nam cotton cao cấp"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                {/* Description with AI */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm text-gray-700">Mô tả sản phẩm</label>
                    <button
                      onClick={() => setUseAI(!useAI)}
                      className={`flex items-center gap-2 text-sm px-3 py-1 rounded-lg transition-colors ${
                        useAI ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      {useAI ? 'Đang dùng AI' : 'Tạo bằng AI'}
                    </button>
                  </div>

                  {useAI && (
                    <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-sm text-purple-700 mb-2">
                        AI sẽ tạo mô tả sản phẩm chuyên nghiệp dựa trên tên sản phẩm
                      </p>
                      <button
                        onClick={handleAIGenerate}
                        className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Tạo mô tả
                      </button>
                    </div>
                  )}

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả chi tiết về sản phẩm của bạn..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                    rows={6}
                  />
                </div>
              </div>
            </div>

            {/* Product Images */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg mb-4">Hình ảnh sản phẩm <span className="text-red-500">*</span></h2>

              {/* Uploaded Images Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                      <img src={image} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                          Ảnh chính
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload New Image */}
              {images.length < 8 && (
                <div className="mb-3">
                  <ImageUpload
                    onImageUploaded={handleImageUploaded}
                    label={images.length === 0 ? "Upload ảnh sản phẩm (ảnh đầu tiên sẽ là ảnh chính)" : "Thêm ảnh"}
                    maxSize={5}
                  />
                </div>
              )}

              <p className="text-sm text-gray-500">
                💡 Tối đa 8 ảnh, mỗi ảnh tối đa 5MB. Ảnh đầu tiên sẽ là ảnh đại diện sản phẩm.
              </p>
              <p className="text-sm text-green-600 mt-1">
                ✅ Ảnh được lưu trữ trên Cloudinary (CDN toàn cầu)
              </p>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg mb-4">Giá bán</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Giá bán <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent pr-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">đ</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Giá gốc (tùy chọn)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={compareAtPrice}
                      onChange={(e) => setCompareAtPrice(e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent pr-12"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">đ</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Hiển thị giá gạch ngang</p>
                </div>
              </div>

              {compareAtPrice && price && parseFloat(compareAtPrice) > parseFloat(price) && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    Giảm giá: {Math.round(((parseFloat(compareAtPrice) - parseFloat(price)) / parseFloat(compareAtPrice)) * 100)}%
                  </p>
                </div>
              )}
            </div>

            {/* Inventory */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg mb-4">Kho hàng</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">SKU (tùy chọn)</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="VD: AT-001"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Số lượng tồn kho</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Variants */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg">Biến thể (tùy chọn)</h2>
                <button
                  onClick={addVariant}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Thêm biến thể
                </button>
              </div>

              {variants.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  VD: Màu sắc (Đỏ, Xanh, Vàng) hoặc Kích thước (S, M, L, XL)
                </p>
              )}

              <div className="space-y-4">
                {variants.map((variant) => (
                  <div key={variant.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => updateVariantName(variant.id, e.target.value)}
                          placeholder="Tên biến thể (VD: Màu sắc, Kích thước)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={() => removeVariant(variant.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {variant.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateVariantOption(variant.id, optionIndex, e.target.value)}
                            placeholder={`Giá trị ${optionIndex + 1}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                          />
                          {variant.options.length > 1 && (
                            <button
                              onClick={() => removeVariantOption(variant.id, optionIndex)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => addVariantOption(variant.id)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        + Thêm giá trị
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-24">
              {/* Category */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg mb-4">Danh mục <span className="text-red-500">*</span></h2>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg mb-4">Tags</h2>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Thêm tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg mb-4">Xem trước</h2>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {images.length > 0 ? (
                    <div className="aspect-square bg-gray-100">
                      <img src={images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="mb-2 line-clamp-2">
                      {productName || 'Tên sản phẩm'}
                    </h3>
                    <div className="flex items-center gap-2">
                      {compareAtPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {parseFloat(compareAtPrice).toLocaleString('vi-VN')}đ
                        </span>
                      )}
                      <span className="text-blue-600">
                        {price ? `${parseFloat(price).toLocaleString('vi-VN')}đ` : '0đ'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
