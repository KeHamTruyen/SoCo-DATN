import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Eye,
  Loader2,
  RefreshCcw,
  Search,
  Send,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PageLayout } from './Layout/PageLayout';
import productService, { type Product } from '../services/product.service';
import scheduledPostService, {
  type ScheduledPost,
  type ScheduledPostCounts,
  type ScheduledPostStatus
} from '../services/scheduled-post.service';

const createDefaultScheduledTime = () => {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  date.setMinutes(0, 0, 0);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const emptyCounts: ScheduledPostCounts = {
  all: 0,
  scheduled: 0,
  published: 0,
  failed: 0
};

const statusLabels: Record<'all' | ScheduledPostStatus, string> = {
  all: 'Tất cả',
  scheduled: 'Đã lên lịch',
  published: 'Đã đăng',
  failed: 'Lỗi đăng bài'
};

const statusClasses: Record<ScheduledPostStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700'
};

const parseMediaUrls = (value: string) => {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const toStartOfDayIso = (value: string) => {
  return value ? new Date(`${value}T00:00:00`).toISOString() : undefined;
};

const toEndOfDayIso = (value: string) => {
  return value ? new Date(`${value}T23:59:59.999`).toISOString() : undefined;
};

export function SchedulePostsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canAttachProducts = user?.role === 'SELLER' || user?.role === 'ADMIN';

  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [counts, setCounts] = useState<ScheduledPostCounts>(emptyCounts);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionPostId, setActionPostId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [previewPostId, setPreviewPostId] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    status: 'all' as 'all' | ScheduledPostStatus,
    sortOrder: 'asc' as 'asc' | 'desc',
    search: '',
    startDate: '',
    endDate: ''
  });

  const [form, setForm] = useState({
    content: '',
    mediaUrlsText: '',
    productId: '',
    scheduledTime: createDefaultScheduledTime(),
    timezone: 'Asia/Ho_Chi_Minh'
  });

  const activeFilterCount = useMemo(() => {
    return [filters.status !== 'all', !!filters.search.trim(), !!filters.startDate, !!filters.endDate].filter(Boolean).length;
  }, [filters]);

  const loadScheduledPosts = async () => {
    const response = await scheduledPostService.getMyScheduledPosts({
      page: 1,
      limit: 50,
      status: filters.status,
      sortOrder: filters.sortOrder,
      search: filters.search.trim() || undefined,
      startDate: toStartOfDayIso(filters.startDate),
      endDate: toEndOfDayIso(filters.endDate)
    });

    setScheduledPosts(response.data || []);
    setCounts(response.counts || emptyCounts);
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage('');
        await loadScheduledPosts();
      } catch (error: any) {
        setErrorMessage(error?.response?.data?.message || 'Không thể tải danh sách bài viết đã lên lịch');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, filters]);

  useEffect(() => {
    if (!user || !canAttachProducts) {
      return;
    }

    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const response = await productService.getMyProducts({ page: 1, limit: 100, status: 'ACTIVE' });
        if (response.success) {
          setProducts(response.data || []);
        }
      } catch (error: any) {
        setErrorMessage(error?.response?.data?.message || 'Không thể tải danh sách sản phẩm để gắn vào bài viết');
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, [user, canAttachProducts]);

  const resetForm = () => {
    setForm({
      content: '',
      mediaUrlsText: '',
      productId: '',
      scheduledTime: createDefaultScheduledTime(),
      timezone: 'Asia/Ho_Chi_Minh'
    });
  };

  const handleCreateScheduledPost = async (event: React.FormEvent) => {
    event.preventDefault();

    const content = form.content.trim();
    if (!content) {
      setErrorMessage('Vui lòng nhập nội dung bài viết');
      setSuccessMessage('');
      return;
    }

    const scheduledTime = new Date(form.scheduledTime);
    if (Number.isNaN(scheduledTime.getTime()) || scheduledTime.getTime() <= Date.now()) {
      setErrorMessage('Thời gian đăng phải ở trong tương lai');
      setSuccessMessage('');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      const mediaUrls = parseMediaUrls(form.mediaUrlsText);
      const mediaType = mediaUrls.length > 0 ? 'IMAGE' : 'NONE';

      await scheduledPostService.createScheduledPost({
        content,
        mediaUrls,
        mediaType,
        productId: form.productId || undefined,
        scheduledTime: scheduledTime.toISOString(),
        timezone: form.timezone.trim() || 'Asia/Ho_Chi_Minh'
      });

      resetForm();
      setSuccessMessage('Đã tạo bài viết hẹn giờ thành công');
      await loadScheduledPosts();
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Không thể tạo bài viết hẹn giờ');
      setSuccessMessage('');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishNow = async (postId: string) => {
    try {
      setActionPostId(postId);
      setErrorMessage('');
      setSuccessMessage('');

      await scheduledPostService.publishNow(postId);
      setSuccessMessage('Bài viết đã được đăng ngay');
      await loadScheduledPosts();
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Không thể đăng bài ngay lúc này');
      setSuccessMessage('');
    } finally {
      setActionPostId(null);
    }
  };

  const handleDeleteScheduledPost = async (postId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa lịch đăng bài này?')) {
      return;
    }

    try {
      setActionPostId(postId);
      setErrorMessage('');
      setSuccessMessage('');
      const removedPost = scheduledPosts.find((post) => post.id === postId);

      await scheduledPostService.deleteScheduledPost(postId);
      setScheduledPosts((prev) => prev.filter((post) => post.id !== postId));
      setCounts((prev) => ({
        ...prev,
        all: Math.max(prev.all - 1, 0),
        scheduled: removedPost?.status === 'scheduled' ? Math.max(prev.scheduled - 1, 0) : prev.scheduled,
        published: removedPost?.status === 'published' ? Math.max(prev.published - 1, 0) : prev.published,
        failed: removedPost?.status === 'failed' ? Math.max(prev.failed - 1, 0) : prev.failed
      }));
      setSuccessMessage('Đã xóa lịch đăng bài');
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Không thể xóa lịch đăng bài');
      setSuccessMessage('');
    } finally {
      setActionPostId(null);
    }
  };

  if (!user) {
    return (
      <PageLayout activePage="home" headerTitle="Bài viết hẹn giờ">
        <div className="py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout activePage="home" headerTitle="Bài viết hẹn giờ">
      <div className="space-y-6">
        <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl">Hẹn giờ đăng bài</h1>
                <p className="text-sm text-gray-500 mt-1">Tạo bài viết trước và để hệ thống tự đăng đúng thời điểm.</p>
              </div>
              <button
                onClick={() => navigate('/home')}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
              >
                Về trang chủ
              </button>
            </div>

            {errorMessage ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{successMessage}</span>
              </div>
            ) : null}

            <form onSubmit={handleCreateScheduledPost} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Nội dung bài viết</label>
                <textarea
                  value={form.content}
                  onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                  rows={5}
                  placeholder="Bạn muốn đăng gì vào thời điểm này?"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Danh sách media URL</label>
                <textarea
                  value={form.mediaUrlsText}
                  onChange={(event) => setForm((prev) => ({ ...prev, mediaUrlsText: event.target.value }))}
                  rows={3}
                  placeholder="Mỗi dòng một URL ảnh hoặc video"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Thời gian đăng</label>
                  <input
                    type="datetime-local"
                    value={form.scheduledTime}
                    onChange={(event) => setForm((prev) => ({ ...prev, scheduledTime: event.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Múi giờ</label>
                  <input
                    type="text"
                    value={form.timezone}
                    onChange={(event) => setForm((prev) => ({ ...prev, timezone: event.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>

              {canAttachProducts ? (
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Gắn sản phẩm</label>
                  <select
                    value={form.productId}
                    onChange={(event) => setForm((prev) => ({ ...prev, productId: event.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
                    disabled={productsLoading}
                  >
                    <option value="">Không gắn sản phẩm</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.title}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-3 pt-2">
                <p className="text-xs text-gray-500">Nếu thời gian đã qua, hệ thống sẽ từ chối tạo lịch mới. Dùng nút đăng ngay để xuất bản thủ công.</p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-inline-icon inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Tạo lịch đăng
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-2">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-sm text-gray-500">Tổng lịch đăng</p>
              <p className="text-3xl mt-3">{counts.all}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-sm text-gray-500">Đang chờ</p>
              <p className="text-3xl mt-3 text-blue-600">{counts.scheduled}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-sm text-gray-500">Đã đăng</p>
              <p className="text-3xl mt-3 text-green-600">{counts.published}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-sm text-gray-500">Thất bại</p>
              <p className="text-3xl mt-3 text-red-600">{counts.failed}</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-1">
              <div className="xl:col-span-2">
                <label className="block text-sm text-gray-700 mb-2">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                    placeholder="Tìm theo nội dung bài viết"
                    className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Trạng thái</label>
                <select
                  value={filters.status}
                  onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value as 'all' | ScheduledPostStatus }))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
                >
                  <option value="all">Tất cả ({counts.all})</option>
                  <option value="scheduled">Đã lên lịch ({counts.scheduled})</option>
                  <option value="published">Đã đăng ({counts.published})</option>
                  <option value="failed">Lỗi đăng bài ({counts.failed})</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Sắp xếp</label>
                <select
                  value={filters.sortOrder}
                  onChange={(event) => setFilters((prev) => ({ ...prev, sortOrder: event.target.value as 'asc' | 'desc' }))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
                >
                  <option value="asc">Sớm nhất trước</option>
                  <option value="desc">Muộn nhất trước</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 lg:w-auto">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Từ ngày</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(event) => setFilters((prev) => ({ ...prev, startDate: event.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Đến ngày</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(event) => setFilters((prev) => ({ ...prev, endDate: event.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4 text-sm text-gray-500">
            <span>
              {loading ? 'Đang tải dữ liệu...' : `Hiển thị ${scheduledPosts.length} bài viết${activeFilterCount > 0 ? ` với ${activeFilterCount} bộ lọc` : ''}`}
            </span>
            {activeFilterCount > 0 ? (
              <button
                onClick={() => setFilters({ status: 'all', sortOrder: 'asc', search: '', startDate: '', endDate: '' })}
                className="text-blue-600 hover:text-blue-700"
              >
                Xóa bộ lọc
              </button>
            ) : null}
          </div>
        </section>

        <section className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm p-16 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : scheduledPosts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg">Chưa có bài viết hẹn giờ phù hợp</h2>
              <p className="text-sm text-gray-500 mt-2">Tạo lịch mới hoặc thay đổi bộ lọc để xem thêm kết quả.</p>
            </div>
          ) : (
            scheduledPosts.map((post) => {
              const coverImage = post.mediaUrls[0] || post.product?.images?.[0]?.imageUrl || null;
              const isPreviewOpen = previewPostId === post.id;
              const isBusy = actionPostId === post.id;

              return (
                <article key={post.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-5">
                      {coverImage ? (
                        <div className="w-full lg:w-48 h-40 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                          <img src={coverImage} alt="Scheduled post media" className="w-full h-full object-cover" />
                        </div>
                      ) : null}

                      <div className="flex-1 min-w-0 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="space-y-2 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-3 py-1 rounded-full text-xs ${statusClasses[post.status]}`}>
                                {statusLabels[post.status]}
                              </span>
                              {post.product ? (
                                <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                  Sản phẩm: {post.product.title}
                                </span>
                              ) : null}
                            </div>
                            <p className="text-gray-800 whitespace-pre-wrap break-words line-clamp-3">{post.content || 'Bài viết không có nội dung'}</p>
                          </div>

                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => setPreviewPostId((prev) => (prev === post.id ? null : post.id))}
                              className="btn-inline-icon inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                            >
                              <Eye className="w-4 h-4" />
                              {isPreviewOpen ? 'Ẩn chi tiết' : 'Xem trước'}
                            </button>

                            {post.status !== 'published' ? (
                              <button
                                onClick={() => handlePublishNow(post.id)}
                                disabled={isBusy}
                                className="btn-inline-icon inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Đăng ngay
                              </button>
                            ) : post.publishedPostId ? (
                              <button
                                onClick={() => navigate(`/post/${post.publishedPostId}`)}
                                className="btn-inline-icon inline-flex items-center gap-2 rounded-lg border border-green-300 px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Xem bài đã đăng
                              </button>
                            ) : null}

                            <button
                              onClick={() => handleDeleteScheduledPost(post.id)}
                              disabled={isBusy}
                              className="btn-inline-icon inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-4 h-4" />
                              Xóa
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(post.scheduledTime).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock3 className="w-4 h-4" />
                            <span>{new Date(post.scheduledTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <RefreshCcw className="w-4 h-4" />
                            <span>{post.timezone}</span>
                          </div>
                        </div>

                        {isPreviewOpen ? (
                          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-3">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Nội dung đầy đủ</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{post.content || 'Bài viết không có nội dung.'}</p>
                            </div>

                            {post.mediaUrls.length > 0 ? (
                              <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Media URL</p>
                                <div className="space-y-2">
                                  {post.mediaUrls.map((mediaUrl) => (
                                    <a
                                      key={mediaUrl}
                                      href={mediaUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="block text-sm text-blue-600 break-all hover:text-blue-700"
                                    >
                                      {mediaUrl}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            ) : null}

                            {post.errorMessage ? (
                              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {post.errorMessage}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </PageLayout>
  );
}