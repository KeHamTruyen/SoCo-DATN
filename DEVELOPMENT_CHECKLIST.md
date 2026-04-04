# 📋 Development Checklist - Social Commerce Platform

## 🎯 Tổng quan tiến độ

### ✅ Đã hoàn thành (cốt lõi)

- **Backend:** Auth, Products, Categories, Cart, Orders, Posts/Feed, Upload/Cloudinary (`/api/upload/*`), Users & follow (`/api/users/*`), Messages (`/api/messages/*` + Socket.IO), Notifications (`/api/notifications/*`), Groups (`/api/groups/*`), Reviews (`/api/reviews/*`), Saved items (`/api/saved-items/*`), Reports (`/api/reports/*`), Scheduled posts (`/api/scheduled-posts/*` + cron), Seller (`/api/seller/*`: đăng ký + upload, **`GET /seller/stats`**), Admin (`/api/admin/*`), AI Gemini (`/api/ai/*`)
- **Frontend:** Auth, **UnifiedHeader** (dropdown thông báo + **Socket realtime**), **Feed**, **`/scheduled-posts`** (list + tạo + xóa), Post detail, Cart / Checkout / Orders (buyer), **Seller Center** (`/seller/dashboard`: CRUD sản phẩm, tab đơn bán, stats), **Marketplace**, Messages, Notifications (**page + realtime sync + preferences + live toast**), Groups (discover + detail + create + “My groups” từ API + member management + invites), Profile + **Account Settings**, Saved items, i18n toggle (VI/EN)
- **Admin (`admin/frontend`):** Reports, **Users**, **Seller applications**, Categories, Content, v.v.

### ⏳ Đang làm / tinh chỉnh

- Reviews: form + list trên **ProductDetail**, seller reply (BE có; FE chưa đủ)
- Scheduled posts: timezone/preview nâng cao (UX)
- Realtime chat: Tinh chỉnh cơ chế presence/typing (Socket BE/FE đã có payload tin nhắn)
- AI: `AiCreativeLab` UI và API wiring đã nối `/api/ai/*` qua `aiApi`
- Production: **`express-rate-limit` có trong dependencies nhưng chưa gắn `app.js`**; **Helmet chưa thêm dependency**; Winston chưa dùng trong code; test; **seed** chỉ admin (`database/prisma/seed.js`)

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
- [x] **Seller Center** — `/seller/dashboard`: shop + inventory, form CRUD (`SellerProductFormDialog`), bảng sản phẩm
- [ ] **TODO: Polish** — rich text mô tả sản phẩm, bulk actions, v.v.
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
- [x] Tab **Orders** trên **Seller Center** (`orderApi.listSellerSales` trên `/seller/dashboard?tab=orders`)
- [ ] **TODO: Chi tiết đơn / cập nhật trạng thái từ UI seller (nếu chưa đủ)**

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

## 📅 6. SCHEDULED POSTS (✅ Backend — 🟡 Frontend: trang quản lý cơ bản)

### Backend

- [x] ScheduledPost model (Prisma schema)
- [x] ScheduledPost service (`scheduledPost.service.js`)
- [x] ScheduledPost controller
- [x] ScheduledPost routes (`/api/scheduled-posts/*`)
- [x] Cron job publish (`backend/src/jobs/scheduler.js` + `startScheduler` trong server)
- [x] Trường timezone trong payload (xử lý cơ bản; có thể mở rộng UX)

### Frontend

- [x] Lên lịch từ Feed/CreatePostModal qua `feedApi.createScheduledPost`
- [x] Trang **`/scheduled-posts`** — `feedApi.listScheduledPosts`, xóa (`deletePost`), tạo mới qua modal
- [x] **Sửa lịch (nút Edit trong `ScheduledPostsPage` đã nối `handleUpdate`)**
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
- [x] **Widget chat nổi (floating/dock) đồng bộ qua `MessagingContext`**
- [x] **Real-time subscribe Socket.IO trên UI (qua `useMessageSocket`)**
- [ ] **TODO: Emoji picker, đính kèm file/image, typing indicator**

---

## 🔔 8. NOTIFICATIONS (✅ Backend + ✅ FE realtime + preferences)

### Backend

