import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLayout } from '../Layout/PageLayout';
import productService from '../../services/product.service';
import toast from 'react-hot-toast';

export function EditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('0');
  const [sku, setSku] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED'>('DRAFT');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        toast.error('Không tìm thấy sản phẩm');
        navigate('/seller/products');
        return;
      }

      try {
        setLoading(true);
        const response = await productService.getProduct(id);
        const product = response.data;

        setTitle(product.title || '');
        setDescription(product.description || '');
        setPrice(product.price != null ? String(product.price) : '');
        setCompareAtPrice(product.compareAtPrice != null ? String(product.compareAtPrice) : '');
        setStockQuantity(String(product.stockQuantity ?? 0));
        setSku(product.sku || '');
        setStatus(product.status || 'DRAFT');
      } catch (error: any) {
        console.error('Error loading product:', error);
        toast.error(error.response?.data?.message || 'Không thể tải sản phẩm');
        navigate('/seller/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleSave = async () => {
    if (!id) return;

    if (!title.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm');
      return;
    }

    if (!price || Number(price) < 0) {
      toast.error('Giá sản phẩm không hợp lệ');
      return;
    }

    try {
      setSaving(true);
      await productService.updateProduct(id, {
        title: title.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
        stockQuantity: Math.max(0, Number(stockQuantity) || 0),
        sku: sku.trim() || undefined,
        status,
      });

      toast.success('Cập nhật sản phẩm thành công');
      navigate('/seller/products');
    } catch (error: any) {
      console.error('Error updating product:', error);
      const validationMessage = error.response?.data?.errors?.[0]?.msg;
      toast.error(validationMessage || error.response?.data?.message || 'Không thể cập nhật sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout activePage="seller-dashboard" showFooter={false} showMobileNav={false}>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout activePage="seller-dashboard" showFooter={false} showMobileNav={false}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl">Chỉnh sửa sản phẩm</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/seller/products')}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Tên sản phẩm *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Tên sản phẩm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
              placeholder="Mô tả sản phẩm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Giá bán *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min={0}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Giá gốc</label>
              <input
                type="number"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                min={0}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">SKU</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Tồn kho</label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                min={0}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="DRAFT">Nháp</option>
                <option value="ACTIVE">Đang bán</option>
                <option value="OUT_OF_STOCK">Hết hàng</option>
                <option value="ARCHIVED">Đã lưu trữ</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
