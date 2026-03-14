import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Search,
  Users,
  Package,
  User as UserIcon,
  ShoppingCart,
  Store,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import productService, { type Product as ApiProduct } from '../services/product.service';
import userService, { type UserProfile } from '../services/user.service';
import type { Product as CartProduct } from '../App';

type SearchTab = 'all' | 'products' | 'shops' | 'users' | 'groups';

interface GroupResult {
  id: string;
  name: string;
  description: string;
  members: number;
  privacy: 'public' | 'private';
}

const GROUP_SEED: GroupResult[] = [
  {
    id: 'g1',
    name: 'Cộng đồng thời trang Việt Nam',
    description: 'Nơi chia sẻ xu hướng thời trang và review shop uy tín.',
    members: 12540,
    privacy: 'public'
  },
  {
    id: 'g2',
    name: 'Săn sale đồ công nghệ',
    description: 'Cập nhật deal ngon và review sản phẩm công nghệ.',
    members: 8920,
    privacy: 'private'
  },
  {
    id: 'g3',
    name: 'Review sản phẩm chân thật',
    description: 'Đánh giá sản phẩm được kiểm chứng bởi cộng đồng.',
    members: 15300,
    privacy: 'public'
  }
];

function toCartProduct(product: ApiProduct): CartProduct {
  const image =
    product.images?.find((img) => img.isPrimary)?.imageUrl ||
    product.images?.[0]?.imageUrl ||
    'https://via.placeholder.com/400x400?text=No+Image';

  return {
    id: product.id,
    sellerId: product.seller?.id || '',
    sellerName: product.seller?.fullName || 'Unknown Seller',
    sellerAvatar: product.seller?.avatarUrl || '',
    sellerUsername: product.seller?.username || '',
    title: product.title,
    price: Number(product.price),
    image,
    description: product.description || '',
    likes: product.likesCount || 0,
    comments: product.commentsCount || 0,
    isLiked: false,
    createdAt: product.createdAt,
    category: product.category?.name || 'Khac',
    stock: product.stockQuantity || 0
  };
}

export function SearchResultsPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQ = (searchParams.get('q') || '').trim();

  const [query, setQuery] = useState(initialQ);
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const q = (searchParams.get('q') || '').trim();
    setQuery(q);
  }, [searchParams]);

  useEffect(() => {
    const q = query.trim();

    if (!q) {
      setProducts([]);
      setUsers([]);
      setErrorMessage('');
      return;
    }

    const run = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const [productRes, userRes] = await Promise.all([
          productService.getProducts({
            search: q,
            status: 'ACTIVE',
            page: 1,
            limit: 30,
            sortBy: 'createdAt',
            sortOrder: 'desc'
          }),
          userService.searchUsers({
            q,
            limit: 30
          })
        ]);

        const productList = Array.isArray(productRes.data)
          ? productRes.data
          : productRes.data?.products || [];

        setProducts(productList);
        setUsers(userRes.data || []);
      } catch (error: any) {
        setErrorMessage(error?.response?.data?.message || 'Không thể tải kết quả tìm kiếm');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [query]);

  const sellerUsers = useMemo(() => users.filter((u) => u.role === 'SELLER'), [users]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return GROUP_SEED.filter(
      (g) => g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q)
    );
  }, [query]);

  const counts = {
    products: products.length,
    shops: sellerUsers.length,
    users: users.length,
    groups: groups.length
  };

  const totalCount = counts.products + counts.shops + counts.users + counts.groups;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setSearchParams(q ? { q } : {});
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => navigate('/home')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-3xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm, người dùng, shop, nhóm..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  autoFocus
                />
              </div>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {query ? (
          <p className="text-gray-600 mb-4">
            Tìm thấy <strong>{totalCount}</strong> kết quả cho "{query}"
          </p>
        ) : (
          <p className="text-gray-600 mb-4">Nhập từ khóa để tìm sản phẩm, shop, người dùng, nhóm</p>
        )}

        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { key: 'all', label: 'Tất cả', icon: Search, count: totalCount },
              { key: 'products', label: 'Sản phẩm', icon: Package, count: counts.products },
              { key: 'shops', label: 'Shop', icon: Store, count: counts.shops },
              { key: 'users', label: 'Người dùng', icon: UserIcon, count: counts.users },
              { key: 'groups', label: 'Nhóm', icon: Users, count: counts.groups }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as SearchTab)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm whitespace-nowrap transition-colors ${
                    isActive ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : errorMessage ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-gray-700">{errorMessage}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {(activeTab === 'all' || activeTab === 'products') && products.length > 0 && (
              <section>
                {activeTab === 'all' && <h3 className="text-lg mb-3">Sản phẩm</h3>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => {
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
                        <div className="aspect-square">
                          <img src={image} alt={product.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <h4 className="text-sm mb-1 line-clamp-1">{product.title}</h4>
                          <p className="text-lg text-blue-600 mb-2">{Number(product.price).toLocaleString('vi-VN')}d</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                            <img
                              src={product.seller?.avatarUrl || 'https://ui-avatars.com/api/?name=Shop'}
                              alt={product.seller?.fullName || 'Shop'}
                              className="w-5 h-5 rounded-full"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/store/${product.seller?.username}`);
                              }}
                              className="hover:text-blue-600"
                            >
                              {product.seller?.fullName || 'Unknown shop'}
                            </button>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(toCartProduct(product));
                            }}
                            className="w-full py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                          >
                            <ShoppingCart className="w-4 h-4 inline mr-1" />
                            Thêm vào giỏ
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'shops') && sellerUsers.length > 0 && (
              <section>
                {activeTab === 'all' && <h3 className="text-lg mb-3">Shop</h3>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sellerUsers.map((u) => (
                    <div key={`shop-${u.id}`} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <img
                          src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}`}
                          alt={u.fullName}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{u.fullName}</p>
                          <p className="text-xs text-gray-500">@{u.username}</p>
                          <p className="text-xs text-gray-500 mt-1">{u._count?.products || 0} sản phẩm</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/store/${u.username}`)}
                        className="w-full mt-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        Xem cửa hàng
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'users') && users.length > 0 && (
              <section>
                {activeTab === 'all' && <h3 className="text-lg mb-3">Người dùng</h3>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((u) => (
                    <div key={`user-${u.id}`} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <img
                          src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}`}
                          alt={u.fullName}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{u.fullName}</p>
                          <p className="text-xs text-gray-500">@{u.username}</p>
                          <p className="text-xs text-gray-500 mt-1">{u.bio || 'Chưa có mô tả'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/profile/${u.username}`)}
                        className="w-full mt-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        Xem hồ sơ
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'groups') && groups.length > 0 && (
              <section>
                {activeTab === 'all' && <h3 className="text-lg mb-3">Nhóm</h3>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groups.map((g) => (
                    <div key={g.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                      <h4 className="text-base mb-1">{g.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{g.description}</p>
                      <div className="text-xs text-gray-500 mb-3">
                        {g.members.toLocaleString('vi-VN')} thành viên • {g.privacy === 'public' ? 'Công khai' : 'Riêng tư'}
                      </div>
                      <button
                        onClick={() => navigate('/groups')}
                        className="w-full py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        Mở trang nhóm
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!query.trim() && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
                Nhập từ khóa để bắt đầu tìm kiếm.
              </div>
            )}

            {query.trim() && !loading && !errorMessage && totalCount === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
                Không tìm thấy kết quả phù hợp.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
