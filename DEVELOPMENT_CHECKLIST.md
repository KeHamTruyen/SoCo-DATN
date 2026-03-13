# 📋 Development Checklist - Social Commerce Platform

## 🎯 Tổng quan tiến độ

### 🧾 Module 3 (Buyer/Seller) - Trạng thái theo UC (cập nhật theo code hiện tại)

- [~] UC3.1 Tìm kiếm sản phẩm: Đã có API filter ở `/api/products` + MarketplacePage tích hợp thật; `SearchResultsPage` vẫn dùng mock.
- [x] UC3.2 Xem chi tiết sản phẩm: Đã có API + ProductDetailPage và đã nối đọc/ghi review qua API.
- [~] UC3.3 Thêm sản phẩm vào giỏ hàng: Đã có API `/api/cart/items` và luồng thêm từ Marketplace/ProductDetail; biến thể chưa đồng nhất hoàn toàn giữa các màn.
- [x] UC3.4 Quản lý giỏ hàng: Đầy đủ xem/cập nhật số lượng/xóa/xóa toàn bộ.
- [x] UC3.5 Thực hiện thanh toán: Đã có checkout + tạo đơn + mock confirm payment (COD).
- [x] UC3.6 Theo dõi trạng thái đơn hàng: Đã có route `/orders`, `/orders/:orderId` + API + timeline trạng thái.
- [~] UC3.7 Đánh giá và xếp hạng sản phẩm/người bán: Đã có API buyer tạo review và API đọc review sản phẩm; chưa có module xếp hạng seller độc lập.
- [~] UC3.8 Quản lý sản phẩm Seller: Đã nối API list/delete thật cho `ProductManagementPage`; luồng sửa sản phẩm vẫn cần hoàn thiện UI riêng.
- [x] UC3.9 Dashboard hiệu suất Seller: Đã sửa backend stats theo schema hiện tại và FE đọc API thật.
- [x] UC3.10 Quản lý đơn hàng Seller: Đã có API `/api/orders/my/sales` + cập nhật trạng thái + FE tích hợp.
- [x] UC3.11 Xử lý hoàn tiền (giả lập): Đã cho phép transition `COMPLETED -> REFUNDED`.
- [x] UC3.12 Phản hồi đánh giá Buyer: Đã có route/controller/service + FE và đã đồng bộ field `avatarUrl`.

### ✅ Đã hoàn thành (Phase 1, 2, 3 & 4)

- Backend Auth API
- Backend Product API
- Backend Category API
- Backend Posts & Social Feed API
- Backend Cart & Order APIs
- Backend Notifications API (with real-time Socket.IO)
- Frontend Auth pages
- Frontend Layout components
- Frontend Seller pages migration
- Frontend Product pages migration
- Frontend Posts & Social Feed
- Frontend Shopping flow (Cart & Orders)
- Frontend Notifications (real-time)

### ⏳ Đang thực hiện

- Backend Messaging optimization
- Frontend Messaging improvements

---

## 🔐 1. AUTHENTICATION & USER (✅ Hoàn thành)

### Backend

- [x] User model (Prisma schema)
- [x] Auth routes (`/api/auth/*`)
- [x] Register endpoint
- [x] Login endpoint
- [x] Logout endpoint
- [x] Get profile endpoint
- [x] Update profile endpoint
- [x] Change password endpoint
- [x] JWT authentication middleware
- [x] Password hashing (bcrypt)
- [x] CORS configuration

### Frontend

- [x] AuthContext với hooks
- [x] LoginPage
- [x] RegisterPage
- [x] ForgotPasswordPage
- [x] ProtectedRoute guard
- [x] RoleRoute guard
- [x] PublicRoute wrapper
- [x] Auth service (api.ts)

---

## 🛍️ 2. PRODUCTS & CATEGORIES (✅ Hoàn thành Phase 1)

### Backend

- [x] Product model (Prisma schema)
- [x] Category model (Prisma schema)
- [x] ProductImage model
- [x] ProductVariant model
- [x] Product service (`product.service.js`)
- [x] Product controller (`product.controller.js`)
- [x] Product routes (`/api/products/*`)
- [x] Product validators
- [x] Category service
- [x] Category controller
- [x] Category routes (`/api/categories/*`)
- [x] Slugify integration
- [ ] **TODO: Upload middleware cho product images**
- [ ] **TODO: Image optimization/resize**
- [ ] **TODO: Cloud storage integration (AWS S3/Cloudinary)**

