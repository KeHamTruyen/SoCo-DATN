import { useState, useEffect } from 'react';
import { Package, ShoppingBag, DollarSign, Star, ArrowUpRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageLayout } from '../Layout/PageLayout';
import { sellerService, type SellerStats } from '../../services/seller.service';
import { type OrderStatus } from '../../services/order.service';
import toast from 'react-hot-toast';

export function SellerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await sellerService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải dữ liệu');
      console.error('Error fetching seller stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const getStatusColor = (status: OrderStatus): string => {
    const colors: Record<OrderStatus, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-blue-100 text-blue-700',
      PROCESSING: 'bg-purple-100 text-purple-700',
      SHIPPING: 'bg-blue-100 text-blue-700',
      DELIVERED: 'bg-teal-100 text-teal-700',
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-gray-100 text-gray-700',
      REFUNDED: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: OrderStatus): string => {
    const labels: Record<OrderStatus, string> = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      PROCESSING: 'Đang xử lý',
      SHIPPING: 'Đang giao',
      DELIVERED: 'Đã giao',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
      REFUNDED: 'Hoàn tiền'
    };
    return labels[status] || status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <PageLayout 
      activePage="seller-dashboard"
      showFooter={false}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl">Dashboard Người bán</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/seller/products')}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quản lý sản phẩm
            </button>
            <button
              onClick={() => navigate('/seller/orders')}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Quản lý đơn hàng
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : stats ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Revenue */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Doanh thu</p>
                <p className="text-2xl">{formatCurrency(stats.revenue.total)}</p>
              </div>

              {/* Orders */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-blue-600">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Đơn hàng</p>
                <p className="text-2xl">{stats.orders.total}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.orders.pending} chờ xử lý
                </p>
              </div>

              {/* Products */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-purple-600">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Sản phẩm</p>
                <p className="text-2xl">{stats.products.total}</p>
              </div>

              {/* Rating */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-yellow-100">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex items-center gap-1 text-sm text-yellow-600">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Đánh giá</p>
                <p className="text-2xl">{stats.rating.average.toFixed(1)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.rating.count} đánh giá
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Orders */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg">Đơn hàng gần đây</h2>
                  <button
                    onClick={() => navigate('/seller/orders')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Xem tất cả
                  </button>
                </div>
                {stats.recentOrders.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Chưa có đơn hàng nào</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left text-sm text-gray-600 pb-3">Mã đơn</th>
                          <th className="text-left text-sm text-gray-600 pb-3">Khách hàng</th>
                          <th className="text-left text-sm text-gray-600 pb-3">Sản phẩm</th>
                          <th className="text-left text-sm text-gray-600 pb-3">Giá trị</th>
                          <th className="text-left text-sm text-gray-600 pb-3">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentOrders.map((order) => {
                          const firstProduct = order.items?.[0];
                          const productCount = order.items?.length || 0;
                          return (
                            <tr key={order.id} className="border-b border-gray-100">
                              <td className="py-3 text-sm">#{order.id}</td>
                              <td className="py-3 text-sm">{order.buyer?.fullName || order.buyer?.username || 'N/A'}</td>
                              <td className="py-3 text-sm text-gray-600">
                                {firstProduct?.product?.name || 'N/A'}
                                {productCount > 1 && <span className="text-gray-400"> +{productCount - 1}</span>}
                              </td>
                              <td className="py-3 text-sm">{formatCurrency(order.total)}</td>
                              <td className="py-3">
                                <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                  {getStatusLabel(order.status)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg mb-4">Sản phẩm bán chạy</h2>
                {stats.topProducts.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Chưa có dữ liệu</p>
                ) : (
                  <div className="space-y-4">
                    {stats.topProducts.map((item, index) => {
                      const image = item.product?.images?.[0] || 'https://via.placeholder.com/150';
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={image} alt={item.product?.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{item.product?.name}</p>
                            <p className="text-xs text-gray-500">{item.totalSold} đã bán</p>
                          </div>
                          <p className="text-sm text-blue-600">{formatCurrency(item.product?.price * item.totalSold)}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Không thể tải dữ liệu</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
