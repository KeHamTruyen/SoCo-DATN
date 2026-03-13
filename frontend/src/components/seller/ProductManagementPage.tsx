import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Trash2, Eye, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import productService, { type Product } from '../../services/product.service';
import { PageLayout } from '../Layout/PageLayout';
import toast from 'react-hot-toast';

type ProductStatusFilter = 'ALL' | 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED';

const statusLabel: Record<string, string> = {
  DRAFT: 'Nháp',
  ACTIVE: 'Đang bán',
  OUT_OF_STOCK: 'Hết hàng',
  ARCHIVED: 'Đã lưu trữ'
};

const statusColor: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  ACTIVE: 'bg-green-100 text-green-700',
  OUT_OF_STOCK: 'bg-yellow-100 text-yellow-700',
  ARCHIVED: 'bg-red-100 text-red-700'
};

export function ProductManagementPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user, statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getMyProducts({
        page: 1,
        limit: 100,
        status: statusFilter === 'ALL' ? undefined : statusFilter
      });

      if (response.success) {
        setProducts(response.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching seller products:', error);
      toast.error(error.response?.data?.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn lưu trữ sản phẩm này?')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await productService.deleteProduct(id);
      if (response.success) {
        toast.success('Đã lưu trữ sản phẩm');
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.message || 'Không thể lưu trữ sản phẩm');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const keyword = searchQuery.toLowerCase();
    return products.filter((product) => {
      return (
        product.title.toLowerCase().includes(keyword) ||
        product.slug.toLowerCase().includes(keyword) ||
        product.category?.name?.toLowerCase().includes(keyword)
      );
    });
  }, [products, searchQuery]);

  if (!user) return null;

  return (
    <PageLayout activePage="seller-dashboard" showFooter={false} showMobileNav={false}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl">Quản lý sản phẩm</h1>
          <button
            onClick={() => navigate('/seller/products/add')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Thêm sản phẩm</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProductStatusFilter)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="DRAFT">Nháp</option>
              <option value="ACTIVE">Đang bán</option>
              <option value="OUT_OF_STOCK">Hết hàng</option>
              <option value="ARCHIVED">Đã lưu trữ</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-lg shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h3 className="text-lg mb-2">Chưa có sản phẩm nào</h3>
            <p className="text-gray-600 mb-6">Hãy thêm sản phẩm đầu tiên để bắt đầu bán hàng</p>
            <button
              onClick={() => navigate('/seller/products/add')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thêm sản phẩm mới
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const image = product.images?.[0]?.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image';
              const isDeleting = deletingId === product.id;

              return (
                <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="aspect-square relative">
                    <img src={image} alt={product.title} className="w-full h-full object-cover" />
                    <span
                      className={`absolute top-2 left-2 px-2 py-1 text-xs rounded-full ${
                        statusColor[product.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {statusLabel[product.status] || product.status}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="text-sm mb-2 line-clamp-2 min-h-[40px]">{product.title}</h3>
                    <p className="text-lg text-blue-600 mb-3">
                      {Number(product.price).toLocaleString('vi-VN')}đ
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <span>Đã bán: {product.salesCount || 0}</span>
                      <span>•</span>
                      <span>Tồn kho: {product.stockQuantity}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/product/${product.slug}`)}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Xem
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={isDeleting}
                        className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
