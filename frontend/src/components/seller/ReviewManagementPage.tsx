import { useState, useEffect } from 'react';
import { Star, Search, MessageSquare, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PageLayout } from '../Layout/PageLayout';
import { reviewService, type Review } from '../../services/review.service';
import toast from 'react-hot-toast';

export function ReviewManagementPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'responded' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user, filter, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const hasResponse = filter === 'all' ? undefined : filter === 'responded' ? 'true' : 'false';
      
      const result = await reviewService.getMyReviews({
        hasResponse,
        page: currentPage,
        limit: pageSize
      });

      if (result.success && result.data) {
        setReviews(result.data.reviews || []);
        setTotalReviews(result.data.total || 0);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải đánh giá');
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async (reviewId: string) => {
    if (!response.trim()) {
      toast.error('Vui lòng nhập phản hồi');
      return;
    }

    try {
      setSubmitting(true);
      const result = await reviewService.respondToReview(reviewId, { response: response.trim() });
      
      if (result.success) {
        toast.success('Phản hồi thành công');
        setRespondingTo(null);
        setResponse('');
        fetchReviews();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể gửi phản hồi');
      console.error('Error submitting response:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteResponse = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn xóa phản hồi này?')) {
      return;
    }

    try {
      const result = await reviewService.deleteResponse(reviewId);
      
      if (result.success) {
        toast.success('Đã xóa phản hồi');
        fetchReviews();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa phản hồi');
      console.error('Error deleting response:', error);
    }
  };

  const handleEditResponse = (review: Review) => {
    setRespondingTo(review.id);
    setResponse(review.sellerResponse || '');
  };

  if (!user) return null;

  const filteredReviews = reviews.filter(review => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      review.product?.name?.toLowerCase().includes(search) ||
      review.user?.username?.toLowerCase().includes(search) ||
      review.user?.fullName?.toLowerCase().includes(search) ||
      review.content?.toLowerCase().includes(search)
    );
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <PageLayout 
      activePage="seller-dashboard"
      showFooter={false}
      showMobileNav={false}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl">Quản lý đánh giá</h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setFilter('all');
                setCurrentPage(1);
              }}
              className={`flex-1 py-4 px-6 text-sm ${
                filter === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tất cả ({totalReviews})
            </button>
            <button
              onClick={() => {
                setFilter('pending');
                setCurrentPage(1);
              }}
              className={`flex-1 py-4 px-6 text-sm ${
                filter === 'pending'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Chưa phản hồi
            </button>
            <button
              onClick={() => {
                setFilter('responded');
                setCurrentPage(1);
              }}
              className={`flex-1 py-4 px-6 text-sm ${
                filter === 'responded'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Đã phản hồi
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo sản phẩm, khách hàng..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Chưa có đánh giá nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
                {/* Review Header */}
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={review.user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user?.username}`}
                    alt={review.user?.fullName || review.user?.username || 'User'}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="font-medium">{review.user?.fullName || review.user?.username}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                          {review.isVerifiedPurchase && (
                            <span className="text-xs text-green-600">✓ Đã mua hàng</span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={review.product?.images?.[0] || 'https://via.placeholder.com/150'}
                    alt={review.product?.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium">{review.product?.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(review.product?.price || 0)}
                    </p>
                  </div>
                </div>

                {/* Review Content */}
                {review.title && <p className="font-medium mb-2">{review.title}</p>}
                {review.content && <p className="text-gray-700 mb-3">{review.content}</p>}

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {review.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Review ${index + 1}`}
                        className="w-20 h-20 rounded object-cover"
                      />
                    ))}
                  </div>
                )}

                {/* Seller Response */}
                {review.sellerResponse && respondingTo !== review.id && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-blue-900">Phản hồi của người bán</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditResponse(review)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteResponse(review.id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{review.sellerResponse}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(review.sellerResponseAt!).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                )}

                {/* Response Form */}
                {(!review.sellerResponse || respondingTo === review.id) && (
                  <div className="mt-4">
                    {respondingTo === review.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          placeholder="Nhập phản hồi của bạn..."
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                          maxLength={1000}
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {response.length}/1000 ký tự
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setRespondingTo(null);
                                setResponse('');
                              }}
                              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={() => handleSubmitResponse(review.id)}
                              disabled={submitting || !response.trim()}
                              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                              <span>Gửi phản hồi</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setRespondingTo(review.id);
                          setResponse('');
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Phản hồi</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalReviews > 0 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
              Hiển thị {Math.min((currentPage - 1) * pageSize + 1, totalReviews)}-{Math.min(currentPage * pageSize, totalReviews)} trong tổng {totalReviews} đánh giá
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              {Array.from({ length: Math.ceil(totalReviews / pageSize) }, (_, i) => i + 1)
                .filter(page => {
                  const totalPages = Math.ceil(totalReviews / pageSize);
                  return page === 1 || 
                         page === totalPages || 
                         Math.abs(page - currentPage) <= 1;
                })
                .map((page, index, arr) => {
                  const showEllipsis = index > 0 && page - arr[index - 1] > 1;
                  return (
                    <div key={page} className="flex gap-2">
                      {showEllipsis && <span className="px-2 py-2 text-gray-400">...</span>}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}
              <button 
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalReviews / pageSize), p + 1))}
                disabled={currentPage >= Math.ceil(totalReviews / pageSize)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
