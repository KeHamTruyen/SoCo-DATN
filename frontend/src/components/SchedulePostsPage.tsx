import { useState } from 'react';
import { ArrowLeft, Calendar, Clock, Edit, Trash2, Eye, Filter, ChevronDown, SortAsc } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function SchedulePostsPage() {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Loading...</div>;
  }
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'published'>('all');
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const allPosts = [
    {
      id: '1',
      content: 'Khám phá bộ sưu tập mùa đông mới! 🌟 Giảm giá đến 30% cho tất cả sản phẩm.',
      scheduledDate: '2024-12-25',
      scheduledTime: '09:00',
      status: 'scheduled' as const,
      image: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=400'
    },
    {
      id: '2',
      content: 'Flash Sale cuối tuần! Chỉ trong 24h. Nhanh tay đặt hàng ngay! ⚡',
      scheduledDate: '2024-12-26',
      scheduledTime: '10:00',
      status: 'scheduled' as const,
      image: 'https://images.unsplash.com/photo-1598538476953-eb5f34104298?w=400'
    },
    {
      id: '3',
      content: 'Cảm ơn quý khách đã ủng hộ. Chúc mọi người cuối tuần vui vẻ! 🎉',
      scheduledDate: '2024-12-28',
      scheduledTime: '18:00',
      status: 'scheduled' as const,
      image: null
    },
    {
      id: '4',
      content: 'Giới thiệu sản phẩm mới nhất trong tuần! Đặt hàng ngay để nhận ưu đãi.',
      scheduledDate: '2024-12-20',
      scheduledTime: '14:00',
      status: 'published' as const,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'
    },
    {
      id: '5',
      content: 'Đánh giá từ khách hàng về sản phẩm bestseller của tháng.',
      scheduledDate: '2024-12-19',
      scheduledTime: '16:30',
      status: 'published' as const,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
    },
    {
      id: '6',
      content: 'Tips & Tricks chọn quần áo phù hợp với từng dáng người! 👗',
      scheduledDate: '2024-12-18',
      scheduledTime: '11:00',
      status: 'published' as const,
      image: null
    }
  ];

  // Filter posts
  const filterPostsByDate = (posts: typeof allPosts) => {
    if (filterDateRange === 'all') return posts;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return posts.filter(post => {
      const postDate = new Date(post.scheduledDate);

      if (filterDateRange === 'today') {
        return postDate.toDateString() === today.toDateString();
      } else if (filterDateRange === 'week') {
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return postDate >= today && postDate <= weekFromNow;
      } else if (filterDateRange === 'month') {
        const monthFromNow = new Date(today);
        monthFromNow.setMonth(monthFromNow.getMonth() + 1);
        return postDate >= today && postDate <= monthFromNow;
      } else if (filterDateRange === 'custom' && customDateStart && customDateEnd) {
        const startDate = new Date(customDateStart);
        const endDate = new Date(customDateEnd);
        return postDate >= startDate && postDate <= endDate;
      }
      return true;
    });
  };

  const filterPostsByStatus = (posts: typeof allPosts) => {
    if (filterStatus === 'all') return posts;
    return posts.filter(post => post.status === filterStatus);
  };

  const sortPosts = (posts: typeof allPosts) => {
    return [...posts].sort((a, b) => {
      const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
      const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
      return sortOrder === 'asc' 
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });
  };

  // Apply all filters
  let filteredPosts = allPosts;
  filteredPosts = filterPostsByStatus(filteredPosts);
  filteredPosts = filterPostsByDate(filteredPosts);
  filteredPosts = sortPosts(filteredPosts);

  const scheduledCount = allPosts.filter(p => p.status === 'scheduled').length;
  const publishedCount = allPosts.filter(p => p.status === 'published').length;

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
              <h1 className="text-xl">Bài viết đã lên lịch</h1>
            </div>
            <div className="relative">
              <button
                className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <Filter className="w-4 h-4" />
                Lọc
                <ChevronDown className="w-4 h-4" />
              </button>
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-10">
                  <div className="p-4">
                    <h3 className="text-sm font-bold mb-2">Trạng thái</h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="allStatus"
                        name="status"
                        value="all"
                        checked={filterStatus === 'all'}
                        onChange={() => setFilterStatus('all')}
                      />
                      <label htmlFor="allStatus">Tất cả</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="scheduledStatus"
                        name="status"
                        value="scheduled"
                        checked={filterStatus === 'scheduled'}
                        onChange={() => setFilterStatus('scheduled')}
                      />
                      <label htmlFor="scheduledStatus">Đã lên lịch</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="publishedStatus"
                        name="status"
                        value="published"
                        checked={filterStatus === 'published'}
                        onChange={() => setFilterStatus('published')}
                      />
                      <label htmlFor="publishedStatus">Đã đăng</label>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold mb-2">Khoảng thời gian</h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="allDate"
                        name="dateRange"
                        value="all"
                        checked={filterDateRange === 'all'}
                        onChange={() => setFilterDateRange('all')}
                      />
                      <label htmlFor="allDate">Tất cả</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="todayDate"
                        name="dateRange"
                        value="today"
                        checked={filterDateRange === 'today'}
                        onChange={() => setFilterDateRange('today')}
                      />
                      <label htmlFor="todayDate">Hôm nay</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="weekDate"
                        name="dateRange"
                        value="week"
                        checked={filterDateRange === 'week'}
                        onChange={() => setFilterDateRange('week')}
                      />
                      <label htmlFor="weekDate">Tuần này</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="monthDate"
                        name="dateRange"
                        value="month"
                        checked={filterDateRange === 'month'}
                        onChange={() => setFilterDateRange('month')}
                      />
                      <label htmlFor="monthDate">Tháng này</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="customDate"
                        name="dateRange"
                        value="custom"
                        checked={filterDateRange === 'custom'}
                        onChange={() => setFilterDateRange('custom')}
                      />
                      <label htmlFor="customDate">Tùy chỉnh</label>
                    </div>
                    {filterDateRange === 'custom' && (
                      <div className="mt-2">
                        <input
                          type="date"
                          value={customDateStart}
                          onChange={(e) => setCustomDateStart(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="date"
                          value={customDateEnd}
                          onChange={(e) => setCustomDateEnd(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-lg mt-2"
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold mb-2">Sắp xếp</h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="ascSort"
                        name="sortOrder"
                        value="asc"
                        checked={sortOrder === 'asc'}
                        onChange={() => setSortOrder('asc')}
                      />
                      <label htmlFor="ascSort">Tăng dần</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="descSort"
                        name="sortOrder"
                        value="desc"
                        checked={sortOrder === 'desc'}
                        onChange={() => setSortOrder('desc')}
                      />
                      <label htmlFor="descSort">Giảm dần</label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter & Sort Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Trạng thái</label>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">Tất cả ({allPosts.length})</option>
                  <option value="scheduled">Đang chờ ({scheduledCount})</option>
                  <option value="published">Đã đăng ({publishedCount})</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Khoảng thời gian</label>
              <div className="relative">
                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">Tất cả</option>
                  <option value="today">Hôm nay</option>
                  <option value="week">7 ngày tới</option>
                  <option value="month">30 ngày tới</option>
                  <option value="custom">Tùy chỉnh</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Sắp xếp theo thời gian</label>
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none bg-white"
                >
                  <option value="asc">Cũ nhất trước</option>
                  <option value="desc">Mới nhất trước</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Custom Date Range */}
          {filterDateRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Từ ngày</label>
                <input
                  type="date"
                  value={customDateStart}
                  onChange={(e) => setCustomDateStart(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Đến ngày</label>
                <input
                  type="date"
                  value={customDateEnd}
                  onChange={(e) => setCustomDateEnd(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">Đang hiển thị:</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {filteredPosts.length} bài viết
            </span>
            {(filterStatus !== 'all' || filterDateRange !== 'all') && (
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterDateRange('all');
                  setCustomDateStart('');
                  setCustomDateEnd('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Scheduled Posts */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex gap-4">
                {post.image && (
                  <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={post.image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 mb-3 line-clamp-3">{post.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.scheduledDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.scheduledTime}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      post.status === 'scheduled' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {post.status === 'scheduled' ? 'Đang chờ' : 'Đã đăng'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Xem trước
                    </button>
                    <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      Chỉnh sửa
                    </button>
                    <button className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg mb-2">Chưa có bài viết nào được lên lịch</h3>
            <p className="text-gray-600 mb-6">
              Tạo bài viết và chọn lên lịch để tự động đăng vào thời gian mong muốn
            </p>
            <button
              onClick={() => onNavigate('home')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tạo bài viết mới
            </button>
          </div>
        )}
      </div>
    </div>
  );
}