- [x] Notification model (Prisma schema)
- [x] Notification service
- [x] Notification controller
- [x] Notification routes (`/api/notifications/*`)
- [x] WebSocket push song song với tạo notification (`notification:new`)
- [ ] **TODO: Email / FCM**

### Frontend

- [x] NotificationsPage — `notificationApi`, mark read / mark all read
- [x] **Dropdown header** (`UnifiedHeader` + `NotificationDropdown`) — 5 tin gần nhất + badge unread (REST initial)
- [x] **NotificationProvider** dùng single source cho header + page + live toast
- [x] **Realtime ở FE**: subscribe Socket.IO + cập nhật dropdown/page + sync `notification:new`, `notification:read`, `notification:read-all`
- [x] Preferences UI + API (`social/order/system`)

---

## 👥 9. GROUPS (✅ Feature-complete v1)

### Backend

- [x] Group model (Prisma schema)
- [x] GroupMember model (Prisma schema)
- [x] Group service (`group.service.js`)
- [x] Group controller
- [x] Group routes (`/api/groups/*`)
- [x] Group permissions logic (ADMIN/MODERATOR/MEMBER + guard backend)
- [x] Join request flow cho nhóm private (request -> approve/reject)
- [x] Invite code/link flow (create/list/revoke/join-by-invite)
- [x] Group media feed endpoint (`GET /api/groups/:groupId/media`)
- [x] Group tagged products endpoint (`GET /api/groups/:groupId/products`)

### Frontend

- [x] GroupsPage — `groupApi.listGroups` + tìm kiếm/filter UI
- [x] GroupDetailPage — tích hợp API theo route + thảo luận nhóm
- [x] Sidebar “My groups” lấy từ `groupApi.getMyGroups` (không còn mock tĩnh)
- [x] Create group modal + join/leave group + cập nhật group cơ bản
- [x] Tab members/products/media chi tiết + quản lý member nâng cao
- [x] Role-based actions theo capability (promote/demote/remove/approve/invite)

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

- [x] Hiển thị **rating tổng hợp** trên `ProductDetailPanel` (số sao + số review từ API sản phẩm)
- [ ] **TODO: Review form component** (gửi review)
- [ ] **TODO: Review list component** (chi tiết từng review)
- [ ] **TODO: Star rating component tái sử dụng** (tách khỏi inline)
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

## 🏪 12. SELLER FEATURES (🟡 API đủ cốt lõi — UI Seller Center đã dùng)

### Backend

- [x] SellerVerification model (Prisma schema)
- [x] SellerStats model (Prisma schema)
- [x] Seller apply + 3 bước + upload multer + admin approve/reject (`/api/seller/*`)
- [x] User role update trong luồng duyệt seller
- [x] **`GET /api/seller/stats`** — `getDashboardStats` (đơn, view, v.v.)
- [ ] **TODO: Export / báo cáo nâng cao**

### Frontend

- [x] SellerRegistration (Become seller) + API
- [x] `profileApi.getSellerStats` + **Seller Center** (`SellerDashboard`, tab dashboard có stats + charts đơn giản)
- [ ] **TODO: StorePage / showcase công khai**
- [ ] **TODO: Revenue / analytics nâng cao (ngoài biểu đồ placeholder trên seller dashboard)**

---

## 👤 13. USER PROFILE & SOCIAL (✅ Profile + settings cốt lõi)

### Backend

- [x] Follow model (Prisma schema)
- [x] Follow/unfollow (`POST/DELETE /api/users/:userId/follow`)
- [x] Followers / following lists
- [x] Public profile `GET /users/:id`, `GET /users/username/:username`
- [x] Update profile `PUT /users/me`

### Frontend

- [x] ProfilePage — fetch user khác theo `id`, follow/unfollow
- [x] User posts grid (tích hợp feed/post list theo context)
- [x] Account settings page (`/account-settings`) — profile + privacy tabs, hooks + API
- [ ] **TODO: Route `/profile/:username` nếu muốn slug thay vì id**
- [ ] **TODO: Mở rộng settings nâng cao hơn nếu cần** (security sessions, notification center hợp nhất, v.v.)

---

## 👨‍💼 14. ADMIN FEATURES (🟡 Backend + admin app đã có nhiều màn)

### Backend

