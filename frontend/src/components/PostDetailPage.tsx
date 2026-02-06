import { useState } from 'react';
import { Heart, MessageCircle, Share2, ShoppingBag, MoreVertical, Send, Smile, MapPin } from 'lucide-react';
import { User, Product } from '../App';
import { PageLayout } from './Layout';

interface PostDetailPageProps {
  postId: string;
  currentUser: User;
  onNavigate: (page: any, id?: string) => void;
  onAddToCart?: (product: Product) => void;
  onLogout: () => void;
}

interface PostComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: PostComment[];
}

export function PostDetailPage({ postId, currentUser, onNavigate, onAddToCart }: PostDetailPageProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(234);
  const [commentText, setCommentText] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [comments, setComments] = useState<PostComment[]>([
    {
      id: '1',
      userId: '2',
      userName: 'Trần Thị B',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      content: 'Bộ này đẹp quá! Bạn mua ở đâu thế?',
      timestamp: '2 giờ trước',
      likes: 12,
      isLiked: false,
      replies: [
        {
          id: '1-1',
          userId: '1',
          userName: 'Nguyễn Văn A',
          userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
          content: 'Mình mua ở shop trong link bên dưới nhé! Chất lượng tốt lắm',
          timestamp: '1 giờ trước',
          likes: 5,
          isLiked: false
        }
      ]
    },
    {
      id: '2',
      userId: '3',
      userName: 'Lê Văn C',
      userAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400',
      content: 'Giá cả hợp lý không bạn?',
      timestamp: '4 giờ trước',
      likes: 8,
      isLiked: false
    },
    {
      id: '3',
      userId: '4',
      userName: 'Phạm Thị D',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      content: 'Form dáng vừa vặn không bạn? Mình cao 1m6 nặng 50kg thì mặc size nào?',
      timestamp: '6 giờ trước',
      likes: 3,
      isLiked: true
    }
  ]);

  // Mock post data
  const post = {
    id: postId,
    author: {
      id: '1',
      name: 'Nguyễn Văn A',
      username: 'nguyenvana',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
      isVerified: true
    },
    content: 'Hôm nay mình nhận được bộ outfit mới và phải nói là quá hài lòng! Chất vải mềm mại, thiết kế tối giản nhưng rất sang trọng. Đặc biệt là màu sắc rất đẹp và dễ phối đồ. Mình đã tag các sản phẩm bên dưới cho các bạn dễ tham khảo nhé! 🔥✨\n\n#fashion #ootd #style #vietnamfashion',
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200'
    ],
    timestamp: '3 giờ trước',
    location: 'Hà Nội, Việt Nam'
  };

  // Tagged products
  const taggedProducts: Product[] = [
    {
      id: '1',
      sellerId: '1',
      sellerName: 'Shop Thời Trang A',
      sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      sellerUsername: 'shopthoitrang_a',
      title: 'Áo sơ mi trắng tay dài',
      price: 350000,
      image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400',
      description: 'Áo sơ mi trắng basic, chất vải cotton cao cấp',
      likes: 89,
      comments: 23,
      isLiked: false,
      createdAt: '2 ngày trước',
      category: 'Thời trang',
      stock: 50,
      variants: [
        { id: '1', name: 'Màu sắc', options: ['Trắng', 'Xanh nhạt', 'Hồng'] },
        { id: '2', name: 'Kích thước', options: ['S', 'M', 'L', 'XL'] }
      ]
    },
    {
      id: '2',
      sellerId: '2',
      sellerName: 'Shop Thời Trang B',
      sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      sellerUsername: 'shopthoitrang_b',
      title: 'Quần jeans ống rộng',
      price: 450000,
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400',
      description: 'Quần jeans ống rộng phong cách Hàn Quốc',
      likes: 124,
      comments: 34,
      isLiked: false,
      createdAt: '1 ngày trước',
      category: 'Thời trang',
      stock: 30,
      variants: [
        { id: '1', name: 'Màu sắc', options: ['Xanh đậm', 'Xanh nhạt', 'Đen'] },
        { id: '2', name: 'Kích thước', options: ['26', '27', '28', '29', '30'] }
      ]
    },
    {
      id: '3',
      sellerId: '3',
      sellerName: 'Shop Thời Trang C',
      sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      sellerUsername: 'shopthoitrang_c',
      title: 'Túi xách da cao cấp',
      price: 680000,
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
      description: 'Túi xách da PU cao cấp, thiết kế tối giản',
      likes: 156,
      comments: 45,
      isLiked: false,
      createdAt: '3 ngày trước',
      category: 'Phụ kiện',
      stock: 20,
      variants: [
        { id: '1', name: 'Màu sắc', options: ['Đen', 'Nâu', 'Be'] }
      ]
    }
  ];

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      const newComment: PostComment = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        content: commentText,
        timestamp: 'Vừa xong',
        likes: 0,
        isLiked: false
      };
      
      if (replyToId) {
        setComments(comments.map(comment => {
          if (comment.id === replyToId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newComment]
            };
          }
          return comment;
        }));
        setReplyToId(null);
      } else {
        setComments([newComment, ...comments]);
      }
      setCommentText('');
    }
  };

  const handleLikeComment = (commentId: string) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isLiked: !comment.isLiked,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
        };
      }
      return comment;
    }));
  };

  return (
    <PageLayout
      currentUser={currentUser}
      onNavigate={onNavigate}
      onLogout={onLogout}
      cartItemCount={0}
      activePage="post-detail"
      showFooter={true}
      showMobileNav={true}
    >
      <div className="max-w-5xl mx-auto">
        {/* Post Content */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          {/* Author Info */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full cursor-pointer"
                  onClick={() => onNavigate('profile')}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="cursor-pointer hover:underline" onClick={() => onNavigate('profile')}>
                      {post.author.name}
                    </span>
                    {post.author.isVerified && (
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{post.timestamp}</span>
                    {post.location && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{post.location}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Post Text Content */}
          <div className="px-6 pt-4 pb-4">
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{post.content}</p>
          </div>

          {/* Post Images */}
          {post.images && post.images.length > 0 && (
            <div>
              {/* Main Image */}
              <div className="relative bg-black">
                <img
                  src={post.images[selectedImage]}
                  alt={`Post image ${selectedImage + 1}`}
                  className="w-full h-auto max-h-[600px] object-contain mx-auto"
                />
                {post.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : post.images.length - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setSelectedImage(selectedImage < post.images.length - 1 ? selectedImage + 1 : 0)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {post.images.length > 1 && (
                <div className="flex gap-2 p-4 bg-gray-50 overflow-x-auto">
                  {post.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index ? 'border-blue-600 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Interaction Bar */}
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
                >
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                  <span className="text-sm">{likes}</span>
                </button>
                <div className="flex items-center gap-2 text-gray-600">
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-sm">{comments.length}</span>
                </div>
              </div>
              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors">
                <Share2 className="w-6 h-6" />
                <span className="text-sm">Chia sẻ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tagged Products */}
        {taggedProducts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg">Sản phẩm được gắn thẻ</h3>
              <span className="text-sm text-gray-500">({taggedProducts.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {taggedProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => onNavigate('product-detail', product.id)}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="text-sm mb-2 line-clamp-2 min-h-[40px]">{product.title}</h4>
                    <p className="text-lg text-blue-600 mb-3">{product.price.toLocaleString('vi-VN')}đ</p>
                    <div className="flex items-center gap-2 mb-3">
                      <img
                        src={product.sellerAvatar}
                        alt={product.sellerName}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-xs text-gray-600 truncate">{product.sellerName}</span>
                    </div>
                    {onAddToCart && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product);
                        }}
                        className="w-full py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Thêm vào giỏ
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg mb-5">Bình luận ({comments.length})</h3>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="mb-6">
            <div className="flex gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                {replyToId && (
                  <div className="mb-2 text-sm text-gray-500">
                    Đang trả lời...{' '}
                    <button
                      type="button"
                      onClick={() => setReplyToId(null)}
                      className="text-blue-600 hover:underline"
                    >
                      Hủy
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Viết bình luận..."
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                  <button
                    type="button"
                    className="p-2.5 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Smile className="w-5 h-5 text-gray-400" />
                  </button>
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-5">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                <div className="flex gap-3">
                  <img
                    src={comment.userAvatar}
                    alt={comment.userName}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-2xl px-4 py-3 inline-block max-w-full">
                      <p className="text-sm mb-1">{comment.userName}</p>
                      <p className="text-gray-700 break-words">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 ml-4 text-xs text-gray-500">
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className={`hover:underline ${comment.isLiked ? 'text-blue-600' : ''}`}
                      >
                        {comment.isLiked ? 'Đã thích' : 'Thích'} {comment.likes > 0 && `(${comment.likes})`}
                      </button>
                      <button
                        onClick={() => setReplyToId(comment.id)}
                        className="hover:underline"
                      >
                        Trả lời
                      </button>
                      <span>{comment.timestamp}</span>
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <img
                              src={reply.userAvatar}
                              alt={reply.userName}
                              className="w-8 h-8 rounded-full flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="bg-gray-50 rounded-2xl px-4 py-3 inline-block max-w-full">
                                <p className="text-sm mb-1">{reply.userName}</p>
                                <p className="text-sm text-gray-700 break-words">{reply.content}</p>
                              </div>
                              <div className="flex items-center gap-4 mt-2 ml-4 text-xs text-gray-500">
                                <button className="hover:underline">
                                  Thích {reply.likes > 0 && `(${reply.likes})`}
                                </button>
                                <span>{reply.timestamp}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
