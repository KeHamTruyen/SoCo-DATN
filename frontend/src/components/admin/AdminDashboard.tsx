import { useState } from 'react';
import { 
  ArrowLeft, Users, ShoppingBag, AlertTriangle, TrendingUp, DollarSign, 
  Package, UserCheck, Flag, Search, MoreVertical, Check, X, Eye, 
  Ban, Shield, MessageSquare, Star, ChevronDown, Filter
} from 'lucide-react';
import { User } from '../../App';

interface AdminDashboardProps {
  currentUser: User;
  onNavigate: (page: any) => void;
}

export function AdminDashboard({ currentUser, onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'sellers' | 'products' | 'reports'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'banned' | 'pending'>('all');

  const stats = [
    { label: 'Tổng người dùng', value: '12,540', change: '+12.5%', icon: Users, color: 'blue' },
    { label: 'Người bán', value: '2,340', change: '+8.2%', icon: UserCheck, color: 'green' },
    { label: 'Sản phẩm', value: '45,890', change: '+15.3%', icon: Package, color: 'purple' },
    { label: 'Đơn hàng', value: '8,920', change: '+10.1%', icon: ShoppingBag, color: 'yellow' },
    { label: 'Doanh thu', value: '890M VNĐ', change: '+18.5%', icon: DollarSign, color: 'green' },
    { label: 'Báo cáo', value: '23', change: '+5', icon: Flag, color: 'red' }
  ];

  const pendingSellers = [
    { 
      id: '1', 
      name: 'Nguyễn Văn B', 
      email: 'nguyenvanb@email.com', 
      phone: '0901234567',
      date: '15/12/2024', 
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400',
      businessName: 'Cửa hàng điện tử ABC',
      businessType: 'Cá nhân',
      documents: ['CCCD', 'Giấy phép KD']
    },
    { 
      id: '2', 
      name: 'Trần Thị C', 
      email: 'tranthic@email.com',
      phone: '0907654321', 
      date: '14/12/2024', 
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
      businessName: 'Fashion Store XYZ',
      businessType: 'Công ty',
      documents: ['CCCD', 'Giấy phép KD', 'Giấy đăng ký thuế']
    },
    { 
      id: '3', 
      name: 'Lê Văn D', 
      email: 'levand@email.com',
      phone: '0909876543', 
      date: '14/12/2024', 
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      businessName: 'Đồ gia dụng DEF',
      businessType: 'Cá nhân',
      documents: ['CCCD', 'Giấy phép KD']
    }
  ];

  const allUsers = [
    { 
      id: '1', 
      name: 'Nguyễn Thị A', 
      email: 'nguyenthia@email.com', 
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      role: 'buyer',
      status: 'active',
      joinDate: '10/12/2024',
      totalOrders: 15,
      totalSpent: '5.2M'
    },
    { 
      id: '2', 
      name: 'Trần Văn B', 
      email: 'tranvanb@email.com', 
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400',
      role: 'seller',
      status: 'active',
      joinDate: '05/12/2024',
      totalOrders: 45,
      totalSpent: '0'
    },
    { 
      id: '3', 
      name: 'Phạm Thị C', 
      email: 'phamthic@email.com', 
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      role: 'buyer',
      status: 'banned',
      joinDate: '01/12/2024',
      totalOrders: 2,
      totalSpent: '800K'
    }
  ];

  const pendingProducts = [
    {
      id: '1',
      name: 'iPhone 15 Pro Max 256GB',
      seller: 'Nguyễn Văn A',
      price: '29.990.000',
      category: 'Điện tử',
      image: 'https://images.unsplash.com/photo-1592286927505-f0e2b2c22e46?w=400',
      submitDate: '15/12/2024',
      status: 'pending'
    },
    {
      id: '2',
      name: 'Áo khoác nữ cao cấp',
      seller: 'Trần Thị B',
      price: '450.000',
      category: 'Thời trang',
      image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400',
      submitDate: '15/12/2024',
      status: 'pending'
    },
    {
      id: '3',
      name: 'Laptop Dell XPS 13',
      seller: 'Lê Văn C',
      price: '25.000.000',
      category: 'Điện tử',
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400',
      submitDate: '14/12/2024',
      status: 'pending'
    }
  ];

  const recentReports = [
    { 
      id: '1', 
      type: 'product', 
      content: 'Sản phẩm giả mạo, không đúng mô tả', 
      reporter: 'Nguyễn Văn A', 
      reporterAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400',
      reported: 'iPhone 15 Pro Max',
      date: '1 giờ trước', 
      status: 'pending' 
    },
    { 
      id: '2', 
      type: 'post', 
      content: 'Nội dung không phù hợp, vi phạm quy định', 
      reporter: 'Trần Thị B', 
      reporterAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
      reported: 'Bài đăng #12345',
      date: '2 giờ trước', 
      status: 'pending' 
    },
    { 
      id: '3', 
      type: 'user', 
      content: 'Spam và lừa đảo', 
      reporter: 'Phạm Văn C', 
      reporterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      reported: 'User #789',
      date: '3 giờ trước', 
      status: 'reviewing' 
    },
    { 
      id: '4', 
      type: 'seller', 
      content: 'Giao hàng chậm, không trả lời tin nhắn', 
      reporter: 'Lê Thị D', 
      reporterAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      reported: 'Shop ABC',
      date: '5 giờ trước', 
      status: 'pending' 
    }
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-700',
      banned: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
      reviewing: 'bg-blue-100 text-blue-700'
    };
    const labels = {
      active: 'Hoạt động',
      banned: 'Đã khóa',
      pending: 'Chờ xử lý',
      reviewing: 'Đang xem xét'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => onNavigate('home')}>
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl">Quản trị hệ thống</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                Admin
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-4 text-sm whitespace-nowrap ${
                activeTab === 'users'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Người dùng ({allUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('sellers')}
              className={`px-6 py-4 text-sm whitespace-nowrap ${
                activeTab === 'sellers'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Đơn đăng ký Seller ({pendingSellers.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-4 text-sm whitespace-nowrap ${
                activeTab === 'products'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Kiểm duyệt sản phẩm ({pendingProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-4 text-sm whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Báo cáo vi phạm ({recentReports.filter(r => r.status === 'pending').length})
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg">Đơn đăng ký Seller chờ duyệt</h2>
                  <button 
                    onClick={() => setActiveTab('sellers')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Xem tất cả →
                  </button>
                </div>
                <div className="space-y-3">
                  {pendingSellers.slice(0, 3).map((seller) => (
                    <div key={seller.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img src={seller.avatar} alt={seller.name} className="w-10 h-10 rounded-full flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm truncate">{seller.name}</p>
                          <p className="text-xs text-gray-500 truncate">{seller.businessName}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700" title="Duyệt">
                          <Check className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 border border-red-300 text-red-600 rounded hover:bg-red-50" title="Từ chối">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg">Báo cáo gần đây</h2>
                  <button 
                    onClick={() => setActiveTab('reports')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Xem tất cả →
                  </button>
                </div>
                <div className="space-y-3">
                  {recentReports.slice(0, 3).map((report) => (
                    <div key={report.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-2 flex-1">
                          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-sm mb-1">{report.content}</p>
                            <p className="text-xs text-gray-500">Đối tượng: {report.reported}</p>
                          </div>
                        </div>
                        {getStatusBadge(report.status)}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                        <span>Báo cáo bởi {report.reporter}</span>
                        <span>{report.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Growth Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg mb-4">Tăng trưởng người dùng (30 ngày qua)</h2>
              <div className="h-64 flex items-end justify-between gap-2">
                {[320, 380, 420, 450, 490, 520, 580, 610, 670, 720, 750, 820, 880, 920, 980, 1020, 1080, 1150, 1200, 1280, 1340, 1420, 1480, 1540, 1620, 1680, 1750, 1820, 1890, 1950].map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div className="relative w-full">
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:from-blue-700 hover:to-blue-500 cursor-pointer"
                        style={{ height: `${(value / 2000) * 256}px` }}
                      />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {value} users
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-xs text-gray-500">
                <span>Ngày 1</span>
                <span>Ngày 15</span>
                <span>Ngày 30</span>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm người dùng..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Hoạt động</option>
                    <option value="banned">Đã khóa</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Người dùng</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Email</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Vai trò</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Trạng thái</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Ngày tham gia</th>
                      <th className="text-left py-3 px-4 text-sm text-gray-600">Đơn hàng</th>
                      <th className="text-right py-3 px-4 text-sm text-gray-600">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                            <span className="text-sm">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.role === 'seller' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.role === 'seller' ? 'Người bán' : 'Người mua'}
                          </span>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(user.status)}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{user.joinDate}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{user.totalOrders}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded" title="Xem chi tiết">
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded" title="Nhắn tin">
                              <MessageSquare className="w-4 h-4 text-gray-600" />
                            </button>
                            {user.status === 'active' ? (
                              <button className="p-2 hover:bg-red-50 rounded" title="Khóa tài khoản">
                                <Ban className="w-4 h-4 text-red-600" />
                              </button>
                            ) : (
                              <button className="p-2 hover:bg-green-50 rounded" title="Mở khóa">
                                <Shield className="w-4 h-4 text-green-600" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Sellers Tab */}
        {activeTab === 'sellers' && (
          <div className="space-y-4">
            {pendingSellers.map((seller) => (
              <div key={seller.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <img src={seller.avatar} alt={seller.name} className="w-16 h-16 rounded-full" />
                    <div className="flex-1">
                      <h3 className="mb-1">{seller.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{seller.businessName}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Email:</span>
                          <span>{seller.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">SĐT:</span>
                          <span>{seller.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Loại hình:</span>
                          <span>{seller.businessType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Ngày đăng ký:</span>
                          <span>{seller.date}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 mb-2">Tài liệu đã nộp:</p>
                        <div className="flex flex-wrap gap-2">
                          {seller.documents.map((doc, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex lg:flex-col gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center">
                      <Eye className="w-4 h-4" />
                      Xem hồ sơ
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 justify-center">
                      <Check className="w-4 h-4" />
                      Phê duyệt
                    </button>
                    <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2 justify-center">
                      <X className="w-4 h-4" />
                      Từ chối
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {pendingProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <img src={product.image} alt={product.name} className="w-full md:w-32 h-32 object-cover rounded-lg" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600">Người bán: {product.seller}</p>
                      </div>
                      {getStatusBadge(product.status)}
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-gray-500">Giá</p>
                        <p className="text-blue-600">{product.price} VNĐ</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Danh mục</p>
                        <p>{product.category}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Ngày gửi</p>
                        <p>{product.submitDate}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex md:flex-col gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 justify-center whitespace-nowrap">
                      <Eye className="w-4 h-4" />
                      Chi tiết
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 justify-center whitespace-nowrap">
                      <Check className="w-4 h-4" />
                      Duyệt
                    </button>
                    <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2 justify-center whitespace-nowrap">
                      <X className="w-4 h-4" />
                      Từ chối
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="mb-1">{report.content}</h3>
                        <p className="text-sm text-gray-600">Đối tượng bị báo cáo: {report.reported}</p>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <img src={report.reporterAvatar} alt="" className="w-6 h-6 rounded-full" />
                        <span>Báo cáo bởi {report.reporter}</span>
                      </div>
                      <span>•</span>
                      <span>{report.date}</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        report.type === 'product' ? 'bg-purple-100 text-purple-700' :
                        report.type === 'user' ? 'bg-blue-100 text-blue-700' :
                        report.type === 'seller' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {report.type === 'product' ? 'Sản phẩm' :
                         report.type === 'user' ? 'Người dùng' :
                         report.type === 'seller' ? 'Người bán' : 'Bài đăng'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                        Xem chi tiết
                      </button>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                        Chấp nhận
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                        Bỏ qua
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                        Khóa đối tượng
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