### Frontend

- [x] Product service (`product.service.ts`)
- [x] Category service (`category.service.ts`)
- [x] ProductDetailPage - migrated to hooks + API
- [x] AddProductPage - migrated to hooks + API
- [x] ProductManagementPage - migrated to hooks
- [x] CreateProductModal - migrated to hooks
- [x] SellerDashboard - migrated to hooks
- [ ] **TODO: Tích hợp API thật vào ProductManagementPage (hiện dùng mock)**
- [ ] **TODO: Image upload component**
- [ ] **TODO: Rich text editor cho product description**
- [ ] **TODO: Product search & filters thực tế**
- [ ] **TODO: Pagination cho product list**

---

## 🛒 3. SHOPPING CART & CHECKOUT (✅ Hoàn thành 100% - Phase 2)

### Backend

- [x] Cart model (Prisma schema)
- [x] CartItem model (Prisma schema)
- [x] Cart service (cart.service.js)
  - [x] Add item to cart
  - [x] Update cart item quantity
  - [x] Remove item from cart
  - [x] Get user cart
  - [x] Clear cart
- [x] Cart controller (cart.controller.js)
- [x] Cart routes (`/api/cart/*`)
- [x] Cart validators (cart.validator.js)

### Frontend

- [x] cart.service.ts - TypeScript API client
- [x] CartPage - Full API integration
- [x] CheckoutPage - Mock payment (COD)
- [x] Shipping address form
- [x] Order summary component

---

## 📦 4. ORDERS & ORDER MANAGEMENT (✅ Hoàn thành 100% - Phase 2)

### Backend

- [x] Order model (Prisma schema)
- [x] OrderItem model (Prisma schema)
- [x] Order service (order.service.js)
  - [x] Create order from cart
  - [x] Get order by ID
  - [x] Get user orders (buyer)
  - [x] Get seller orders
  - [x] Update order status
  - [x] Cancel order
  - [x] Mock payment confirmation
- [x] Order controller (order.controller.js)
- [x] Order routes (`/api/orders/*`)
- [x] Order validators (order.validator.js)
- [x] Order status transitions logic

### Frontend

- [x] order.service.ts - TypeScript API client
- [x] OrderManagementPage - đã tích hợp API `/orders/my/sales` và update status
- [x] OrdersPage - Order history with filters
- [x] OrderDetailPage - Full order detail view
- [x] Order status badges & filters
- [x] Order tracking timeline
- [x] Route `/orders` và `/orders/:orderId` trong `App.tsx`

---

## 📝 5. POSTS & SOCIAL FEED (✅ Hoàn thành 100% - Phase 3)

### Backend

- [x] Post model (Prisma schema)
- [x] PostLike model (Prisma schema)
- [x] PostComment model (Prisma schema)
- [x] Post service (`post.service.js`)
  - [x] Create post
  - [x] Get post by ID
  - [x] Get user posts
  - [x] Get feed with filters (authorId, status, visibility, search)
  - [x] Update post
  - [x] Delete post
  - [x] Like/unlike post
  - [x] Add comment
  - [x] Get comments with pagination
- [x] Post controller (`post.controller.js`)
- [x] Post routes (`/api/posts/*`) - 10 endpoints
- [x] Post validators with express-validator
- [x] Swagger documentation for all endpoints
- [x] Fixed avatar -> avatarUrl field mapping

### Frontend

- [x] HomePage feed (tích hợp API thật)
- [x] PostWithProducts component (dùng navigate)
- [x] CreatePostModal (tích hợp API đầy đủ)
- [x] Post service (`post.service.ts`) với TypeScript
- [x] Post composer với Cloudinary media upload
- [x] Like/unlike functionality với optimistic updates
- [x] Pagination với Load More
- [x] date-fns cho format ngày giờ
- [x] Fixed uploadService import
- [x] PostDetailPage - Full API integration
- [x] Comment section với add/reply functionality
- [x] Image gallery với carousel
- [x] Load more comments pagination

---

