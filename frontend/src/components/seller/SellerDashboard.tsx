import { TrendingUp, Package, ShoppingBag, DollarSign, Users, Star, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageLayout } from '../Layout/PageLayout';

export function SellerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;
  const stats = [
    {
      label: 'Doanh thu tháng này',
      value: '45,890,000đ',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'green'
    },
    {
      label: 'Đơn hàng',
      value: '124',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingBag,
      color: 'blue'
    },
    {
      label: 'Sản phẩm',
      value: '48',
      change: '+5',
      trend: 'up',
      icon: Package,
      color: 'purple'
    },
    {
      label: 'Đánh giá',
      value: '4.8',
      change: '+0.2',
      trend: 'up',
      icon: Star,
      color: 'yellow'
    }
  ];

  const recentOrders = [
    { id: '#1234', customer: 'Trần Thị Mai', product: 'Áo sơ mi cao cấp', amount: '450,000đ', status: 'Đang giao' },
    { id: '#1233', customer: 'Lê Văn Hoàng', product: 'Giày thể thao', amount: '890,000đ', status: 'Hoàn thành' },
    { id: '#1232', customer: 'Phạm Thị Lan', product: 'Đồng hồ nam', amount: '2,450,000đ', status: 'Đang xử lý' },
    { id: '#1231', customer: 'Hoàng Văn Nam', product: 'Laptop Gaming', amount: '18,900,000đ', status: 'Hoàn thành' },
    { id: '#1230', customer: 'Nguyễn Thị Hương', product: 'Balo du lịch', amount: '650,000đ', status: 'Đang giao' }
  ];

  const topProducts = [
    { name: 'Áo sơ mi cao cấp', sold: 45, revenue: '20,250,000đ', image: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=400' },
    { name: 'Giày thể thao', sold: 32, revenue: '28,480,000đ', image: 'https://images.unsplash.com/photo-1598538476953-eb5f34104298?w=400' },
    { name: 'Tai nghe Bluetooth', sold: 28, revenue: '35,000,000đ', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hoàn thành':
        return 'bg-green-100 text-green-700';
      case 'Đang giao':
        return 'bg-blue-100 text-blue-700';
      case 'Đang xử lý':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${stat.color}-100`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl">{stat.value}</p>
            </div>
          ))}
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
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100">
                      <td className="py-3 text-sm">{order.id}</td>
                      <td className="py-3 text-sm">{order.customer}</td>
                      <td className="py-3 text-sm text-gray-600">{order.product}</td>
                      <td className="py-3 text-sm">{order.amount}</td>
                      <td className="py-3">
                        <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg mb-4">Sản phẩm bán chạy</h2>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sold} đã bán</p>
                  </div>
                  <p className="text-sm text-blue-600">{product.revenue}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-lg mb-4">Doanh thu 7 ngày qua</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {[65, 80, 75, 90, 85, 95, 88].map((height, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-blue-600 rounded-t-lg transition-all hover:bg-blue-700" style={{ height: `${height}%` }} />
                <p className="text-xs text-gray-500 mt-2">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][index]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
