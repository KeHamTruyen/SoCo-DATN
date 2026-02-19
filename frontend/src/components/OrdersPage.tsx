import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Loader2, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import orderService, { Order, OrderStatus } from '../services/order.service';
import { formatDistanceToNow } from 'date-fns';

export function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadOrders();
  }, [selectedStatus, page]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getMyOrders({
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        page,
        limit: 10,
      });
      setOrders(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      console.error('Load orders error:', err);
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPING: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (!user) {
    return null;
  }

  const statusFilters: Array<{ value: OrderStatus | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'SHIPPING', label: 'Shipping' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to Home
          </button>
          <h1 className="text-2xl font-semibold">My Orders</h1>
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => {
                  setSelectedStatus(filter.value);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedStatus === filter.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {loading && page === 1 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No orders found</h2>
            <p className="text-gray-600 mb-6">
              {selectedStatus === 'ALL'
                ? "You haven't placed any orders yet"
                : `You don't have any ${selectedStatus.toLowerCase()} orders`}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDistanceToNow(new Date(order.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={item.productImageUrl || '/placeholder.png'}
                          alt={item.productName}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-1">
                            {item.productName}
                          </p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity} × {Number(item.unitPrice).toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {Number(item.totalPrice).toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>
                    ))}

                    {order.items.length > 2 && (
                      <p className="text-sm text-gray-600">
                        +{order.items.length - 2} more item(s)
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="w-4 h-4" />
                      <span>{order.items.length} item(s)</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-xl font-semibold text-blue-600">
                        {Number(order.total).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