## 📅 6. SCHEDULED POSTS (❌ Chưa làm - Phase 4)

### Backend

- [x] ScheduledPost model (Prisma schema)
- [ ] **TODO: ScheduledPost service**
- [ ] **TODO: ScheduledPost controller**
- [ ] **TODO: ScheduledPost routes**
- [ ] **TODO: Cron job để publish scheduled posts**
- [ ] **TODO: Timezone handling**

### Frontend

- [ ] **TODO: SchedulePostsPage - migrate to hooks + API**
- [ ] **TODO: Date/time picker component**
- [ ] **TODO: Timezone selector**
- [ ] **TODO: Preview scheduled posts**

---

## 💬 7. MESSAGING (⏳ Phase 4 - 75% Complete)

### Backend

- [x] Conversation model (Prisma schema)
- [x] Message model (Prisma schema)
- [x] ConversationParticipant model (Prisma schema)
- [x] **Message service** (8 methods)
  - [x] Get/create conversation
  - [x] Get user conversations with pagination
  - [x] Get conversation messages
  - [x] Send message
  - [x] Mark as read
  - [x] Delete message
  - [x] Get unread count
  - [x] Search conversations
- [x] **Message controller** (8 endpoints)
- [x] **Message routes** (`/api/messages/*`)
- [x] **Message validators**
- [x] **Socket.IO integration cho real-time chat** (cơ bản)
- [ ] **TODO: File upload for message attachments**

### Frontend

- [x] **message.service.ts** - TypeScript API client
- [x] **MessagesPage - migrated to hooks + full API integration**
- [x] **MessengerWidget - migrated to hooks + full API integration**
- [x] **Real-time message updates (Socket.IO)**
- [x] **Typing indicators**
- [x] **Online/offline status**
- [x] **Message search**
- [ ] **TODO: Chat UI với emoji picker**
- [ ] **TODO: File/image attachments trong messages**

---

## 🔔 8. NOTIFICATIONS (✅ Hoàn thành 100% - Phase 4)

### Backend

- [x] Notification model (Prisma schema)
- [x] Notification service (notification.service.js)
  - [x] Create notification
  - [x] Get user notifications (with pagination & filters)
  - [x] Get notification by ID
  - [x] Mark as read
  - [x] Mark all as read
  - [x] Delete notification
  - [x] Get unread count
  - [x] Cleanup old notifications
  - [x] Helper methods (like, comment, follow, order, message, product mention)
- [x] Notification controller (notification.controller.js)
- [x] Notification routes (`/api/notifications/*`)
- [x] Socket.IO real-time notification emission
- [x] sendNotificationToUser() and emitNotificationCount() helpers
- [x] **Post Like/Comment notification integration** ✅ (fixed 2025-02-21)
- [ ] **TODO: Email notifications**
- [ ] **TODO: Push notifications (FCM)**

### Frontend

- [x] notification.service.ts - TypeScript API client
- [x] NotificationCenter component - Full API integration with real-time
- [x] NotificationsPage - Full API integration with real-time ✅ (type mismatch fixed 2025-02-21)
- [x] Real-time notification updates via Socket.IO
- [x] Mark as read functionality
- [x] Mark all as read functionality
- [x] Delete notification functionality
- [x] Unread count badge with real-time updates
- [x] Notification tabs (all/unread/interaction/commerce)
- [x] Navigation to action URLs
- [ ] **TODO: Notification preferences page**

