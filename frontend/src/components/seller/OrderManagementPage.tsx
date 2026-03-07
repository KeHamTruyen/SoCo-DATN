import { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Loader2, ChevronDown, Check, X, Truck, Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PageLayout } from '../Layout/PageLayout';
import orderService, { type Order, type OrderStatus } from '../../services/order.service';
import toast from 'react-hot-toast';

type TabStatus = 'all' | 'pending' | 'shipping' | 'completed' | 'refund';

// OrderStatus enum values
const OrderStatusValues = {
  PENDING: 'PENDING' as OrderStatus,
  CONFIRMED: 'CONFIRMED' as OrderStatus,
  PROCESSING: 'PROCESSING' as OrderStatus,
  SHIPPING: 'SHIPPING' as OrderStatus,
  DELIVERED: 'DELIVERED' as OrderStatus,
  COMPLETED: 'COMPLETED' as OrderStatus,
  CANCELLED: 'CANCELLED' as OrderStatus,
  REFUNDED: 'REFUNDED' as OrderStatus
};

export function OrderManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const pageSize = 10;



  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const statusFilter = activeTab === 'all' ? undefined : 
        activeTab === 'pending' ? [OrderStatusValues.PENDING, OrderStatusValues.CONFIRMED, OrderStatusValues.PROCESSING] :
        activeTab === 'shipping' ? [OrderStatusValues.SHIPPING, OrderStatusValues.DELIVERED] :
        activeTab === 'completed' ? [OrderStatusValues.COMPLETED] :
        activeTab === 'refund' ? [OrderStatusValues.REFUNDED] : undefined;

      const response = await orderService.getMySales({
        status: statusFilter?.[0], // Backend accepts single status
        page: currentPage,
        limit: pageSize
      });

      if (response.success && response.data) {
        setOrders(response.data || []);
        setTotalOrders(response.pagination.total || 0);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải đơn hàng');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, activeTab, currentPage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showActionsMenu !== null) {
        setShowActionsMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showActionsMenu]);

  // Reset to page 1 when changing tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Get available actions for order status
  const getAvailableActions = (status: OrderStatus) => {
    const actions: { label: string; status: OrderStatus; icon: any; color: string }[] = [];
    
    if (status === OrderStatusValues.PENDING) {
      actions.push(
        { label: 'Xác nhận', status: OrderStatusValues.CONFIRMED, icon: Check, color: 'text-green-600' },
        { label: 'Hủy đơn', status: OrderStatusValues.CANCELLED, icon: X, color: 'text-red-600' }
      );
    } else if (status === OrderStatusValues.CONFIRMED) {
      actions.push(
        { label: 'Xử lý', status: OrderStatusValues.PROCESSING, icon: Package, color: 'text-blue-600' },
        { label: 'Hủy đơn', status: OrderStatusValues.CANCELLED, icon: X, color: 'text-red-600' }
      );
    } else if (status === OrderStatusValues.PROCESSING) {
      actions.push(
        { label: 'Giao hàng', status: OrderStatusValues.SHIPPING, icon: Truck, color: 'text-purple-600' },
        { label: 'Hủy đơn', status: OrderStatusValues.CANCELLED, icon: X, color: 'text-red-600' }
      );
    } else if (status === OrderStatusValues.SHIPPING) {
      actions.push(
        { label: 'Đã giao', status: OrderStatusValues.DELIVERED, icon: Check, color: 'text-teal-600' }
      );
    } else if (status === OrderStatusValues.DELIVERED) {
      actions.push(
        { label: 'Hoàn thành', status: OrderStatusValues.COMPLETED, icon: Check, color: 'text-green-600' }
      );
    } else if (status === OrderStatusValues.COMPLETED) {
      actions.push(
        { label: 'Hoàn tiền', status: OrderStatusValues.REFUNDED, icon: X, color: 'text-red-600' }
      );
    }
    
    return actions;
  };

  // Update order status
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      setShowActionsMenu(null);
      
      const response = await orderService.updateOrderStatus(orderId, { status: newStatus });
      
      if (response.success) {
        toast.success('Cập nhật trạng thái đơn hàng thành công');
        // Refresh orders list
        fetchOrders();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (!user) return null;

  const getStatusBadge = (status: OrderStatus) => {
    const statusMap: Record<OrderStatus, { label: string; color: string }> = {
      PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700' },
      CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
      PROCESSING: { label: 'Đang xử lý', color: 'bg-purple-100 text-purple-700' },
      SHIPPING: { label: 'Đang giao', color: 'bg-blue-100 text-blue-700' },
      DELIVERED: { label: 'Đã giao', color: 'bg-teal-100 text-teal-700' },
      COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
      CANCELLED: { label: 'Đã hủy', color: 'bg-gray-100 text-gray-700' },
      REFUNDED: { label: 'Hoàn tiền', color: 'bg-red-100 text-red-700' }
    };
    return statusMap[status] || statusMap.PENDING;
  };

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      order.id.toString().includes(search) ||
      order.buyer?.username?.toLowerCase().includes(search) ||
      order.buyer?.fullName?.toLowerCase().includes(search)
    );
  });

  const tabCounts = {
    all: totalOrders,
    pending: orders.filter(o => [OrderStatusValues.PENDING, OrderStatusValues.CONFIRMED, OrderStatusValues.PROCESSING].includes(o.status)).length,
    shipping: orders.filter(o => [OrderStatusValues.SHIPPING, OrderStatusValues.DELIVERED].includes(o.status)).length,
    completed: orders.filter(o => o.status === OrderStatusValues.COMPLETED).length,
    refund: orders.filter(o => o.status === OrderStatusValues.REFUNDED).length
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
          <h1 className="text-2xl">Quản lý đơn hàng</h1>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-5 h-5" />
            <span className="hidden md:inline">Xuất báo cáo</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-4 px-6 text-sm whitespace-nowrap ${
                activeTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tất cả ({tabCounts.all})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-4 px-6 text-sm whitespace-nowrap ${
                activeTab === 'pending'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Chờ xử lý ({tabCounts.pending})
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`flex-1 py-4 px-6 text-sm whitespace-nowrap ${
                activeTab === 'shipping'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Đang giao ({tabCounts.shipping})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-4 px-6 text-sm whitespace-nowrap ${
                activeTab === 'completed'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Hoàn thành ({tabCounts.completed})
            </button>
            <button
              onClick={() => setActiveTab('refund')}
              className={`flex-1 py-4 px-6 text-sm whitespace-nowrap ${
                activeTab === 'refund'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Hoàn tiền ({tabCounts.refund})
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo mã đơn, tên khách hàng..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5" />
              <span className="hidden md:inline">Lọc</span>
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Không có đơn hàng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-sm text-gray-600 p-4">Mã đơn</th>
                    <th className="text-left text-sm text-gray-600 p-4">Khách hàng</th>
                    <th className="text-left text-sm text-gray-600 p-4">Sản phẩm</th>
                    <th className="text-left text-sm text-gray-600 p-4">Số lượng</th>
                    <th className="text-left text-sm text-gray-600 p-4">Giá trị</th>
                    <th className="text-left text-sm text-gray-600 p-4">Ngày đặt</th>
                    <th className="text-left text-sm text-gray-600 p-4">Trạng thái</th>
                    <th className="text-left text-sm text-gray-600 p-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => {
                    const status = getStatusBadge(order.status);
                    const totalQuantity = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                    const firstProduct = order.items?.[0];
                    const productCount = order.items?.length || 0;
                    const availableActions = getAvailableActions(order.status);
                    const isUpdating = updatingOrderId === order.id;
                    
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-sm">#{order.id}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={order.buyer?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.buyer?.username}`} 
                              alt={order.buyer?.fullName || order.buyer?.username || 'User'} 
                              className="w-8 h-8 rounded-full" 
                            />
                            <span className="text-sm">{order.buyer?.fullName || order.buyer?.username || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {firstProduct?.product?.name || 'N/A'}
                          {productCount > 1 && <span className="text-gray-400"> +{productCount - 1}</span>}
                        </td>
                        <td className="p-4 text-sm">{totalQuantity}</td>
                        <td className="p-4 text-sm font-medium">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <Eye className="w-5 h-5 text-gray-600" />
                            </button>
                            {availableActions.length > 0 && (
                              <div className="relative">
                                <button 
                                  onClick={() => setShowActionsMenu(showActionsMenu === order.id ? null : order.id)}
                                  disabled={isUpdating}
                                  className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                  {isUpdating ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <span>Thao tác</span>
                                      <ChevronDown className="w-4 h-4" />
                                    </>
                                  )}
                                </button>
                                {showActionsMenu === order.id && (
                                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                    {availableActions.map((action) => {
                                      const Icon = action.icon;
                                      return (
                                        <button
                                          key={action.status}
                                          onClick={() => handleUpdateStatus(order.id, action.status)}
                                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                                        >
                                          <Icon className={`w-4 h-4 ${action.color}`} />
                                          <span>{action.label}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalOrders > 0 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
              Hiển thị {Math.min((currentPage - 1) * pageSize + 1, totalOrders)}-{Math.min(currentPage * pageSize, totalOrders)} trong tổng {totalOrders} đơn hàng
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              {Array.from({ length: Math.ceil(totalOrders / pageSize) }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and pages around current
                  const totalPages = Math.ceil(totalOrders / pageSize);
                  return page === 1 || 
                         page === totalPages || 
                         Math.abs(page - currentPage) <= 1;
                })
                .map((page, index, arr) => {
                  // Add ellipsis if there's a gap
                  const showEllipsis = index > 0 && page - arr[index - 1] > 1;
                  return (
                    <div key={page} className="flex gap-2">
                      {showEllipsis && <span className="px-2 py-2 text-gray-400">...</span>}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}
              <button 
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalOrders / pageSize), p + 1))}
                disabled={currentPage >= Math.ceil(totalOrders / pageSize)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
