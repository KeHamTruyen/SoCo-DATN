# 📋 Development Checklist - Social Commerce Platform

## 🎯 Tổng quan tiến độ

### ✅ Đã hoàn thành (cốt lõi)

- **Backend:** Auth, Products, Categories, Cart, Orders, Posts/Feed, Upload/Cloudinary (`/api/upload/*`), Users & follow (`/api/users/*`), Messages (`/api/messages/*` + Socket.IO), Notifications (`/api/notifications/*`), Groups (`/api/groups/*`), Reviews (`/api/reviews/*`), Saved items (`/api/saved-items/*`), Reports (`/api/reports/*`), Scheduled posts (`/api/scheduled-posts/*` + cron), Seller application & admin review (`/api/seller/*`), Admin tối thiểu (`/api/admin/*`), AI Gemini (`/api/ai/*`)
- **Frontend:** Auth, layout/header, **Feed** (post, like, comment, schedule qua API), Post detail, Cart / Checkout / Orders (buyer), **Marketplace** (tìm kiếm, lọc, sort, phân trang qua `GET /products`), Messages, Notifications (kèm mark read), Groups & Group detail (API list; một phần UI mock), Profile (xem user khác, follow/unfollow, seller stats _nếu backend trả_), Saved items, Admin dashboard (reports API)

### ⏳ Đang làm / tinh chỉnh

- Reviews: UI đầy đủ (form, list trên ProductDetail, seller reply)
- Seller: quản lý sản phẩm trên UI (CRUD), upload giấy tờ lên Cloudinary + đồng bộ `SellerVerification`; endpoint `/seller/stats` (FE đang gọi — cần khớp BE)
- Realtime: hoàn thiện Socket (typing, notification realtime, v.v.)
- AI: nối `AiCreativeLab` / nút gợi ý với `/api/ai/*`
- Production: rate limit & Helmet (package có thể đã cài nhưng chưa gắn app), test, **seed** (`npm run prisma:seed` trỏ `prisma/seed.js` nhưng file chưa có trong repo)

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
- [x] Upload routes + Cloudinary storage (`/api/upload/product`, avatar, post)
- [ ] **TODO: Image optimization/resize server-side (ngoài Cloudinary transforms nếu cần)**

### Frontend

- [x] Product API client (`features/product/api`, `features/marketplace/api`)
- [x] Category integration qua API khi cần
- [x] ProductDetail — hooks + API
- [x] Marketplace — `marketplaceApi`, query `q` / category / sort / maxPrice, phân trang
- [x] Feed / post composer — upload media (Cloudinary)
- [ ] **TODO: Trang/quy trình seller CRUD sản phẩm đầy đủ (nếu chưa gom vào một flow rõ ràng)**
- [ ] **TODO: Rich text editor cho mô tả sản phẩm**
- [ ] **TODO: Autocomplete tìm kiếm nâng cao (ngoài ô search Marketplace)**

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

- [x] order.service.ts / `orderApi` — buyer: list purchases, detail, create, cancel
- [x] OrdersPage — lịch sử mua
- [x] OrderDetailPage — chi tiết đơn
- [x] Order status badges & filters
- [x] Order tracking timeline
- [ ] **TODO: UI quản lý đơn bên seller (nối API seller orders nếu chưa có trên Profile)**

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

- [x] **Feed** (`Feed.tsx`) — tích hợp API
- [x] PostWithProducts component (dùng navigate)
- [x] CreatePostModal (tích hợp API đầy đủ)
- [x] Post service / `feedApi` với TypeScript
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

## 📅 6. SCHEDULED POSTS (✅ Backend xong — ⏳ Frontend một phần)

### Backend

- [x] ScheduledPost model (Prisma schema)
- [x] ScheduledPost service (`scheduledPost.service.js`)
- [x] ScheduledPost controller
- [x] ScheduledPost routes (`/api/scheduled-posts/*`)
- [x] Cron job publish (`backend/src/jobs/scheduler.js` + `startScheduler` trong server)
- [x] Trường timezone trong payload (xử lý cơ bản; có thể mở rộng UX)

### Frontend

- [x] Lên lịch từ Feed/CreatePostModal qua `feedApi.createScheduledPost`
- [ ] **TODO: Trang quản lý danh sách scheduled posts (list / edit / hủy)**
- [ ] **TODO: Timezone selector & preview nâng cao**

---

## 💬 7. MESSAGING (✅ Backend — ⏳ Frontend)

### Backend