### Integration Notes
- ✅ Like/Comment notifications trigger correctly when users interact with posts
- ✅ No self-notification (users don't receive notifications for their own actions)
- ✅ Real-time delivery via Socket.IO confirmed working
- ✅ Notification types use lowercase format: 'like', 'comment', 'follow', etc.
- ✅ Action URLs properly formatted: `/post/:id` for post-related notifications

---

## 👥 9. GROUPS (❌ Chưa làm - Phase 6)

### Backend

- [x] Group model (Prisma schema)
- [x] GroupMember model (Prisma schema)
- [ ] **TODO: Group service**
- [ ] **TODO: Group controller**
- [ ] **TODO: Group routes (`/api/groups/*`)**
- [ ] **TODO: Group permissions logic**

### Frontend

- [ ] **TODO: GroupsPage - migrate to hooks + API**
- [ ] **TODO: GroupDetailPage - migrate to hooks + API**
- [ ] **TODO: Create group modal**
- [ ] **TODO: Group member management**
- [ ] **TODO: Group posts feed**

---

## ⭐ 10. REVIEWS & RATINGS (⏳ Đang làm - partial)

### Backend

- [x] Review model (Prisma schema)
- [x] Review service (seller response flow)
- [x] Review controller (seller response flow)
- [x] Review routes (`/api/reviews/*`) cho seller response
- [x] Buyer review APIs (`POST /api/reviews`, `GET /api/reviews/product/:productId`)
- [ ] **TODO: Review validators**
- [ ] **TODO: Buyer review update/delete endpoint**
- [ ] **TODO: Review moderation**

### Frontend

- [x] Review UI trong ProductDetailPage đã nối API thật
- [x] ReviewManagementPage (seller response)
- [ ] **TODO: Star rating component**
- [ ] **TODO: Review filters & sorting**
- [x] Seller response to reviews

---

## 🔍 11. SEARCH & MARKETPLACE (⏳ Đang làm - partial)

### Backend

- [x] Product search/filter qua `/api/products` (query params)
- [ ] **TODO: Search service riêng**
  - [ ] Product search (full-text search nâng cao)
  - [ ] User search
  - [ ] Post search
- [ ] **TODO: Search routes (`/api/search/*`)**
- [ ] **TODO: Advanced filters**
- [ ] **TODO: Search indexing (Elasticsearch optional)**

### Frontend

- [ ] **TODO: SearchResultsPage - migrate to hooks + API (đang mock)**
- [x] MarketplacePage - migrated to hooks + API
- [ ] **TODO: Search autocomplete**
- [ ] **TODO: Filter sidebar**
- [ ] **TODO: Sort options**

---

## 🏪 12. SELLER FEATURES (⏳ Đã có API, còn điểm cần fix)

### Backend

- [x] SellerVerification model (Prisma schema)
- [x] SellerStats model (Prisma schema)
- [x] User role update endpoint (cho phép BUYER → SELLER)
- [x] Seller stats route/controller (`/api/seller/stats`)
- [x] Review response route/controller/service (`/api/reviews/seller/me`, `/:id/response`)
- [ ] **TODO: Seller verification service (3-step form)**
- [ ] **TODO: Admin approval system cho seller verification**
- [ ] **TODO: Fix seller stats query mapping theo schema hiện tại (buyer/avatarUrl, order-item based aggregation)**

### Frontend

- [x] SellerDashboard - integrated API `sellerService.getStats()`
- [x] ProductManagementPage - integrated API list + delete
- [x] OrderManagementPage - integrated API + update status
- [x] AddProductPage - migrated to hooks + API
- [x] ReviewManagementPage - seller response UI + API
- [x] **BecomeSellerPage - migrated to hooks + API**
  - ⚠️ **TEMPORARY**: Auto-approve seller registration (không cần admin duyệt)
  - ⚠️ **TODO FOR PRODUCTION**: Implement admin approval workflow
  - ⚠️ **TODO**: Upload ID card images to Cloudinary
  - ⚠️ **TODO**: Store verification data in SellerVerification table
- [x] **StorePage - migrated to hooks**
- [ ] **TODO: Seller verification flow (3 steps với admin approval)**
- [ ] **TODO: Revenue charts**
- [ ] **TODO: Sales analytics**

---

## 👤 13. USER PROFILE & SOCIAL (✅ Hoàn thành Profile API)

### Backend

- [x] Follow model (Prisma schema)
- [x] User profile endpoints (getUserByUsername, getUserById, getMyProfile)
- [x] Fixed Product field mapping (title instead of name)
- [ ] **TODO: Follow/unfollow endpoints**
- [ ] **TODO: Get followers/following lists**

### Frontend

- [x] ProfilePage - migrated to hooks + API integration
- [x] StorePage - migrated to hooks
- [ ] **TODO: Fetch other user profiles by username (ProfilePage)**
- [ ] **TODO: Follow/unfollow button**
- [ ] **TODO: Followers/following lists**
- [ ] **TODO: User posts grid**
- [ ] **TODO: SettingsPage - migrate to hooks + API**

---

## 👨‍💼 14. ADMIN FEATURES (❌ Chưa làm - Phase 7)

### Backend

- [ ] **TODO: Admin dashboard API**
- [ ] **TODO: User management endpoints**
  - [ ] List all users
  - [ ] Ban/unban user
  - [ ] Verify seller manually
- [ ] **TODO: Product moderation**
- [ ] **TODO: Order management (admin)**
- [ ] **TODO: Analytics & reports**

### Frontend

- [ ] **TODO: AdminDashboard - migrate to hooks + API**
- [ ] **TODO: User management page**
- [ ] **TODO: Product moderation page**
- [ ] **TODO: Seller verification review**
- [ ] **TODO: Analytics dashboard**

---

## 🤖 15. AI FEATURES (❌ Chưa làm - Phase 8)

### Backend

- [x] AiContentHistory model (Prisma schema)
- [ ] **TODO: AI service integration (OpenAI/Claude)**
- [ ] **TODO: Generate product description**
- [ ] **TODO: Generate post caption**
- [ ] **TODO: Image tagging**
- [ ] **TODO: AI content history endpoints**

### Frontend

- [x] AI buttons trong AddProductPage (chưa hoạt động)
- [x] AI buttons trong CreatePostModal (chưa hoạt động)
- [ ] **TODO: Tích hợp AI API calls**
- [ ] **TODO: Loading states cho AI generation**
- [ ] **TODO: AI suggestions UI**

---

## 📊 16. ANALYTICS (❌ Chưa làm - Phase 7)

### Backend

- [x] ProductView model (Prisma schema)
- [x] SellerStats model (Prisma schema)
- [ ] **TODO: Analytics service**
- [ ] **TODO: Track product views**
- [ ] **TODO: Aggregate seller stats daily**
- [ ] **TODO: Generate reports**
- [ ] **TODO: Analytics dashboard API**

### Frontend

- [ ] **TODO: Analytics charts (recharts/chart.js)**
- [ ] **TODO: Sales reports**
- [ ] **TODO: Traffic analytics**
- [ ] **TODO: Conversion tracking**

---

## 🔒 17. SECURITY & PERFORMANCE

### Backend

- [x] JWT authentication
- [x] Password hashing (bcrypt)
- [x] CORS configuration
- [x] Input validation (express-validator)
- [ ] **TODO: Rate limiting (express-rate-limit)**
- [ ] **TODO: Helmet.js security headers**
- [ ] **TODO: SQL injection prevention (Prisma handles)**
- [ ] **TODO: XSS protection**
- [ ] **TODO: CSRF tokens**
- [ ] **TODO: API response caching (Redis)**
- [ ] **TODO: Database query optimization**
- [ ] **TODO: Indexing important fields**

### Frontend

- [x] Token storage (localStorage)
- [x] Axios interceptors
- [ ] **TODO: Input sanitization**
- [ ] **TODO: XSS prevention**
- [ ] **TODO: Route-level code splitting**
- [ ] **TODO: Image lazy loading**
- [ ] **TODO: Performance monitoring**
- [ ] **TODO: Error boundary components**

---

## 🧪 18. TESTING (❌ Chưa làm)

### Backend

- [ ] **TODO: Unit tests (Jest)**
- [ ] **TODO: Integration tests**
- [ ] **TODO: API endpoint tests**
- [ ] **TODO: Test coverage >= 70%**

### Frontend

- [ ] **TODO: Component tests (React Testing Library)**
- [ ] **TODO: E2E tests (Cypress/Playwright)**
- [ ] **TODO: Test coverage >= 70%**

---

## 📚 19. DOCUMENTATION

### Backend

- [x] Swagger/OpenAPI docs (`/api-docs`)
- [x] API_TESTING_GUIDE.md
- [ ] **TODO: API documentation hoàn chỉnh**
- [ ] **TODO: Database schema documentation**
- [ ] **TODO: Deployment guide**

### Frontend

- [ ] **TODO: Component storybook**
- [ ] **TODO: User guide**
- [ ] **TODO: Developer setup guide**

---

## 🚀 20. DEPLOYMENT & DEVOPS (❌ Chưa làm)

### Backend

- [ ] **TODO: Environment variables setup**
- [ ] **TODO: Production database (PostgreSQL)**
- [ ] **TODO: File storage (AWS S3/Cloudinary)**
- [ ] **TODO: Logging (Winston/Pino)**
- [ ] **TODO: Monitoring (Sentry/New Relic)**
- [ ] **TODO: CI/CD pipeline (GitHub Actions)**
- [ ] **TODO: Docker containerization**
- [ ] **TODO: Deploy to cloud (AWS/GCP/Heroku)**

### Frontend

- [ ] **TODO: Environment variables (.env)**
- [ ] **TODO: Build optimization**
- [ ] **TODO: CDN setup**
- [ ] **TODO: Deploy to Vercel/Netlify**
- [ ] **TODO: Domain & SSL**

---

## 🎨 21. UI/UX IMPROVEMENTS

- [ ] **TODO: Dark mode support**
- [ ] **TODO: Mobile responsive (hoàn thiện 100%)**
- [ ] **TODO: Loading skeletons**
- [ ] **TODO: Error states với illustrations**
- [ ] **TODO: Empty states với CTAs**
- [ ] **TODO: Toast notifications (sonner)**
- [ ] **TODO: Accessibility (ARIA labels, keyboard navigation)**
- [ ] **TODO: i18n - Multi-language support**

---

## 📈 22. DATABASE & DATA

### Seed Data

- [ ] **TODO: Create seed script**
- [ ] **TODO: Sample categories**
- [ ] **TODO: Sample products**
- [ ] **TODO: Sample users**
- [ ] **TODO: Sample orders**
- [ ] **TODO: Sample reviews**

### Migrations

- [x] Initial Prisma schema
- [ ] **TODO: Migration scripts cho production**
- [ ] **TODO: Backup strategy**

---

## 🎯 PRIORITY ORDER (Đề xuất)

### 🔥 HIGH PRIORITY (Làm ngay)

1. **Upload middleware cho images**
2. **Seed data để test**
3. **Messaging (Real-time)** (Phase 4)
4. **Notifications** (Phase 4)

### 🟡 MEDIUM PRIORITY (Sau Phase 4)

5. **Reviews & Ratings** (Phase 5)
6. **Search & Filters** (Phase 5)
7. **Groups** (Phase 6)

### 🟢 LOW PRIORITY (Cuối cùng)

8. **Admin Dashboard** (Phase 7)
9. **Analytics** (Phase 7)
10. **AI Features** (Phase 8)
11. **Testing & Documentation**
12. **Deployment**

---

## 📊 Tổng quan tiến độ

| Module        | Backend | Frontend | Status     |
| ------------- | ------- | -------- | ---------- |
| Auth          | ✅ 100% | ✅ 100%  | ✅ Done    |
| Products      | ✅ 90%  | ✅ 80%   | ⏳ Phase 1 |
| Categories    | ✅ 100% | ✅ 100%  | ✅ Done    |
| Cart          | ✅ 100% | ✅ 100%  | ✅ Done    |
| Orders        | ✅ 100% | ✅ 100%  | ✅ Done    |
| Posts         | ✅ 100% | ✅ 100%  | ✅ Done    |
| Messages      | ✅ 90%  | ✅ 75%   | ⏳ Phase 4 |
| Notifications | ✅ 100% | ✅ 100%  | ✅ Done    |
| Reviews       | ⏳ 70%  | ⏳ 70%   | ⏳ Partial |
| Search        | ⏳ 60%  | ⏳ 60%   | ⏳ Partial |
| Seller        | ⏳ 80%  | ⏳ 85%   | ⏳ Partial |
| Admin         | ❌ 0%   | ❌ 0%    | ❌ Todo    |

**Tổng tiến độ: ~84%** 🚀

---

## 🏁 Next Steps

1. ✅ ~~Phase 1: Products & Categories~~ (DONE)
2. ✅ ~~Phase 2: Cart & Orders~~ (DONE - 100%)
3. ✅ ~~Phase 3: Posts & Social Feed~~ (DONE - 100%)
4. 🎯 **Phase 4: Messaging & Notifications** (NEXT)
5. 🔍 Phase 5: Search & Marketplace
6. 👨‍💼 Phase 6: Admin & Analytics
7. 🚀 Phase 7: Deployment

---

_Last updated: March 14, 2026_
