import { useState } from 'react';
import { Search, Filter, ShoppingCart, Heart, Star, ChevronDown, Grid, List, Store, TrendingUp, Award, Zap } from 'lucide-react';
import { User, Product } from '../App';
import { mockProducts } from '../data/mockData';
import { MessengerWidget } from './MessengerWidget';
import { PageLayout } from './Layout/PageLayout';

interface MarketplacePageProps {
  currentUser: User;
  onNavigate: (page: any, productId?: string) => void;
  onAddToCart: (product: Product) => void;
  cartItemCount: number;
  onLogout: () => void;
}

export function MarketplacePage({ currentUser, onNavigate, onAddToCart, cartItemCount, onLogout }: MarketplacePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: 'all', name: 'Tất cả', icon: '🛍️' },
    { id: 'Thời trang', name: 'Thời trang', icon: '👕' },
    { id: 'Điện tử', name: 'Điện tử', icon: '📱' },
    { id: 'Thể thao', name: 'Thể thao', icon: '⚽' },
    { id: 'Nội thất', name: 'Nội thất', icon: '🛋️' },
    { id: 'Mỹ phẩm', name: 'Mỹ phẩm', icon: '💄' },
  ];

  // Filter products
  let filteredProducts = mockProducts.filter(product => {
    const matchSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchSearch && matchCategory && matchPrice;
  });

  // Sort products
  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'popular':
        return b.likes - a.likes;
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <PageLayout 
      currentUser={currentUser}
      onNavigate={onNavigate}
      onLogout={onLogout}
      cartItemCount={cartItemCount}
      activePage="marketplace"
    >
      {/* Hero Banners */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 border border-white/20 rounded-lg p-6 backdrop-blur-sm hover:bg-white/20 transition-all cursor-pointer">
              <TrendingUp className="w-8 h-8 mb-2 text-white" />
              <h3 className="text-lg mb-1 text-white">Xu hướng hot</h3>
              <p className="text-sm text-white/90">Sản phẩm được yêu thích nhất</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-lg p-6 backdrop-blur-sm hover:bg-white/20 transition-all cursor-pointer">
              <Award className="w-8 h-8 mb-2 text-white" />
              <h3 className="text-lg mb-1 text-white">Top seller</h3>
              <p className="text-sm text-white/90">Người bán uy tín nhất</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-lg p-6 backdrop-blur-sm hover:bg-white/20 transition-all cursor-pointer">
              <Zap className="w-8 h-8 mb-2 text-white" />
              <h3 className="text-lg mb-1 text-white">Flash sale</h3>
              <p className="text-sm text-white/90">Giảm giá sốc trong ngày</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Categories */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span className="text-sm">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:block hidden">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm">Bộ lọc</h3>
                <Filter className="w-4 h-4 text-gray-400" />
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm text-gray-700 mb-3">Khoảng giá</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Dưới 100k', range: [0, 100000] },
                    { label: '100k - 500k', range: [100000, 500000] },
                    { label: '500k - 1tr', range: [500000, 1000000] },
                    { label: 'Trên 1tr', range: [1000000, 10000000] },
                  ].map((option) => (
                    <label key={option.label} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        checked={priceRange[0] === option.range[0] && priceRange[1] === option.range[1]}
                        onChange={() => setPriceRange(option.range as [number, number])}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h4 className="text-sm text-gray-700 mb-3">Đánh giá</h4>
                <div className="space-y-2">
                  {[5, 4, 3].map((rating) => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-blue-600" />
                      <div className="flex items-center gap-1">
                        {Array.from({ length: rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-sm text-gray-700 ml-1">trở lên</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Shipping */}
              <div>
                <h4 className="text-sm text-gray-700 mb-3">Dịch vụ</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">Miễn phí vận chuyển</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">Flash sale</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {filteredProducts.length} sản phẩm
                  </span>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 text-sm text-gray-600"
                  >
                    <Filter className="w-4 h-4" />
                    Lọc
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="popular">Phổ biến</option>
                    <option value="price-low">Giá thấp → cao</option>
                    <option value="price-high">Giá cao → thấp</option>
                  </select>

                  {/* View Mode */}
                  <div className="hidden md:flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg ${
                        viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg ${
                        viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-500">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => onNavigate('product-detail', product.id)}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Heart className="w-4 h-4 text-gray-600" />
                      </button>
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                        -{Math.floor(Math.random() * 30 + 10)}%
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm mb-2 line-clamp-2 h-10">{product.title}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">4.8</span>
                        <span className="text-xs text-gray-400">| Đã bán {Math.floor(Math.random() * 1000)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-blue-600">{product.price.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product);
                          }}
                          className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                      {/* Seller Info */}
                      <div 
                        className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('store', product.sellerId);
                        }}
                      >
                        <img
                          src={product.sellerAvatar}
                          alt={product.sellerName}
                          className="w-5 h-5 rounded-full"
                        />
                        <span className="text-xs text-gray-600 hover:text-blue-600 flex-1 truncate">
                          {product.sellerName}
                        </span>
                        <Store className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => onNavigate('product-detail', product.id)}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex gap-4 p-4">
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                          -{Math.floor(Math.random() * 30 + 10)}%
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-sm mb-2">{product.title}</h3>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2 flex-1">{product.description}</p>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">4.8</span>
                          <span className="text-sm text-gray-400">| Đã bán {Math.floor(Math.random() * 1000)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg text-blue-600">{product.price.toLocaleString('vi-VN')}đ</span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigate('store', product.sellerId);
                              }}
                              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                            >
                              <img
                                src={product.sellerAvatar}
                                alt={product.sellerName}
                                className="w-6 h-6 rounded-full"
                              />
                              <span>{product.sellerName}</span>
                              <Store className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(product);
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              <span className="text-sm">Thêm vào giỏ</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messenger Widget */}
      <MessengerWidget currentUser={currentUser} />
    </PageLayout>
  );
}