- [x] Admin routes (`/api/admin/*`) — users toggle active/role, posts/products delete, dashboard stats
- [ ] **TODO: Mở rộng moderation, order admin, analytics chi tiết**

### Frontend

- [x] **Admin app** (`admin/frontend`): Reports, **`UsersPage`** (`adminApi.getUsers`), **`SellerApplicationsPage`**, Categories, Content, v.v.
- [ ] **TODO: Product moderation UI tập trung (nếu tách khỏi Content)**
- [ ] **TODO: Analytics dashboard (charts) toàn nền tảng**

---

## 🤖 15. AI FEATURES (✅ Backend Gemini — ❌ Frontend wire)

### Backend

- [x] AiContentHistory model (Prisma schema)
- [x] AI service + routes (`/api/ai/generate-text`, `generate-image-text`, `generate-video-images-text`)
- [ ] **TODO: Endpoints lịch sử / quota nếu cần**

### Frontend

- [x] AiCreativeLab (UI và API wiring — nối `/api/ai/*` qua `aiApi`)
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

- [x] Biểu đồ đơn giản trên **Seller Center** (`SellerDashboardChartsPanel` — theo stats API)
- [ ] **TODO: Analytics charts** toàn app (recharts/chart.js) — admin + traffic
- [ ] **TODO: Sales reports, traffic, conversion** nâng cao

---

## 🔒 17. SECURITY & PERFORMANCE

### Backend

- [x] JWT authentication
- [x] Password hashing (bcrypt)
- [x] CORS configuration
- [x] Input validation (express-validator)
- [ ] **TODO: Gắn rate limiting** — `express-rate-limit` có trong `backend/package.json` nhưng **chưa import trong `app.js`**
- [ ] **TODO: Helmet** — **chưa có trong dependencies**; cần `npm i helmet` rồi gắn middleware
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
- [x] Groups v1 flow tests (join/leave/invite/approve + race simulation) với `node --test` (`backend/test/groups-v1-flow.test.js`)

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
- [ ] **TODO: Logging** — `winston` có trong `package.json` nhưng **chưa dùng trong `src/`**; monitoring, CI/CD, Docker, cloud deploy

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
- [x] i18n cơ bản (VI/EN toggle ở header, translations đã có)
- [ ] **TODO: i18n đầy đủ toàn app** (chuẩn hóa key + phủ hết màn hình)

---

## 📈 22. DATABASE & DATA

### Saved items & Reports (bổ sung)

- [x] SavedItem API + FE SavedItems page
- [x] Report API + Admin reported content table

### Seed Data

- [x] **`database/prisma/seed.js`** (admin seed; `npm run prisma:seed` từ `backend`)
- [ ] **TODO: Sample categories, products, users, orders, reviews**

### Migrations

- [x] Initial Prisma schema
- [ ] **TODO: Migration scripts cho production**
- [ ] **TODO: Backup strategy**

---

## 🎯 PRIORITY ORDER (Đề xuất)

### 🔥 HIGH PRIORITY

1. **Mở rộng `database/prisma/seed.js`** — sample categories, users, orders, reviews (hiện chỉ admin)
2. **Reviews UI** đầy đủ trên trang sản phẩm (form + list + seller reply)
3. **Gắn rate limit** (`app.js`) **+ cài Helmet** trước khi public

### 🟡 MEDIUM PRIORITY

4. **Nối nút AI** trong CreatePostModal / Add product với `/api/ai/*`
5. **Admin** — polish moderation sản phẩm, analytics charts
6. **Scheduled posts** — timezone/preview nâng cao
7. **Profile/settings polish** — route theo username, settings nâng cao

### 🟢 LOW PRIORITY

9. **Analytics** nâng cao (seller + admin)
10. **Testing & documentation**
11. **Deployment production**

---

## 📊 Tổng quan tiến độ

