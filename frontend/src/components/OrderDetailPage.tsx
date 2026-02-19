import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, XCircle, Loader2, MapPin, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import orderService, { Order, OrderStatus } from '../services/order.service';
import { formatDistanceToNow } from 'date-fns';

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getOrder(orderId);
      setOrder(response.data);
    } catch (err: any) {
      console.error('Load order error:', err);
      setError(err.response?.data?.message || 'Failed to load order');
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

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
      case 'CONFIRMED':
      case 'PROCESSING':
        return <Package className="w-5 h-5" />;
      case 'SHIPPING':
        return <Truck className="w-5 h-5" />;
      case 'DELIVERED':
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5" />;
      case 'CANCELLED':
      case 'REFUNDED':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
          <button
            onClick={() => navigate('/orders')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to Orders
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Order #{order.orderNumber}</h1>
              <p className="text-gray-600 text-sm mt-1">
                Placed {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="font-medium">{order.status}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                  <img
                    src={item.productImageUrl || '/placeholder.png'}
                    alt={item.productName}
                    className="w-20 h-20 rounded object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{item.productName}</h3>
                    {item.seller && (
                      <p className="text-sm text-gray-600">
                        Seller: {item.seller.fullName}
                      </p>
                    )}
                    {item.variantInfo && (
                      <p className="text-sm text-gray-500">
                        Variant: {JSON.stringify(item.variantInfo)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {Number(item.unitPrice).toLocaleString('vi-VN')}đ
                    </p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    <p className="text-sm font-semibold mt-1">
                      {Number(item.totalPrice).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Shipping Information</h2>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {order.shippingName}</p>
                <p><strong>Phone:</strong> {order.shippingPhone}</p>
                <p><strong>Address:</strong> {order.shippingAddress}</p>
                {order.shippingWard && <p><strong>Ward:</strong> {order.shippingWard}</p>}
                {order.shippingDistrict && <p><strong>District:</strong> {order.shippingDistrict}</p>}
                {order.shippingCity && <p><strong>City:</strong> {order.shippingCity}</p>}
                {order.shippingNote && (
                  <p><strong>Note:</strong> {order.shippingNote}</p>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Payment Information</h2>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Method:</strong> {order.paymentMethod}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`px-2 py-1 rounded ${
                    order.paymentStatus === 'PAID'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </p>
                {order.paidAt && (
                  <p><strong>Paid At:</strong> {new Date(order.paidAt).toLocaleString()}</p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{Number(order.subtotal).toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{Number(order.shippingFee).toLocaleString('vi-VN')}đ</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount:</span>
                    <span>-{Number(order.discount).toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-blue-600">
                    {Number(order.total).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Information */}
          {(order.trackingNumber || order.carrier) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Tracking Information</h2>
              </div>
              <div className="space-y-2 text-sm">
                {order.trackingNumber && (
                  <p><strong>Tracking Number:</strong> {order.trackingNumber}</p>
                )}
                {order.carrier && (
                  <p><strong>Carrier:</strong> {order.carrier}</p>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Order Timeline</h2>
            <div className="space-y-4">
              {order.createdAt && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Order Placed</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {order.confirmedAt && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Order Confirmed</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.confirmedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {order.shippedAt && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Order Shipped</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.shippedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {order.deliveredAt && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Order Delivered</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.deliveredAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {order.cancelledAt && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Order Cancelled</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.cancelledAt).toLocaleString()}
                    </p>
                    {order.cancellationReason && (
                      <p className="text-sm text-gray-600 mt-1">
                        Reason: {order.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
