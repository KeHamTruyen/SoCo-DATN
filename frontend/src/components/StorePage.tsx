import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  MessageCircle,
  Heart,
  ShoppingCart,
  Grid,
  List,
  Store,
  Users,
  Package,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { PageLayout } from './Layout/PageLayout';
import type { Product as CartProduct } from '../App';
import userService, { type UserProfile } from '../services/user.service';
import productService, { type Product as ApiProduct } from '../services/product.service';

function toCartProduct(product: ApiProduct, owner: UserProfile): CartProduct {
  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.imageUrl ||
    product.images?.[0]?.imageUrl ||
    'https://via.placeholder.com/400x400?text=No+Image';

  const mappedVariants = product.variants?.map((variant) => {
    const optionValues = variant.options && typeof variant.options === 'object'
      ? Object.values(variant.options).flat().map((v) => String(v))
      : [];

    return {
      id: variant.id,
      name: variant.variantName,
      options: optionValues
    };
  });

  return {
    id: product.id,
    sellerId: owner.id,
    sellerName: owner.fullName,
    sellerAvatar: owner.avatarUrl || '',
    sellerUsername: owner.username,
    title: product.title,
    price: Number(product.price),
    image: primaryImage,
    description: product.description || '',
    likes: product.likesCount || 0,
    comments: product.commentsCount || 0,
    isLiked: false,
    createdAt: product.createdAt,
    category: product.category?.name || 'Khac',
    stock: product.stockQuantity || 0,
    variants: mappedVariants
  };
}