| Module             | Backend  | Frontend | Status                 |
| ------------------ | -------- | -------- | ---------------------- |
| Auth               | ✅ 100%  | ✅ 100%  | ✅ Done                |
| Products/Upload    | ✅ ~95%  | ✅ ~90%  | ⏳ Polish / reviews    |
| Categories         | ✅ 100%  | ✅ ~100% | ✅ Done                |
| Cart               | ✅ 100%  | ✅ 100%  | ✅ Done                |
| Orders             | ✅ 100%  | ✅ ~92%  | ⏳ Seller chi tiết     |
| Posts/Feed         | ✅ 100%  | ✅ 100%  | ✅ Done                |
| Scheduled posts    | ✅ ~95%  | 🟡 ~90%  | ⏳ TZ UX               |
| Messages           | ✅ ~90%  | ✅ ~90%  | ✅ Socket FE done      |
| Notifications      | ✅ 100%  | ✅ 100%  | ✅ Done                |
| Groups             | ✅ ~95%  | ✅ ~92%  | ✅ Feature-complete v1 |
| Reviews            | ✅ ~90%  | 🟡 ~25%  | ⏳ Form + list         |
| Search/Marketplace | 🟡 ~70%  | ✅ ~80%  | ⏳ Unified search      |
| Seller             | ✅ ~90%  | ✅ ~80%  | ⏳ Store public        |
| Profile/Social     | ✅ ~95%  | ✅ ~90%  | ✅ Settings cơ bản     |
| Admin              | 🟡 ~55%  | 🟡 ~60%  | ⏳ Charts, mod         |
| AI                 | ✅ ~80%  | 🟡 ~75%  | ⏳ Link to composer    |
| Saved items        | ✅ ~100% | ✅ ~90%  | ✅ Done                |
| Reports            | ✅ ~90%  | 🟡 ~55%  | ⏳ Admin flow          |

**Tổng tiến độ ước tính: ~91%**

---

## 🏁 Next Steps

1. ✅ ~~Phase 1: Products & Categories~~ (DONE)
2. ✅ ~~Phase 2: Cart & Orders~~ (DONE)
3. ✅ ~~Phase 3: Posts & Social Feed~~ (DONE)
4. ✅ ~~Phase 3b: Scheduled posts (BE + cron), Marketplace, nhiều API social~~ (DONE cốt lõi)
5. 🎯 **Tiếp theo:** Reviews FE + seed dữ liệu mẫu + hardening (rate limit, Helmet, Winston)
6. 🎯 **Sau đó:** Realtime chat FE, AI trên FE, scheduled post edit, admin analytics, test & deploy

---

## ✅ Notification hardening (production-ready)

### Completed

- [x] Backend emit payload `notification:new` với schema cố định (có `event`, `schemaVersion`, `category`, `actor`, `related`)
- [x] Emit `notification:read` và `notification:read-all` để đồng bộ đa tab
- [x] Preferences theo nhóm `social/order/system` (API get/update)
- [x] Frontend dùng single source qua `NotificationProvider` cho header + page
- [x] Notifications page nhận realtime, filter theo loại, optimistic update mark read/read-all
- [x] Reconnect socket có cơ chế resync và chống duplicate theo `id`

### Test matrix

- [ ] **Multi-tab sync**: Tab A mark read -> Tab B tự đổi trạng thái + unread badge giảm ngay
- [ ] **Multi-tab read-all**: Tab A read-all -> Tab B badge/page về 0 unread
- [ ] **Reconnect**: ngắt mạng 15-30s, reconnect lại -> không duplicate, dữ liệu đồng bộ server
- [ ] **Preferences off**: tắt `social`, tạo like/comment/follow -> không nhận notification social mới
- [ ] **Preferences on lại**: bật lại `social`, trigger event -> nhận notification bình thường

### Checklist test chi tiết - Notifications

#### A. API contract & dữ liệu

- [ ] `GET /api/notifications` trả về đủ trường cần cho FE (`id`, `rawType/type`, `title`, `message`, `isRead`, `createdAt`, `actionUrl`, actor/related nếu có).
- [ ] `GET /api/notifications?type=social|order|system` filter đúng theo loại.
- [ ] `PATCH /api/notifications/:id/read` trả thành công khi notification thuộc user hiện tại.
- [ ] `PATCH /api/notifications/:id/read` không sửa được notification của user khác.
- [ ] `PATCH /api/notifications/read-all` chỉ cập nhật notification unread của user hiện tại.
- [ ] `GET /api/notifications/preferences` trả default hợp lệ khi user chưa có cấu hình.
- [ ] `PATCH /api/notifications/preferences` cập nhật đúng từng key (`social/order/system`) và không ghi đè key ngoài phạm vi.

