import { Heart, MessageCircle, Share2, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  stock: number;
}

interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    isVerified: boolean;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  taggedProducts?: Product[];
}

interface PostWithProductsProps {
  post: Post;
  onLike: () => void;
}

export function PostWithProducts({ post, onLike }: PostWithProductsProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Author Info */}
      <div className="flex items-center justify-between p-4">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/store/${post.author.id}`);
          }}
        >
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium hover:text-blue-600">{post.author.name}</span>
              {post.author.isVerified && (
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-xs text-gray-500">{post.timestamp}</p>
          </div>
        </div>
        <button 
          onClick={(e) => e.stopPropagation()}
          className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Post Content */}
      <div 
        className="px-4 pb-3 cursor-pointer"
        onClick={() => navigate(`/posts/${post.id}`)}
      >
        <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
      </div>

      {/* Post Image */}
      {post.image && (
        <div 
          className="relative cursor-pointer"
          onClick={() => navigate(`/posts/${post.id}`)}
        >
          <img
            src={post.image}
            alt=""
            className="w-full h-auto"
          />
        </div>
      )}

      {/* Tagged Products Section */}
      {post.taggedProducts && post.taggedProducts.length > 0 && (
        <div className="mx-4 my-3 border border-gray-200 rounded-lg p-3 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900">
              {post.taggedProducts.length} sản phẩm trong bài viết
            </span>
          </div>

          {/* Products Grid */}
          <div className="space-y-2">
            {post.taggedProducts.map((product) => (
              <div
                key={product.id}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/product/${product.id}`);
                }}
                className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Product Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {product.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-base font-semibold text-blue-600">
                      {product.price.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">Còn {product.stock} sản phẩm</span>
                    <span className="text-xs text-green-600">• Giao hàng nhanh</span>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product as any);
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0 flex items-center gap-1.5 text-sm font-medium"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">Thêm</span>
                </button>
              </div>
            ))}
          </div>

          {/* View All Button (if more than 2 products) */}
          {post.taggedProducts.length > 2 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/posts/${post.id}`);
              }}
              className="w-full mt-2 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
            >
              Xem tất cả {post.taggedProducts.length} sản phẩm →
            </button>
          )}
        </div>
      )}

      {/* Interaction Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          className={`flex items-center gap-2 transition-colors ${
            post.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{post.likes}</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/posts/${post.id}`);
          }}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{post.comments}</span>
        </button>

        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium">{post.shares}</span>
        </button>
      </div>
    </div>
  );
}