- [x] Conversation model (Prisma schema)
- [x] Message model (Prisma schema)
- [x] ConversationParticipant model (Prisma schema)
- [x] Message service (`message.service.js`)
- [x] Message controller
- [x] Message routes (`/api/messages/*`)
- [x] Socket.IO (emit real-time trong service)
- [x] Message pagination
- [ ] **TODO: Read receipts đầy đủ**
- [ ] **TODO: Typing / presence (nếu cần)**

### Frontend

- [x] MessagesPage — `messagingApi` (list hội thoại, tin nhắn, gửi)
- [ ] **TODO: Widget chat nổi (floating) nếu cần, đồng bộ Socket**
- [ ] **TODO: Real-time subscribe Socket.IO trên UI (hiện có thể chỉ REST)**
- [ ] **TODO: Emoji picker, đính kèm file/image, typing indicator**

---

## 🔔 8. NOTIFICATIONS (✅ Backend REST — ⏳ Realtime & preferences)

### Backend

- [x] Notification model (Prisma schema)
- [x] Notification service
- [x] Notification controller
- [x] Notification routes (`/api/notifications/*`)
- [ ] **TODO: WebSocket push song song với tạo notification**
- [ ] **TODO: Email / FCM**

### Frontend

- [x] NotificationsPage — `notificationApi`, mark read / mark all read
- [ ] **TODO: Badge / dropdown thông báo trên header (realtime)**
- [ ] **TODO: Real-time cập nhật danh sách**
- [ ] **TODO: Trang preferences (tắt/bật loại thông báo)**

---

## 👥 9. GROUPS (✅ Backend — ⏳ Frontend)

### Backend

- [x] Group model (Prisma schema)
- [x] GroupMember model (Prisma schema)
- [x] Group service (`group.service.js`)
- [x] Group controller
- [x] Group routes (`/api/groups/*`)
- [x] Group permissions logic (admin/member cơ bản)

### Frontend

- [x] GroupsPage — `groupApi.listGroups`
- [x] GroupDetailPage — tích hợp API theo route
- [ ] **TODO: Bỏ mock “My groups” sidebar nếu còn**
- [ ] **TODO: Create group modal, quản lý member, feed nhóm**

---

## ⭐ 10. REVIEWS & RATINGS (✅ Backend — ❌ Frontend đầy đủ)

### Backend

- [x] Review model (Prisma schema)
- [x] Review service
- [x] Review controller
- [x] Review routes (`/api/reviews/*`)
- [x] Review validators
- [ ] **TODO: Moderation / flag review (nếu cần)**

### Frontend

- [ ] **TODO: Review form component**
- [ ] **TODO: Review list component**
- [ ] **TODO: Star rating component tái sử dụng**
- [ ] **TODO: Review filters & sorting**
- [ ] **TODO: Seller response to reviews**

---

## 🔍 11. SEARCH & MARKETPLACE (⏳ Không có `/api/search` thống nhất — Marketplace OK)

### Backend

- [x] Product list + filter + sort qua `GET /api/products` (query: search, category, sort, v.v.)
- [x] User search — `GET /api/users/search`
- [ ] **TODO: Endpoint search thống nhất hoặc post search riêng nếu cần**
- [ ] **TODO: Full-text / Elasticsearch (tùy chọn)**

### Frontend

- [x] MarketplacePage — `marketplaceApi`, filter sidebar, sort, URL `searchParams`
- [ ] **TODO: SearchResultsPage riêng nếu tách khỏi Marketplace**
- [ ] **TODO: Search autocomplete toàn app**
- [ ] **TODO: Lọc nâng cao (đã có một phần)**

---

## 🏪 12. SELLER FEATURES (⏳ API application — UI dần gắn)

### Backend

- [x] SellerVerification model (Prisma schema)
- [x] SellerStats model (Prisma schema)
- [x] Seller apply + 3 bước + admin approve/reject (`/api/seller/*`)
- [x] User role update trong luồng duyệt seller
- [ ] **TODO: Endpoint thống kê dashboard (`GET /seller/stats` hoặc tương đương) khớp frontend**
- [ ] **TODO: Upload URL giấy tờ lên Cloudinary + lưu field verification**

### Frontend

- [x] SellerRegistration (Become seller) + API
- [x] Profile seller tab + `profileApi.getSellerStats` (cần backend tương ứng)
- [ ] **TODO: StorePage / showcase**
- [ ] **TODO: Revenue charts, sales analytics**

