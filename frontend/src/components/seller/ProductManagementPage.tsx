import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { mockProducts } from '../../data/mockData';
import { CreateProductModal } from './CreateProductModal';
import { PageLayout } from '../Layout/PageLayout';

export function ProductManagementPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  if (!user) return null;

  const myProducts = mockProducts.filter(p => p.sellerId === user.id);

  const handleAddProduct = (product: any) => {
    console.log('Sản phẩm mới:', product);
    alert('Sản phẩm đã được thêm thành công!');
    setShowAddModal(false);
  };

  return (
    <PageLayout 
      activePage="seller-dashboard"
      showFooter={false}
      showMobileNav={false}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
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

        {/* Search and Filter */}
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
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent">
              <option>Tất cả danh mục</option>
              <option>Thời trang</option>
              <option>Điện tử</option>
              <option>Thể thao</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent">
              <option>Tất cả trạng thái</option>
              <option>Còn hàng</option>
              <option>Hết hàng</option>
              <option>Nháp</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-square relative">
                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-white rounded-lg shadow-sm">
                  <button className="p-2 hover:bg-gray-100 transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm mb-2 line-clamp-2">{product.title}</h3>
                <p className="text-lg text-blue-600 mb-3">{product.price.toLocaleString('vi-VN')}đ</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <span>Đã bán: 24</span>
                  <span>•</span>
                  <span>Tồn kho: 150</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    Xem
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <Edit className="w-4 h-4" />
                    Sửa
                  </button>
                  <button className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State if no products */}
        {myProducts.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg mb-2">Chưa có sản phẩm nào</h3>
            <p className="text-gray-600 mb-6">Thêm sản phẩm đầu tiên để bắt đầu bán hàng</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thêm sản phẩm mới
            </button>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <CreateProductModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddProduct}
        />
      )}
    </PageLayout>
  );
}