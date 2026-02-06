import { useState } from 'react';
import { ArrowLeft, Search, Filter, Users, Package, FileText, User as UserIcon, Heart, MessageCircle, ShoppingCart, MapPin, UserPlus, Check } from 'lucide-react';
import { User, Product } from '../App';
import { mockProducts } from '../data/mockData';

interface SearchResultsPageProps {
  currentUser: User;
  onNavigate: (page: any, id?: string) => void;
  searchQuery?: string;
  onAddToCart: (product: Product) => void;
}

export function SearchResultsPage({ currentUser, onNavigate, searchQuery = '', onAddToCart }: SearchResultsPageProps) {
  const [query, setQuery] = useState(searchQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'products' | 'groups' | 'users'>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: 'all',
    location: 'all',
    verified: false,
    inStock: false
  });

  // Mock data
  const mockPosts = [
    {
      id: '1',
      author: { name: 'Nguyễn Văn A', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400', username: 'nguyenvana' },
      content: 'Vừa nhận được chiếc áo thun mới từ shop! Chất lượng tuyệt vời, giá cả phải chăng. Rất đáng để mua!',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      likes: 245,
      comments: 32,
      timestamp: '2 giờ trước'
    },
    {
      id: '2',
      author: { name: 'Trần Thị B', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', username: 'tranthib' },
      content: 'Review laptop gaming mới mua: hiệu năng mạnh mẽ, thiết kế đẹp. Chơi game cực mượt!',
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800',
      likes: 189,
      comments: 45,
      timestamp: '5 giờ trước'
    }
  ];

  const mockGroups = [
    {
      id: '1',
      name: 'Cộng đồng Thời trang Việt',
      description: 'Nơi chia sẻ và thảo luận về xu hướng thời trang, mua sắm và review sản phẩm',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
      members: 12500,
      posts: 3420,
      isJoined: true
    },
    {
      id: '2',
      name: 'Đam mê Công nghệ',
      description: 'Cộng đồng yêu thích công nghệ, chia sẻ kiến thức và đánh giá thiết bị',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
      members: 8900,
      posts: 2150,
      isJoined: false
    },
    {
      id: '3',
      name: 'Review Sản phẩm',
      description: 'Review chi tiết các sản phẩm từ thời trang, công nghệ đến nội thất',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
      members: 6700,
      posts: 1890,
      isJoined: true
    },
    {
      id: '4',
      name: 'Mẹo Mua Sắm Online',
      description: 'Chia sẻ kinh nghiệm mua sắm online, săn sale và voucher',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
      members: 9300,
      posts: 4100,
      isJoined: false
    }
  ];

  const mockUsers = [
    {
      id: '1',
      name: 'Lê Văn C',
      username: 'levanc',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      bio: 'Seller chuyên đồ công nghệ • 4.9⭐ • 2K+ đơn',
      followers: 5600,
      isVerified: true,
      isFollowing: false,
      location: 'TP. Hồ Chí Minh'
    },
    {
      id: '2',
      name: 'Phạm Thị D',
      username: 'phamthid',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      bio: 'Fashion Blogger | Shop Thời trang Nữ',
      followers: 12300,
      isVerified: true,
      isFollowing: true,
      location: 'Hà Nội'
    },
    {
      id: '3',
      name: 'Hoàng Văn E',
      username: 'hoangvane',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      bio: 'Reviewer đồ điện tử • Tech Enthusiast',
      followers: 3400,
      isVerified: false,
      isFollowing: false,
      location: 'Đà Nẵng'
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', query);
  };

  const categories = ['Tất cả', 'Thời trang', 'Điện tử', 'Nội thất', 'Mỹ phẩm', 'Thể thao', 'Sách', 'Đồ ăn'];
  const priceRanges = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Dưới 100K', value: '0-100000' },
    { label: '100K - 500K', value: '100000-500000' },
    { label: '500K - 1M', value: '500000-1000000' },
    { label: 'Trên 1M', value: '1000000+' }
  ];

  const locations = ['Tất cả', 'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'];

  const filteredProducts = mockProducts;
  const resultsCount = mockPosts.length + filteredProducts.length + mockGroups.length + mockUsers.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => onNavigate('home')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <form onSubmit={handleSearch} className="flex-1 max-w-3xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm, người dùng, nhóm..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  autoFocus
                />
              </div>
            </form>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg">Bộ lọc</h3>
                  <button
                    onClick={() => setFilters({
                      category: 'all',
                      priceRange: 'all',
                      location: 'all',
                      verified: false,
                      inStock: false
                    })}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Đặt lại
                  </button>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <label className="block text-sm mb-2">Danh mục</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6">
                  <label className="block text-sm mb-2">Khoảng giá</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    {priceRanges.map((range) => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div className="mb-6">
                  <label className="block text-sm mb-2">Khu vực</label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc.toLowerCase()}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Checkbox Filters */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.verified}
                      onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
                    />
                    <span className="text-sm">Chỉ tài khoản đã xác minh</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
                    />
                    <span className="text-sm">Còn hàng</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-4">
              <p className="text-gray-600">
                Tìm thấy <strong>{resultsCount}</strong> kết quả {query && `cho "${query}"`}
              </p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="flex border-b border-gray-200 overflow-x-auto">
                {[
                  { key: 'all', label: 'Tất cả', icon: Search, count: resultsCount },
                  { key: 'posts', label: 'Bài viết', icon: FileText, count: mockPosts.length },
                  { key: 'products', label: 'Sản phẩm', icon: Package, count: filteredProducts.length },
                  { key: 'groups', label: 'Nhóm', icon: Users, count: mockGroups.length },
                  { key: 'users', label: 'Người dùng', icon: UserIcon, count: mockUsers.length }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`flex items-center gap-2 px-6 py-4 text-sm whitespace-nowrap transition-colors ${
                        activeTab === tab.key
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results Content */}
            <div className="space-y-4">
              {/* Posts Results */}
              {(activeTab === 'all' || activeTab === 'posts') && mockPosts.length > 0 && (
                <div>
                  {activeTab === 'all' && (
                    <h3 className="text-lg mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Bài viết
                    </h3>
                  )}
                  <div className="space-y-4">
                    {mockPosts.map((post) => (
                      <div key={post.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                          <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full" />
                          <div>
                            <p className="text-sm">{post.author.name}</p>
                            <p className="text-xs text-gray-500">@{post.author.username} • {post.timestamp}</p>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{post.content}</p>
                        {post.image && (
                          <img src={post.image} alt="" className="w-full rounded-lg mb-3" />
                        )}
                        <div className="flex items-center gap-6 text-gray-500">
                          <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                            <Heart className="w-5 h-5" />
                            <span className="text-sm">{post.likes}</span>
                          </button>
                          <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm">{post.comments}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Results */}
              {(activeTab === 'all' || activeTab === 'products') && filteredProducts.length > 0 && (
                <div>
                  {activeTab === 'all' && (
                    <h3 className="text-lg mb-3 mt-6 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Sản phẩm
                    </h3>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.slice(0, activeTab === 'all' ? 3 : undefined).map((product) => (
                      <div
                        key={product.id}
                        onClick={() => onNavigate('product-detail', product.id)}
                        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="aspect-square relative">
                          <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                            {product.category}
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="text-sm mb-1 line-clamp-1">{product.title}</h4>
                          <p className="text-lg text-blue-600 mb-2">{product.price.toLocaleString('vi-VN')}đ</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <img src={product.sellerAvatar} alt="" className="w-5 h-5 rounded-full" />
                            <span>{product.sellerName}</span>
                          </div>
                          <button
                            onClick={() => onAddToCart(product)}
                            className="w-full py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                          >
                            <ShoppingCart className="w-4 h-4 inline mr-1" />
                            Thêm vào giỏ hàng
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Groups Results */}
              {(activeTab === 'all' || activeTab === 'groups') && mockGroups.length > 0 && (
                <div>
                  {activeTab === 'all' && (
                    <h3 className="text-lg mb-3 mt-6 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Nhóm
                    </h3>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockGroups.map((group) => (
                      <div key={group.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-32 relative">
                          <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <h4 className="text-lg mb-2">{group.name}</h4>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <span>{group.members.toLocaleString()} thành viên</span>
                            <span>{group.posts.toLocaleString()} bài viết</span>
                          </div>
                          <button
                            onClick={() => onNavigate('groups')}
                            className={`w-full py-2 rounded-lg transition-colors ${
                              group.isJoined
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {group.isJoined ? (
                              <>
                                <Check className="w-4 h-4 inline mr-1" />
                                Đã tham gia
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4 inline mr-1" />
                                Tham gia
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users Results */}
              {(activeTab === 'all' || activeTab === 'users') && mockUsers.length > 0 && (
                <div>
                  {activeTab === 'all' && (
                    <h3 className="text-lg mb-3 mt-6 flex items-center gap-2">
                      <UserIcon className="w-5 h-5" />
                      Người dùng
                    </h3>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockUsers.map((user) => (
                      <div key={user.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3 mb-3">
                          <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="text-sm truncate">{user.name}</p>
                              {user.isVerified && (
                                <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{user.bio}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <MapPin className="w-3 h-3" />
                          <span>{user.location}</span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-600">{user.followers.toLocaleString()} người theo dõi</span>
                        </div>
                        <button
                          className={`w-full py-2 rounded-lg transition-colors ${
                            user.isFollowing
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {user.isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                        </button>
                      </div>
                    ))}
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