export function StorePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<'products' | 'about'>('products');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [storeOwner, setStoreOwner] = useState<UserProfile | null>(null);
  const [storeProducts, setStoreProducts] = useState<ApiProduct[]>([]);

  const isOwnStore = !!currentUser && !!storeOwner && currentUser.id === storeOwner.id;

  useEffect(() => {
    if (!currentUser) return;

    const fetchStoreData = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const slug = username || currentUser.username;
        const isOwnStoreSlug = !username || slug === currentUser.username || slug === currentUser.id;
        let owner: UserProfile | null = null;

        if (isOwnStoreSlug) {
          const myProfile = await userService.getMyProfile();
          owner = myProfile.data;
        } else {
          // Support both /store/:username and legacy /store/:id links.
          try {
            const byUsername = await userService.getUserByUsername(slug);
            owner = byUsername.data;
          } catch {
            const byId = await userService.getUserById(slug);
            owner = byId.data;
          }
        }

        if (!owner) {
          throw new Error('Không tìm thấy cửa hàng');
        }

        setStoreOwner(owner);

        const productResponse = isOwnStoreSlug
          ? await productService.getMyProducts({
              page: 1,
              limit: 100
            })
          : await productService.getProducts({
              sellerId: owner.id,
              status: 'ACTIVE',
              page: 1,
              limit: 100,
              sortBy: 'createdAt',
              sortOrder: 'desc'
            });

        const products = Array.isArray(productResponse.data)
          ? productResponse.data
          : productResponse.data?.products || [];

        setStoreProducts(products);
      } catch (error: any) {
        setErrorMessage(error?.response?.data?.message || error?.message || 'Không thể tải cửa hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [username, currentUser]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return storeProducts;
    return storeProducts.filter((p) => (p.category?.name || 'Khac') === selectedCategory);
  }, [selectedCategory, storeProducts]);

  const categories = useMemo(() => {
    const names = Array.from(new Set(storeProducts.map((p) => p.category?.name || 'Khac')));
    return ['all', ...names];
  }, [storeProducts]);

  const stats = useMemo(() => {
    const followers = storeOwner?._count?.followers ?? 0;
    const averageRating = storeOwner?.sellerRating?.average ?? 0;
    return [
      { label: 'Sản phẩm', value: storeProducts.length, icon: Package },
      { label: 'Đánh giá', value: averageRating.toFixed(1), icon: Star },
      { label: 'Người theo dõi', value: followers.toLocaleString('vi-VN'), icon: Users }
    ];
  }, [storeOwner, storeProducts.length]);

  if (!currentUser) return null;

  return (
    <PageLayout activePage="marketplace">
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : errorMessage || !storeOwner ? (
        <div className="py-16">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-gray-700 mb-4">{errorMessage || 'Không thể tải cửa hàng'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-500 to-cyan-600">
            <img
              src={storeOwner.avatarUrl || 'https://ui-avatars.com/api/?name=Shop'}
              alt="Cover"
              className="w-full h-full object-cover opacity-30"
            />
          </div>

          <div>
            <div className="bg-white rounded-lg shadow-sm -mt-16 relative z-10 p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex justify-center md:justify-start">
                  <div className="relative">
                    <img
                      src={storeOwner.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(storeOwner.fullName)}
                      alt={storeOwner.fullName}
                      className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                    />
                    {storeOwner.isVerified && (
                      <div className="absolute bottom-2 right-2 bg-blue-600 rounded-full p-1">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                    <div>
                      <h1 className="text-2xl mb-1">{storeOwner.fullName}</h1>
                      <p className="text-gray-500">@{storeOwner.username}</p>
                    </div>
                    <div className="flex gap-3 mt-4 md:mt-0 justify-center md:justify-start">
                      {!isOwnStore && (
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
                          <button
                            onClick={() => navigate(`/messages?recipientId=${storeOwner.id}`)}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            title="Nhắn tin với chủ cửa hàng"
                          >
                            <MessageCircle className="w-5 h-5 inline" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{storeOwner.bio || 'Chưa có mô tả cửa hàng'}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {storeOwner.phone && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{storeOwner.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Store className="w-4 h-4" />
                      <span>Tham gia từ {new Date(storeOwner.createdAt).getFullYear()}</span>
                    </div>
                  </div>
                </div>
              </div>

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

            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex-1 py-4 text-sm ${
                    activeTab === 'products' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                  }`}
                >
                  Sản phẩm ({storeProducts.length})
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`flex-1 py-4 text-sm ${
                    activeTab === 'about' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
                  }`}
                >
                  Giới thiệu
                </button>
              </div>
            </div>

            {activeTab === 'products' && (
              <div>
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

                {filteredProducts.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Không có sản phẩm nào trong danh mục này</p>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => {
                      const image =
                        product.images?.find((img) => img.isPrimary)?.imageUrl ||
                        product.images?.[0]?.imageUrl ||
                        'https://via.placeholder.com/400x400?text=No+Image';

                      return (
                        <div
                          key={product.id}
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="relative aspect-square">
                            <img src={image} alt={product.title} className="w-full h-full object-cover" />
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
                              <span className="text-blue-600">{Number(product.price).toLocaleString('vi-VN')}d</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(toCartProduct(product, storeOwner));
                                }}
                                className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProducts.map((product) => {
                      const image =
                        product.images?.find((img) => img.isPrimary)?.imageUrl ||
                        product.images?.[0]?.imageUrl ||
                        'https://via.placeholder.com/400x400?text=No+Image';

                      return (
                        <div
                          key={product.id}
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="flex gap-4 p-4">
                            <img src={image} alt={product.title} className="w-24 h-24 object-cover rounded-lg" />
                            <div className="flex-1">
                              <h3 className="text-sm mb-2">{product.title}</h3>
                              <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-lg text-blue-600">{Number(product.price).toLocaleString('vi-VN')}d</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addToCart(toCartProduct(product, storeOwner));
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
                      );
                    })}
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
                    <p className="text-gray-700">{storeOwner.bio || 'Chưa có mô tả'}</p>
                  </div>
                  {storeOwner.phone && (
                    <div>
                      <h3 className="text-sm text-gray-500 mb-2">Số điện thoại</h3>
                      <p className="text-gray-700">{storeOwner.phone}</p>
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
        </>
      )}
    </PageLayout>
  );
}
