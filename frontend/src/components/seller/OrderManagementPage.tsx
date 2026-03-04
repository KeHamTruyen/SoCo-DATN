import { useEffect, useMemo, useState } from 'react';
import { Search, Download, Eye, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PageLayout } from '../Layout/PageLayout';
import orderService, { Order } from '../../services/order.service';

export function OrderManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'shipping' | 'completed' | 'refund'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [refundOrders, setRefundOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (!user) return null;

  const loadOrders = async () => {
    try {
      setLoading(true);
      const [salesRes, refundsRes] = await Promise.all([
        orderService.getMySales({ page: 1, limit: 100 }),
        orderService.getSellerRefundRequests({ page: 1, limit: 100 }),
      ]);
      setOrders(salesRes.data || []);
      setRefundOrders(refundsRes.data || []);
    } catch (error) {
      console.error('Load seller orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700' },
      shipping: { label: 'Đang giao', color: 'bg-blue-100 text-blue-700' },
      completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
      refund: { label: 'Hoàn tiền', color: 'bg-red-100 text-red-700' }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const normalizedOrders = useMemo(() => {
    const mappedSales = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.buyer?.fullName || order.buyer?.username || 'Khách hàng',
      product: order.items[0]?.productName || '-',
      quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
      amount: `${Number(order.total).toLocaleString('vi-VN')}đ`,
      status:
        order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PROCESSING'
          ? 'pending'
          : order.status === 'SHIPPING'
            ? 'shipping'
            : order.status === 'DELIVERED' || order.status === 'COMPLETED'
              ? 'completed'
              : order.status === 'REFUNDED'
                ? 'refund'
                : 'pending',
      date: new Date(order.createdAt).toLocaleDateString('vi-VN'),
      avatar:
        order.buyer?.avatarUrl ||
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      raw: order,
    }));

    const mappedRefunds = refundOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.buyer?.fullName || order.buyer?.username || 'Khách hàng',
      product: order.items[0]?.productName || '-',
      quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
      amount: `${Number(order.total).toLocaleString('vi-VN')}đ`,
      status: 'refund',
      date: new Date(order.updatedAt).toLocaleDateString('vi-VN'),
      avatar:
        order.buyer?.avatarUrl ||
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      raw: order,
    }));

    const merged = [...mappedSales, ...mappedRefunds];
    return merged.filter((item, idx) => merged.findIndex((m) => m.id === item.id) === idx);
  }, [orders, refundOrders]);

  const filteredOrders = normalizedOrders
    .filter((order) => (activeTab === 'all' ? true : order.status === activeTab))
    .filter((order) => {
      if (!searchQuery.trim()) return true;
      const keyword = searchQuery.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(keyword) ||
        order.customer.toLowerCase().includes(keyword)
      );
    });

  const tabCounts = {
    all: normalizedOrders.length,
    pending: normalizedOrders.filter(o => o.status === 'pending').length,
    shipping: normalizedOrders.filter(o => o.status === 'shipping').length,
    completed: normalizedOrders.filter(o => o.status === 'completed').length,
    refund: normalizedOrders.filter(o => o.status === 'refund').length
  };

  const getNextStatus = (status: Order['status']) => {
    if (status === 'PENDING') return 'CONFIRMED';
    if (status === 'CONFIRMED') return 'PROCESSING';
    if (status === 'PROCESSING') return 'SHIPPING';
    if (status === 'SHIPPING') return 'DELIVERED';
    return null;
  };

  const handleAdvanceStatus = async (order: Order) => {
    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) return;
    try {
      setProcessingId(order.id);
      await orderService.updateOrderStatus(order.id, { status: nextStatus });
      await loadOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleProcessRefund = async (orderId: string, accept: boolean) => {
    const reason = prompt(
      accept ? 'Ghi chú chấp nhận hoàn tiền (không bắt buộc):' : 'Lý do từ chối hoàn tiền:'
    ) || undefined;
    try {
      setProcessingId(orderId);
      await orderService.processRefund(orderId, { accept, reason });
      await loadOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xử lý hoàn tiền.');
    } finally {
      setProcessingId(null);
    }
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
            <button
              onClick={loadOrders}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Tải lại
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm">#{order.orderNumber}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={order.avatar} alt={order.customer} className="w-8 h-8 rounded-full" />
                          <span className="text-sm">{order.customer}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{order.product}</td>
                      <td className="p-4 text-sm">{order.quantity}</td>
                      <td className="p-4 text-sm">{order.amount}</td>
                      <td className="p-4 text-sm text-gray-600">{order.date}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => window.location.assign(`/orders/${order.id}`)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-5 h-5 text-gray-600" />
                        </button>
                        {order.status !== 'refund' && order.raw && getNextStatus(order.raw.status) && (
                          <button
                            onClick={() => handleAdvanceStatus(order.raw)}
                            disabled={processingId === order.id}
                            className="ml-2 px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                          >
                            {processingId === order.id ? '...' : 'Cập nhật'}
                          </button>
                        )}
                        {order.status === 'refund' && (
                          <>
                            <button
                              onClick={() => handleProcessRefund(order.id, true)}
                              disabled={processingId === order.id}
                              className="ml-2 px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => handleProcessRefund(order.id, false)}
                              disabled={processingId === order.id}
                              className="ml-2 px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                            >
                              Từ chối
                            </button>
                          </>
                        )}
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
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-600">
            Hiển thị {filteredOrders.length} đơn hàng
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              Trước
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">1</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">2</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">3</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              Sau
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