---

## 👤 13. USER PROFILE & SOCIAL (✅ Gần xong — ⏳ Settings & username URL)

### Backend

- [x] Follow model (Prisma schema)
- [x] Follow/unfollow (`POST/DELETE /api/users/:userId/follow`)
- [x] Followers / following lists
- [x] Public profile `GET /users/:id`, `GET /users/username/:username`
- [x] Update profile `PUT /users/me`

### Frontend

- [x] ProfilePage — fetch user khác theo `id`, follow/unfollow
- [x] User posts grid (tích hợp feed/post list theo context)
- [ ] **TODO: Route `/profile/:username` nếu muốn slug thay vì id**
- [ ] **TODO: SettingsPage — hooks + API đầy đủ**

---

## 👨‍💼 14. ADMIN FEATURES (⏳ Một phần)

### Backend

- [x] Admin routes (`/api/admin/*`) — users toggle active/role, posts/products delete, dashboard stats
- [ ] **TODO: Mở rộng moderation, order admin, analytics chi tiết**

### Frontend

- [x] AdminDashboard — reports qua `reportApi` (dismiss, delete content, block user)
- [ ] **TODO: Trang user management đầy đủ (gọi admin users API)**
- [ ] **TODO: Product moderation UI, seller verification queue UI**
- [ ] **TODO: Analytics dashboard (charts)**

---

## 🤖 15. AI FEATURES (✅ Backend Gemini — ❌ Frontend wire)

### Backend

- [x] AiContentHistory model (Prisma schema)
- [x] AI service + routes (`/api/ai/generate-text`, `generate-image-text`, `generate-video-images-text`)
- [ ] **TODO: Endpoints lịch sử / quota nếu cần**

### Frontend

- [x] AiCreativeLab (UI; generate hiện mock timeout)
- [ ] **TODO: Nối nút AI trong CreatePostModal / Add product với `/api/ai/*`**
- [ ] **TODO: Loading states, error handling, suggestions UI**

---

## 📊 16. ANALYTICS (⏳ Admin dashboard API — ❌ FE charts)

### Backend

- [x] ProductView model (Prisma schema)
- [x] SellerStats model (Prisma schema)
- [x] Admin `GET /api/admin/dashboard` & growth (một phần)
- [ ] **TODO: Track product views tự động**
- [ ] **TODO: Aggregate seller stats theo lịch, báo cáo export**

### Frontend

- [ ] **TODO: Analytics charts (recharts/chart.js)**
- [ ] **TODO: Sales reports, traffic, conversion**

---

## 🔒 17. SECURITY & PERFORMANCE

### Backend

- [x] JWT authentication
- [x] Password hashing (bcrypt)
- [x] CORS configuration
- [x] Input validation (express-validator)
- [ ] **TODO: Gắn rate limiting (`express-rate-limit` đã có trong dependencies — chưa dùng trong app)**
- [ ] **TODO: Helmet.js security headers**
- [x] SQL injection prevention (Prisma)
- [ ] **TODO: XSS / CSRF / caching Redis / tối ưu query & index**

### Frontend

- [x] Token storage (localStorage)
- [x] Axios interceptors
- [ ] **TODO: Input sanitization, XSS, route code splitting, lazy load ảnh, error boundary**

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
- [x] EXTERNAL*SERVICES_GUIDE.md (Cloudinary, v.v. — thay thế các file CLOUDINARY*\*.md đã gỡ)
- [ ] **TODO: API documentation hoàn chỉnh**
- [ ] **TODO: Database schema documentation**
- [ ] **TODO: Deployment guide**

### Frontend

- [ ] **TODO: Component storybook**
- [ ] **TODO: User guide**
- [ ] **TODO: Developer setup guide**

---

## 🚀 20. DEPLOYMENT & DEVOPS (⏳ Dev local — ❌ Production)

### Backend

- [x] Environment variables (dev — `dotenv`)
- [ ] **TODO: Production database & secrets**
- [x] File storage dev (Cloudinary)
- [ ] **TODO: Logging (Winston/Pino), monitoring, CI/CD, Docker, cloud deploy**

### Frontend

- [x] Environment variables (Vite `.env` local)
- [ ] **TODO: Build tối ưu production, CDN, deploy, domain & SSL**

---

## 🎨 21. UI/UX IMPROVEMENTS