#### B. Realtime event schema

- [ ] Event `notification:new` luôn có `event="notification:new"` và `schemaVersion`.
- [ ] Event `notification:new` có `category` đúng mapping (social/order/system).
- [ ] Event `notification:read` chứa `id` vừa mark + `unreadCount` mới.
- [ ] Event `notification:read-all` chứa `unreadCount=0`.
- [ ] Payload sai schema không làm FE crash (FE bỏ qua payload malformed).

#### C. Đồng bộ toàn app (header + notifications page)

- [ ] Khi có notification mới, badge trên header tăng ngay không cần reload.
- [ ] Khi mở trang notifications, danh sách hiển thị đúng item mới nhất nhận realtime.
- [ ] Khi click read 1 item ở page, badge header giảm ngay.
- [ ] Khi mark all read ở page, toàn bộ item về read + badge header về 0.
- [ ] Khi thao tác read ở header/dropdown (nếu có), page phản ánh đúng trạng thái ngay.

#### D. Multi-tab / multi-session

- [ ] Mở 2 tab cùng tài khoản: read ở tab A -> tab B tự cập nhật read state.
- [ ] Mở 2 tab cùng tài khoản: read-all ở tab A -> tab B về unread=0.
- [ ] Mở 2 browser/profile khác nhau cùng tài khoản: vẫn sync read/read-all.
- [ ] Mở tài khoản khác (user B): không nhận event notification của user A.

#### E. Reconnect / mất mạng / chống duplicate

- [ ] Tắt mạng 15-30s rồi bật lại: socket reconnect thành công.
- [ ] Sau reconnect, hệ thống resync từ server: badge/list nhất quán.
- [ ] Không xuất hiện duplicate item theo cùng `notification.id` sau reconnect nhiều lần.
- [ ] Refresh trang sau reconnect vẫn giữ trạng thái read/unread đúng với DB.

#### F. Preferences theo loại

- [ ] Tắt `social`, tạo sự kiện like/comment/follow -> không có notification mới loại social.
- [ ] Tắt `order`, tạo sự kiện order/new status -> không có notification mới loại order.
- [ ] Tắt `system`, tạo sự kiện system/new message -> không có notification mới loại system.
- [ ] Bật lại từng loại -> nhận lại notification đúng loại đó.
- [ ] Thay đổi preferences ở tab A -> tab B sau refresh phản ánh đúng cấu hình mới.

#### G. Filter & optimistic update trên FE

- [ ] Filter `All` hiển thị đầy đủ.
- [ ] Filter `Social/Order/System` chỉ hiển thị đúng loại.
- [ ] Mark read ở tab đang filter không làm mất đồng bộ badge tổng.
- [ ] Optimistic mark read thành công: UI đổi ngay, không giật/nhảy lại sai trạng thái.
- [ ] Khi API mark read thất bại: UI rollback hoặc resync đúng dữ liệu server.

#### H. Quyền truy cập & bảo mật

- [ ] API notifications yêu cầu auth; token thiếu/sai phải trả 401/403.
- [ ] User không thể đọc/mark/xóa notification của user khác (IDOR test).
- [ ] Socket chỉ join room user hiện tại sau auth/session hợp lệ.

#### I. Hiệu năng & UX

- [ ] Có 100+ notifications vẫn render mượt (không lag rõ rệt).
- [ ] Badge/unread count không bị âm trong mọi thao tác liên tiếp.
- [ ] Timestamp/relative time hiển thị hợp lý.
- [ ] Không có lỗi console nghiêm trọng khi nhận event liên tục.

#### J. Regression các luồng tạo notification

- [ ] Social: like/comment/follow vẫn tạo notification đúng người nhận.
- [ ] Order: new order/status change vẫn tạo notification đúng người nhận.
- [ ] Message/system: vẫn tạo notification đúng người nhận.
- [ ] Các luồng trên không bị ảnh hưởng bởi thay đổi realtime mới.

### Gợi ý test data

- [ ] Ít nhất 2 user thật để test follow/like/comment.
- [ ] 1 user buyer + 1 user seller để test order notifications.
- [ ] Seed sẵn >= 20 notifications với đủ loại và trạng thái read/unread.

---

_Last updated: March 31, 2026 (updated to reflect current implementation state)_
