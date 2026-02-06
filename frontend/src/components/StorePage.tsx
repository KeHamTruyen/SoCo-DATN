import { useState } from 'react';
import { ArrowLeft, Star, MapPin, Share2, MessageCircle, Heart, ShoppingCart, Filter, Grid, List, Store, Users, Package, CheckCircle } from 'lucide-react';
import { User, Product } from '../App';
import { mockProducts } from '../data/mockData';

interface StorePageProps {
  currentUser: User;
  storeOwnerId?: string;
  onNavigate: (page: any, productId?: string) => void;
  onAddToCart: (product: Product) => void;
}

export function StorePage({ currentUser, storeOwnerId, onNavigate, onAddToCart }: StorePageProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'about'>('products');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock store owner data
  const storeOwner: User = {
    id: storeOwnerId || '1',
    name: 'Nguyễn Văn A',
    username: 'nguyenvana',
    email: 'nguyenvana@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
    role: 'seller',
    isVerified: true,
    followers: 12500,
    following: 342,
    bio: 'Chuyên cung cấp các sản phẩm thời trang chất lượng cao, uy tín từ 2020. Cam kết hàng chính hãng 100%',
    phone: '0901234567',
    address: 'TP. Hồ Chí Minh',
    createdAt: '2020-01-15'
  };

  // Filter products by store owner
  const storeProducts = mockProducts.filter(p => p.sellerId === storeOwner.id);
  
  const filteredProducts = selectedCategory === 'all' 
    ? storeProducts 
    : storeProducts.filter(p => p.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(storeProducts.map(p => p.category)))];

  const stats = [
    { label: 'Sản phẩm', value: storeProducts.length, icon: Package },
    { label: 'Đánh giá', value: '4.8', icon: Star },
    { label: 'Người theo dõi', value: storeOwner.followers.toLocaleString(), icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-6">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => onNavigate('home')}>
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-blue-600" />
                <h1 className="text-lg">Cửa hàng</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600">
        {storeOwner.coverImage && (
          <img
            src={storeOwner.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Store Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm -mt-16 relative z-10 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex justify-center md:justify-start">
              <div className="relative">
                <img
                  src={storeOwner.avatar}
                  alt={storeOwner.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                />
                {storeOwner.isVerified && (
                  <div className="absolute bottom-2 right-2 bg-blue-600 rounded-full p-1">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                <div>
                  <h1 className="text-2xl mb-1">{storeOwner.name}</h1>
                  <p className="text-gray-500">@{storeOwner.username}</p>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0 justify-center md:justify-start">
                  {currentUser.id !== storeOwner.id && (
                    <>
                      <button
                        onClick={() => setIsFollowing(!isFollowing)}
                        className={`px-6 py-2 rounded-lg transition-colors ${
                          isFollowing
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                      </button>
                      <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <MessageCircle className="w-5 h-5 inline" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <p className="text-gray-600 mb-4">{storeOwner.bio}</p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {storeOwner.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{storeOwner.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Store className="w-4 h-4" />
                  <span>Tham gia từ {new Date(storeOwner.createdAt).getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon className="w-5 h-5 text-blue-600" />
                  <span className="text-xl">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-4 text-sm ${
                activeTab === 'products'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
            >
              Sản phẩm ({storeProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`flex-1 py-4 text-sm ${
                activeTab === 'about'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
            >
              Giới thiệu
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'products' && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category === 'all' ? 'Tất cả' : category}
                    </button>
                  ))}
                </div>

                {/* View Mode */}
                <div className="flex items-center gap-2">
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

            {/* Products Grid/List */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Không có sản phẩm nào trong danh mục này</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => onNavigate('product-detail', product.id)}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="relative aspect-square">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                      >
                        <Heart className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm mb-2 line-clamp-2">{product.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-600">{product.price.toLocaleString('vi-VN')}đ</span>
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
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-sm mb-2">{product.title}</h3>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg text-blue-600">{product.price.toLocaleString('vi-VN')}đ</span>
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
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg mb-4">Giới thiệu cửa hàng</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-gray-500 mb-2">Mô tả</h3>
                <p className="text-gray-700">{storeOwner.bio}</p>
              </div>
              {storeOwner.phone && (
                <div>
                  <h3 className="text-sm text-gray-500 mb-2">Số điện thoại</h3>
                  <p className="text-gray-700">{storeOwner.phone}</p>
                </div>
              )}
              {storeOwner.address && (
                <div>
                  <h3 className="text-sm text-gray-500 mb-2">Địa chỉ</h3>
                  <p className="text-gray-700">{storeOwner.address}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm text-gray-500 mb-2">Thành viên từ</h3>
                <p className="text-gray-700">
                  {new Date(storeOwner.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
