import { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Heart, Star, Grid, List, Store, TrendingUp, Award, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from './Layout/PageLayout';
import { useAuth } from '../contexts/AuthContext';
import productService, { Product as ApiProduct } from '../services/product.service';
import categoryService, { Category } from '../services/category.service';
import cartService from '../services/cart.service';

export function MarketplacePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sortBy, priceRange, page]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      const categoryList = Array.isArray(response.data)
        ? response.data
        : response.data?.categories || [];
      setCategories(categoryList);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      
      // Map sortBy to API parameters
      let sortByParam = 'createdAt';
      let sortOrderParam: 'asc' | 'desc' = 'desc';
      
      switch (sortBy) {
        case 'price-low':
          sortByParam = 'price';
          sortOrderParam = 'asc';
          break;
        case 'price-high':
          sortByParam = 'price';
          sortOrderParam = 'desc';
          break;
        case 'popular':
          sortByParam = 'salesCount';
          sortOrderParam = 'desc';
          break;
        case 'newest':
        default:
          sortByParam = 'createdAt';
          sortOrderParam = 'desc';
      }

      const response = await productService.getProducts({
        page,
        limit: 20,
        categoryId: selectedCategory || undefined,
        search: searchQuery || undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        sortBy: sortByParam,
        sortOrder: sortOrderParam,
        status: 'ACTIVE'
      });

      const productList = Array.isArray(response.data)
        ? response.data
        : response.data?.products || [];

      const pagination = response.pagination || response.data?.pagination;

      if (page === 1) {
        setProducts(productList);
      } else {
        setProducts((prev) => [...prev, ...productList]);
      }
      
      if (pagination) {
        setHasMore(pagination.page < pagination.totalPages);
      } else {
        setHasMore(productList.length >= 20);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      if (page === 1) {
        setProducts([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadProducts();
  };

  const handleAddToCart = async (product: ApiProduct) => {
    try {
      await cartService.addToCart({
        productId: product.id,
        quantity: 1,
        selectedVariant: product.variants?.[0]?.options || undefined
      });
      alert('Đã thêm vào giỏ hàng!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Không thể thêm vào giỏ hàng');
    }
  };
  
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <PageLayout activePage="marketplace">
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
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Tìm kiếm sản phẩm..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              <span>Tìm kiếm</span>
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>🛍️</span>
              <span className="text-sm">Tất cả</span>
            </button>
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
                <span className="text-sm">{category.name}</span>
                {category._count && (
                  <span className="text-xs opacity-75">({category._count.products})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:block hidden">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Bộ lọc</h3>
                <Filter className="w-4 h-4 text-gray-400" />
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm text-gray-700 mb-3 font-medium">Khoảng giá</h4>
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
                        onChange={() => {
                          setPriceRange(option.range as [number, number]);
                          setPage(1);
                        }}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
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
                    {products.length} sản phẩm
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
                    onChange={(e) => {
                      setSortBy(e.target.value as any);
                      setPage(1);
                    }}
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

            {/* Loading State */}
            {isLoading && page === 1 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-gray-500">Đang tải sản phẩm...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-500">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => {
                  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
                  
                  return (
                    <div
                      key={product.id}
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={primaryImage?.imageUrl || 'https://via.placeholder.com/400'}
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
                        {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                            -{Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)}%
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-medium mb-2 line-clamp-2 h-10">{product.title}</h3>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-600">4.8</span>
                          <span className="text-xs text-gray-400">| Đã bán {product.salesCount || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-base font-semibold text-blue-600">
                              {Number(product.price).toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        </div>
                        {/* Seller Info */}
                        {product.seller && (
                          <div 
                            className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/store/${product.seller?.username}`);
                            }}
                          >
                            <img
                              src={product.seller.avatarUrl || 'https://via.placeholder.com/40'}
                              alt={product.seller.fullName}
                              className="w-5 h-5 rounded-full"
                            />
                            <span className="text-xs text-gray-600 hover:text-blue-600 flex-1 truncate">
                              {product.seller.fullName}
                            </span>
                            <Store className="w-3 h-3 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => {
                  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
                  
                  return (
                    <div
                      key={product.id}
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex gap-4 p-4">
                        <div className="relative w-32 h-32 flex-shrink-0">
                          <img
                            src={primaryImage?.imageUrl || 'https://via.placeholder.com/400'}
                            alt={product.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                              -{Math.round((1 - Number(product.price) / Number(product.compareAtPrice)) * 100)}%
                            </div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col">
                          <h3 className="text-base font-medium mb-2">{product.title}</h3>
                          <p className="text-sm text-gray-500 mb-2 line-clamp-2 flex-1">{product.description}</p>
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-gray-600">4.8</span>
                            <span className="text-sm text-gray-400">| Đã bán {product.salesCount || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-blue-600">
                              {Number(product.price).toLocaleString('vi-VN')}đ
                            </span>
                            <div className="flex items-center gap-3">
                              {product.seller && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/store/${product.seller?.username}`);
                                  }}
                                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                                >
                                  <img
                                    src={product.seller.avatarUrl || 'https://via.placeholder.com/40'}
                                    alt={product.seller.fullName}
                                    className="w-6 h-6 rounded-full"
                                  />
                                  <span>{product.seller.fullName}</span>
                                  <Store className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                              >
                                <ShoppingCart className="w-4 h-4" />
                                <span className="text-sm">Thêm vào giỏ</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && products.length > 0 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={isLoading}
                  className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Đang tải...' : 'Xem thêm sản phẩm'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}