- [x] Dark mode support (ThemePreference + token semantic; một số màn hình còn class legacy)
- [ ] **TODO: Mobile responsive (hoàn thiện 100%)**
- [ ] **TODO: Loading skeletons**
- [ ] **TODO: Error states với illustrations**
- [ ] **TODO: Empty states với CTAs**
- [ ] **TODO: Toast notifications (sonner)**
- [ ] **TODO: Accessibility (ARIA labels, keyboard navigation)**
- [ ] **TODO: i18n - Multi-language support**

---

## 📈 22. DATABASE & DATA

### Saved items & Reports (bổ sung)

- [x] SavedItem API + FE SavedItems page
- [x] Report API + Admin reported content table

### Seed Data

- [ ] **TODO: Thêm `backend/prisma/seed.js` (script `prisma:seed` đang trỏ file chưa tồn tại)**
- [ ] **TODO: Sample categories, products, users, orders, reviews**

### Migrations

- [x] Initial Prisma schema
- [ ] **TODO: Migration scripts cho production**
- [ ] **TODO: Backup strategy**

---

## 🎯 PRIORITY ORDER (Đề xuất)

### 🔥 HIGH PRIORITY

1. **Sửa / bổ sung `prisma/seed.js`** (hoặc chỉnh script) để test nhanh
2. **Reviews UI** + seller orders UI (nếu thiếu)
3. **Khớp `/seller/stats` BE ↔ FE**
4. **Gắn rate limit + Helmet** trước khi public

### 🟡 MEDIUM PRIORITY

5. **AI frontend** → `/api/ai/*`
6. **Realtime** notifications + chat polish (Socket trên FE)
7. **Admin UI** đầy đủ (users, products, seller queue)
8. **Groups** — bỏ mock, tạo nhóm, member management

### 🟢 LOW PRIORITY

9. **Analytics** nâng cao + charts
10. **Testing & documentation**
11. **Deployment production**

---

## 📊 Tổng quan tiến độ

| Module             | Backend  | Frontend | Status            |
| ------------------ | -------- | -------- | ----------------- |
| Auth               | ✅ 100%  | ✅ 100%  | ✅ Done           |
| Products/Upload    | ✅ ~95%  | ✅ ~85%  | ⏳ Polish FE      |
| Categories         | ✅ 100%  | ✅ ~100% | ✅ Done           |
| Cart               | ✅ 100%  | ✅ 100%  | ✅ Done           |
| Orders             | ✅ 100%  | ✅ ~85%  | ⏳ Seller UI      |
| Posts/Feed         | ✅ 100%  | ✅ 100%  | ✅ Done           |
| Scheduled posts    | ✅ ~95%  | 🟡 ~40%  | ⏳ Mgmt page      |
| Messages           | ✅ ~90%  | 🟡 ~60%  | ⏳ Socket FE      |
| Notifications      | ✅ ~85%  | 🟡 ~70%  | ⏳ Realtime       |
| Groups             | ✅ ~90%  | 🟡 ~55%  | ⏳ UI đầy đủ      |
| Reviews            | ✅ ~90%  | ❌ ~15%  | ⏳ FE chính       |
| Search/Marketplace | 🟡 ~70%  | ✅ ~80%  | ⏳ Unified search |
| Seller             | 🟡 ~75%  | 🟡 ~50%  | ⏳ Stats/CRUD     |
| Profile/Social     | ✅ ~95%  | 🟡 ~80%  | ⏳ Settings       |
| Admin              | 🟡 ~50%  | 🟡 ~35%  | ⏳ Mở rộng        |
| AI                 | ✅ ~80%  | ❌ ~25%  | ⏳ Wire FE        |
| Saved items        | ✅ ~100% | ✅ ~90%  | ✅ Done           |
| Reports            | ✅ ~90%  | 🟡 ~50%  | ⏳ Admin flow     |

**Tổng tiến độ ước tính: ~72%**

---

## 🏁 Next Steps

1. ✅ ~~Phase 1: Products & Categories~~ (DONE)
2. ✅ ~~Phase 2: Cart & Orders~~ (DONE)
3. ✅ ~~Phase 3: Posts & Social Feed~~ (DONE)
4. ✅ ~~Phase 3b: Scheduled posts (BE + cron), Marketplace, nhiều API social~~ (DONE cốt lõi)
5. 🎯 **Tiếp theo:** Reviews FE + seller tooling + seed + hardening (rate limit, Helmet)
6. 🎯 **Sau đó:** Realtime FE, Admin UI đầy đủ, AI trên FE, test & deploy

---

_Last updated: March 21, 2026_
