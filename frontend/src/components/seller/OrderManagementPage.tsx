import { useState } from 'react';
import { Search, Filter, Download, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageLayout } from '../Layout/PageLayout';

export function OrderManagementPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'shipping' | 'completed' | 'refund'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) return null;

  const orders = [
    { id: '#1234', customer: 'Trần Thị Mai', product: 'Áo sơ mi cao cấp', quantity: 2, amount: '900,000đ', status: 'shipping', date: '15/12/2024', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
    { id: '#1233', customer: 'Lê Văn Hoàng', product: 'Giày thể thao', quantity: 1, amount: '890,000đ', status: 'completed', date: '14/12/2024', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400' },
    { id: '#1232', customer: 'Phạm Thị Lan', product: 'Đồng hồ nam', quantity: 1, amount: '2,450,000đ', status: 'pending', date: '14/12/2024', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400' },
    { id: '#1231', customer: 'Hoàng Văn Nam', product: 'Laptop Gaming', quantity: 1, amount: '18,900,000đ', status: 'completed', date: '13/12/2024', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
    { id: '#1230', customer: 'Nguyễn Thị Hương', product: 'Balo du lịch', quantity: 3, amount: '1,950,000đ', status: 'shipping', date: '13/12/2024', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400' },
    { id: '#1229', customer: 'Trần Văn Đức', product: 'Áo sơ mi cao cấp', quantity: 1, amount: '450,000đ', status: 'refund', date: '12/12/2024', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400' }
  ];

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700' },
      shipping: { label: 'Đang giao', color: 'bg-blue-100 text-blue-700' },
      completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
      refund: { label: 'Hoàn tiền', color: 'bg-red-100 text-red-700' }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  const tabCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    shipping: orders.filter(o => o.status === 'shipping').length,
    completed: orders.filter(o => o.status === 'completed').length,
    refund: orders.filter(o => o.status === 'refund').length
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
                      <td className="p-4 text-sm">{order.id}</td>
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
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Eye className="w-5 h-5 text-gray-600" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
