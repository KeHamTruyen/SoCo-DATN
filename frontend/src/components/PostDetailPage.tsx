import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, ShoppingBag, MoreVertical, Send, Smile, Loader2, ArrowLeft } from 'lucide-react';
import { PageLayout } from './Layout';
import { useAuth } from '../contexts/AuthContext';
import * as postService from '../services/post.service';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export function PostDetailPage() {
  const { id: postId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost] = useState<postService.Post | null>(null);
  const [comments, setComments] = useState<postService.PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);

  if (!user || !postId) return null;

  // Format time helper
  const formatTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true,
      locale: vi 
    });
  };

  // Load post detail
  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await postService.getPost(postId);
        setPost(response.data.post);
      } catch (err: any) {
        console.error('Error loading post:', err);
        setError(err.response?.data?.message || 'Không thể tải bài viết');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      try {
        setCommentsLoading(true);
        const response = await postService.getComments(postId, page, 20);
        setComments(response.data);
        setHasMoreComments(response.pagination.currentPage < response.pagination.totalPages);
      } catch (err: any) {
        console.error('Error loading comments:', err);
      } finally {
        setCommentsLoading(false);
      }
    };

    loadComments();
  }, [postId, page]);

  // Handle like/unlike
  const handleLike = async () => {
    if (!post) return;
    
    // Optimistic update
    const wasLiked = post.isLiked;
    const prevLikesCount = post.likesCount;
    
    setPost({
      ...post,
      isLiked: !wasLiked,
      likesCount: wasLiked ? prevLikesCount - 1 : prevLikesCount + 1
    });

    try {
      await postService.toggleLike(postId);
    } catch (err) {
      // Revert on error
      setPost({
        ...post,
        isLiked: wasLiked,
        likesCount: prevLikesCount
      });
      console.error('Error toggling like:', err);
    }
  };

  // Handle add comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;

    try {
      setSubmittingComment(true);
      const response = await postService.addComment(postId, commentText, replyToId || undefined);
      const newComment = response.data.comment;
      
      if (replyToId) {
        // Add reply to parent comment
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
        // Add new top-level comment
        setComments([newComment, ...comments]);
      }
      
      // Update post comments count
      if (post) {
        setPost({
          ...post,
          commentsCount: post.commentsCount + 1
        });
      }
      
      setCommentText('');
    } catch (err: any) {
      console.error('Error adding comment:', err);
      alert(err.response?.data?.message || 'Không thể đăng bình luận');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <PageLayout activePage="post-detail">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </PageLayout>
    );
  }

  // Error state
  if (error || !post) {
    return (
      <PageLayout activePage="post-detail">
        <div className="max-w-2xl mx-auto py-20 text-center">
          <p className="text-gray-600 mb-4">{error || 'Không tìm thấy bài viết'}</p>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:underline"
          >
            Quay về trang chủ
          </button>
        </div>
      </PageLayout>
    );
  }
  return (
    <PageLayout activePage="post-detail">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </button>

        {/* Post Content */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          {/* Author Info */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={post.author.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.fullName || post.author.username)}`}
                  alt={post.author.fullName || post.author.username}
                  className="w-12 h-12 rounded-full cursor-pointer object-cover"
                  onClick={() => navigate(`/profile/${post.author.username}`)}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="cursor-pointer hover:underline font-medium"
                      onClick={() => navigate(`/profile/${post.author.username}`)}
                    >
                      {post.author.fullName || post.author.username}
                    </span>
                    {post.author.isVerified && (
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{formatTime(post.createdAt)}</span>
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
          {post.mediaUrls && post.mediaUrls.length > 0 && (
            <div>
              {/* Main Image */}
              <div className="relative bg-black">
                <img
                  src={post.mediaUrls[selectedImage]}
                  alt={`Post image ${selectedImage + 1}`}
                  className="w-full h-auto max-h-[600px] object-contain mx-auto"
                />
                {post.mediaUrls.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : post.mediaUrls.length - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setSelectedImage(selectedImage < post.mediaUrls.length - 1 ? selectedImage + 1 : 0)}
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
              {post.mediaUrls.length > 1 && (
                <div className="flex gap-2 p-4 bg-gray-50 overflow-x-auto">
                  {post.mediaUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index ? 'border-blue-600 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={url}
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
                  <Heart className={`w-6 h-6 ${post.isLiked ? 'fill-current text-red-500' : ''}`} />
                  <span className="text-sm">{post.likesCount}</span>
                </button>
                <div className="flex items-center gap-2 text-gray-600">
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-sm">{post.commentsCount}</span>
                </div>
              </div>
              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors">
                <Share2 className="w-6 h-6" />
                <span className="text-sm">Chia sẻ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tagged Product */}
        {post.product && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Sản phẩm được gắn thẻ</h3>
            </div>
            <div
              onClick={() => navigate(`/product/${post.product!.slug || post.product!.id}`)}
              className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex gap-4 p-4">
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={post.product.images?.[0]?.imageUrl || post.product.images?.[0]?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.product.title || post.product.name || '')}&background=E5E7EB&color=374151`}
                    alt={post.product.title || post.product.name || ''}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-medium mb-2 line-clamp-2">{post.product.title || post.product.name}</h4>
                  <p className="text-2xl font-semibold text-blue-600 mb-3">
                    {post.product.price.toLocaleString('vi-VN')}đ
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <img
                      src={post.product.seller.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.product.seller.fullName)}`}
                      alt={post.product.seller.fullName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-sm text-gray-600 truncate">{post.product.seller.fullName}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // addToCart logic would go here
                      alert('Thêm vào giỏ hàng thành công!');
                    }}
                    className="px-6 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-5">Bình luận ({post.commentsCount})</h3>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="mb-6">
            <div className="flex gap-3">
              <img
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}`}
                alt={user.fullName}
                className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
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
                    disabled={submittingComment}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    className="p-2.5 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Smile className="w-5 h-5 text-gray-400" />
                  </button>
                  <button
                    type="submit"
                    disabled={!commentText.trim() || submittingComment}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submittingComment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Comments List */}
          {commentsLoading && comments.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Chưa có bình luận nào</p>
          ) : (
            <div className="space-y-5">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-3">
                  <div className="flex gap-3">
                    <img
                      src={comment.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.fullName)}`}
                      alt={comment.user.fullName}
                      className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 rounded-2xl px-4 py-3 inline-block max-w-full">
                        <p className="text-sm font-medium mb-1">{comment.user.fullName || comment.user.username}</p>
                        <p className="text-gray-700 break-words">{comment.content}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2 ml-4 text-xs text-gray-500">
                        <button
                          onClick={() => setReplyToId(comment.id)}
                          className="hover:underline"
                        >
                          Trả lời
                        </button>
                        <span>{formatTime(comment.createdAt)}</span>
                      </div>

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                              <img
                                src={reply.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.user.fullName)}`}
                                alt={reply.user.fullName}
                                className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="bg-gray-50 rounded-2xl px-4 py-3 inline-block max-w-full">
                                  <p className="text-sm font-medium mb-1">{reply.user.fullName || reply.user.username}</p>
                                  <p className="text-sm text-gray-700 break-words">{reply.content}</p>
                                </div>
                                <div className="flex items-center gap-4 mt-2 ml-4 text-xs text-gray-500">
                                  <span>{formatTime(reply.createdAt)}</span>
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

              {/* Load More Comments */}
              {hasMoreComments && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={commentsLoading}
                    className="text-blue-600 hover:underline disabled:opacity-50"
                  >
                    {commentsLoading ? 'Đang tải...' : 'Xem thêm bình luận'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
