# 🛍️ Social Commerce Platform

> Nền tảng thương mại điện tử kết hợp mạng xã hội với mô hình "Buyer-to-Seller" độc đáo

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8.svg)](https://tailwindcss.com/)

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Đặc điểm nổi bật](#-đặc-điểm-nổi-bật)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Tính năng chi tiết](#-tính-năng-chi-tiết)
- [Tech Stack](#-tech-stack)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [Database Schema](#-database-schema)
- [User Flows](#-user-flows)
- [Screenshots](#-screenshots)
- [API Documentation](#-api-documentation)
- [Roadmap](#-roadmap)

---

## 🎯 Tổng quan

**Social Commerce** là một nền tảng thương mại xã hội kết hợp shopping và social networking, nơi người dùng có thể:

- 🛒 **Mua sắm** sản phẩm từ nhiều seller khác nhau
- 📱 **Tương tác xã hội** như một mạng xã hội (posts, likes, comments, follows)
- 🏪 **Trở thành seller** thông qua quy trình xác thực 3 bước
- 💬 **Nhắn tin trực tiếp** với seller real-time
- 📊 **Quản lý kinh doanh** với dashboard chuyên nghiệp
- 🤖 **AI hỗ trợ** tạo nội dung sản phẩm và bài đăng
- ⏰ **Lên lịch đăng bài** tự động

### Mô hình "Buyer-to-Seller"

Điểm độc đáo của platform:

1. **Mọi người dùng bắt đầu là Buyer** - Đăng ký và mua sắm ngay
2. **Nâng cấp thành Seller** - Qua quy trình xác thực 3 bước:
   - ✅ Step 1: Xác thực thông tin cá nhân (CMND/CCCD)
   - ✅ Step 2: Xác thực thông tin kinh doanh (Giấy phép KD)
   - ✅ Step 3: Xác thực tài khoản ngân hàng
3. **Admin quản trị** - Email chứa "admin" tự động có quyền Admin Dashboard

---

## ✨ Đặc điểm nổi bật

### 🔐 Bảo mật
- Two-Factor Authentication (2FA) với QR code
- Password hashing với bcrypt
- JWT token authentication
- Role-based access control (RBAC)
- Protected routes và API endpoints

### 📱 Responsive Design
- Desktop-first với mobile-optimized
- Adaptive UI components
- Touch-friendly interactions
- Mobile bottom navigation
- Progressive Web App ready

### ⚡ Performance
- Lazy loading images
- Code splitting
- Optimized re-renders
- Database indexing
- Caching strategies

### 🎨 UX/UI Modern
- Clean, minimal design
- Smooth animations
- Intuitive navigation
- Consistent design system
- Accessibility support (WCAG 2.1)

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   React     │  │  Tailwind    │  │  React Router │  │
│  │  Components │  │     CSS      │  │     (SPA)     │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                    API LAYER (Future)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   REST API  │  │  WebSocket   │  │  GraphQL      │  │
│  │  (Express)  │  │  (Socket.io) │  │  (Optional)   │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                    │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │    Auth     │  │   Products   │  │    Orders     │  │
│  │   Service   │  │   Service    │  │   Service     │  │
│  ├─────────────┤  ├──────────────┤  ├───────────────┤  │
│  │  Messages   │  │     Posts    │  │  Notifications│  │
│  │   Service   │  │   Service    │  │    Service    │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                    DATA LAYER                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                  │   │
│  │  • 30+ Tables                                     │   │
│  │  • ACID Compliant                                 │   │
│  │  • Full-text search                               │   │
│  │  • Triggers & Views                               │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│               EXTERNAL SERVICES (Future)                 │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   Payment   │  │   Storage    │  │      AI       │  │
│  │   Gateway   │  │  (S3/Cloud)  │  │   (OpenAI)    │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Tính năng chi tiết

### 1. 👤 Quản lý User

#### Authentication
- [x] Đăng ký tài khoản (email + password)
- [x] Đăng nhập với email/username
- [x] Two-Factor Authentication (2FA)
  - QR Code setup
  - 6-digit verification code
  - Backup codes (8 mã dự phòng)
- [x] Quên mật khẩu (Email reset link)
- [x] Đăng xuất

#### User Profile
- [x] Xem và chỉnh sửa profile
- [x] Avatar upload
- [x] Bio và thông tin cá nhân
- [x] Followers/Following system
- [x] Activity history

#### Role Management
- **Buyer**: Mua sắm, tương tác xã hội
- **Seller**: Tất cả quyền Buyer + Bán hàng, quản lý shop
- **Admin**: Toàn quyền quản trị hệ thống

---

### 2. 🏪 Seller Features

#### Seller Verification (3-Step Process)

**Step 1: Thông tin cá nhân**
- [x] Họ tên, ngày sinh, địa chỉ
- [x] Upload CMND/CCCD (mặt trước + sau)
- [x] Số CMND/CCCD

**Step 2: Thông tin kinh doanh**
- [x] Tên doanh nghiệp/cửa hàng
- [x] Loại hình kinh doanh (Cá nhân/Công ty)
- [x] Giấy phép kinh doanh (nếu có)
- [x] Mã số thuế

**Step 3: Tài khoản ngân hàng**
- [x] Tên ngân hàng
- [x] Số tài khoản
- [x] Tên chủ tài khoản
- [x] Chi nhánh

**Verification Status**
- Pending → Reviewing → Approved/Rejected
- Admin dashboard để phê duyệt
- Email thông báo kết quả

#### Seller Dashboard

**Overview Section**
- [x] Tổng doanh thu (hôm nay, tuần, tháng)
- [x] Số đơn hàng mới
- [x] Số sản phẩm đang bán
- [x] Số người theo dõi
- [x] Biểu đồ doanh thu 7 ngày

**Products Management**
- [x] Thêm sản phẩm mới
  - Title, description, price
  - Multiple images upload
  - Category selection
  - Variants (size, color)
  - Inventory tracking (SKU, stock)
- [x] Chỉnh sửa sản phẩm
- [x] Xóa sản phẩm
- [x] Bulk actions
- [x] Product status (Draft/Active/Out of stock/Archived)

**Orders Management**
- [x] Danh sách đơn hàng
- [x] Order details
- [x] Order status updates
  - Pending → Confirmed → Processing → Shipping → Delivered
  - Cancel/Refund
- [x] Print invoice
- [x] Tracking number input

**Analytics**
- [x] Sales reports (daily/weekly/monthly)
- [x] Best-selling products
- [x] Revenue charts
- [x] Customer insights
- [x] Export reports (CSV/PDF)

---

### 3. 🛒 Shopping Features

#### Product Catalog
- [x] Browse all products
- [x] Category filtering
- [x] Price range filter
- [x] Sort by (newest, price, popular)
- [x] Search functionality
- [x] Product details page
  - Image gallery
  - Description
  - Variants selector
  - Reviews & ratings
  - Seller info
  - Related products

#### Shopping Cart
- [x] Add to cart
- [x] Update quantity
- [x] Remove items
- [x] Cart total calculation
- [x] Persistent cart (localStorage)
- [x] Multi-seller cart support

#### Checkout Process
- [x] Shipping information form
- [x] Payment method selection
  - COD (Cash on Delivery)
  - Bank Transfer
  - E-wallet (Future)
- [x] Order summary
- [x] Place order
- [x] Order confirmation page

#### Order Tracking
- [x] My Orders page
- [x] Order status tracking
- [x] Order details
- [x] Reorder functionality
- [x] Cancel order (if pending)
- [x] Leave review after delivery

---

### 4. 📱 Social Features

#### News Feed
- [x] Personalized feed (Following + Trending)
- [x] Posts from sellers
- [x] Product posts
- [x] Text + Image posts
- [x] Like/Unlike posts
- [x] Comment on posts
- [x] Share posts
- [x] View post details

#### Create Post
- [x] Text content
- [x] Upload images (multiple)
- [x] Tag products
- [x] Visibility settings (Public/Followers/Private)
- [x] Preview before posting

#### Scheduled Posts
- [x] Schedule post for future
- [x] Date & time picker
- [x] Timezone support
- [x] View scheduled posts
- [x] Edit/Cancel scheduled posts
- [x] Auto-publish at scheduled time

#### AI Content Assistant
- [x] Generate product descriptions
- [x] Generate post captions
- [x] Hashtag suggestions
- [x] Content improvement tips
- [x] Image caption generation (Future)

#### Engagement
- [x] Like posts/products
- [x] Comment with nested replies
- [x] Share to feed
- [x] Save/Bookmark
- [x] Report inappropriate content

#### Follow System
- [x] Follow/Unfollow users
- [x] Followers list
- [x] Following list
- [x] Follow suggestions

---

### 5. 💬 Messaging System

#### Direct Messages
- [x] Real-time chat (WebSocket ready)
- [x] Conversation list
- [x] Unread message count
- [x] Message search
- [x] Send text messages
- [x] Send images
- [x] Send product links
- [x] Send order links
- [x] Typing indicators (Future)
- [x] Read receipts
- [x] Delete messages

#### Group Chat (Future)
- [ ] Create group
- [ ] Add members
- [ ] Group admin controls
- [ ] Group name & avatar

---

### 6. 🔔 Notifications

#### Notification Types
- [x] New order (for seller)
- [x] Order status update (for buyer)
- [x] New follower
- [x] Product liked
- [x] Comment on post
- [x] New message
- [x] Seller verification approved/rejected
- [x] Low stock alert (for seller)

#### Notification Center
- [x] Notification dropdown
- [x] Mark as read
- [x] Mark all as read
- [x] Notification settings
- [x] Real-time updates (WebSocket)

---

### 7. 👥 Groups & Communities

#### Group Features
- [x] Create group
- [x] Join group
- [x] Leave group
- [x] Group feed
- [x] Post in group
- [x] Group members list
- [x] Group settings (admin)
- [x] Privacy settings (Public/Private/Secret)

#### Group Management (Admin/Moderator)
- [x] Approve/Reject join requests
- [x] Remove members
- [x] Approve posts (if enabled)
- [x] Edit group info
- [x] Assign moderators

---

### 8. ⭐ Reviews & Ratings

#### Product Reviews
- [x] Leave review (after purchase)
- [x] 5-star rating system
- [x] Review title & content
- [x] Upload review images
- [x] Edit review
- [x] Delete review
- [x] Verified purchase badge

#### Seller Response
- [x] Reply to reviews
- [x] Thank customers
- [x] Address concerns

#### Review Management
- [x] View all reviews
- [x] Filter by rating
- [x] Sort by date/helpfulness
- [x] Report inappropriate reviews

---

### 9. 🔍 Search & Discovery

#### Search Features
- [x] Global search bar
- [x] Search products
- [x] Search users
- [x] Search groups
- [x] Search filters
- [x] Search history
- [x] Trending searches

#### Marketplace
- [x] All products view
- [x] Category browsing
- [x] Featured products
- [x] New arrivals
- [x] Best sellers
- [x] On sale products

---

### 10. ⚙️ Settings

#### Account Settings
- [x] Personal information
- [x] Change password
- [x] Email preferences
- [x] Two-Factor Authentication
- [x] Privacy settings
- [x] Account deletion

#### Notification Settings
- [x] Email notifications
- [x] Push notifications (Future)
- [x] SMS notifications (Future)
- [x] Notification preferences per type

#### Seller Settings
- [x] Shop information
- [x] Business hours
- [x] Shipping settings
- [x] Return policy
- [x] Payment methods

---

### 11. 🛡️ Admin Dashboard

#### User Management
- [x] View all users
- [x] User details
- [x] Ban/Unban users
- [x] Role assignment
- [x] Activity logs

#### Seller Verification
- [x] Pending verifications list
- [x] Review verification documents
- [x] Approve/Reject with reason
- [x] Verification history

#### Content Moderation
- [x] Reported posts
- [x] Reported products
- [x] Reported reviews
- [x] Take action (Remove/Warn/Ban)

#### Platform Analytics
- [x] Total users (Buyers/Sellers/Admin)
- [x] Total products
- [x] Total orders
- [x] Revenue statistics
- [x] Growth charts
- [x] Popular categories

#### System Settings
- [x] Platform configuration
- [x] Commission rates
- [x] Payment gateway settings
- [x] Email templates
- [x] Feature toggles

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | UI Library |
| **TypeScript** | 5.x | Type Safety |
| **React Router** | 6.x | Client-side Routing |
| **Tailwind CSS** | 4.0 | Styling |
| **Lucide React** | Latest | Icons |
| **Recharts** | 2.x | Charts & Graphs |
| **Motion** | Latest | Animations |
| **date-fns** | Latest | Date manipulation |
| **React Hook Form** | 7.x | Form handling |

### Backend (Planned)

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Express.js** | API Framework |
| **PostgreSQL** | Primary Database |
| **Redis** | Caching & Sessions |
| **Socket.io** | Real-time Communication |
| **JWT** | Authentication |
| **Bcrypt** | Password Hashing |
| **Multer** | File Uploads |
| **Nodemailer** | Email Service |

### DevOps & Tools

| Tool | Purpose |
|------|---------|
| **Git** | Version Control |
| **npm/yarn** | Package Manager |
| **ESLint** | Code Linting |
| **Prettier** | Code Formatting |
| **Vite** | Build Tool |

### External Services (Future)

| Service | Purpose |
|---------|---------|
| **OpenAI API** | AI Content Generation |
| **AWS S3** | Image Storage |
| **Cloudinary** | Image CDN |
| **SendGrid** | Transactional Emails |
| **Twilio** | SMS Notifications |
| **Stripe** | Payment Processing |
| **Google Maps** | Location Services |

---

## 📁 Cấu trúc dự án

```
social-commerce/
│
├── public/                      # Static files
│   ├── favicon.ico
│   └── index.html
│
├── src/
│   ├── components/              # React Components
│   │   ├── ui/                  # Reusable UI Components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dropdown.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── chart.tsx
│   │   │   └── ...
│   │   │
│   │   ├── HomePage.tsx         # Home feed
│   │   ├── LoginPage.tsx        # Login
│   │   ├── RegisterPage.tsx     # Registration
│   │   ├── TwoFactorSetup.tsx   # 2FA Setup
│   │   ├── TwoFactorVerify.tsx  # 2FA Verification
│   │   ├── ProductDetailPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── OrdersPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── StorePage.tsx        # Seller's public store
│   │   ├── MarketplacePage.tsx  # All products
│   │   ├── SearchResultsPage.tsx
│   │   ├── MessagesPage.tsx
│   │   ├── GroupsPage.tsx
│   │   ├── GroupDetailPage.tsx
│   │   ├── PostDetailPage.tsx
│   │   ├── SettingsPage.tsx
│   │   │
│   │   ├── seller/              # Seller-specific components
│   │   │   ├── BecomeSellerPage.tsx      # Verification flow
│   │   │   ├── SellerDashboard.tsx       # Seller analytics
│   │   │   ├── ProductManagement.tsx     # Manage products
│   │   │   ├── OrderManagement.tsx       # Manage orders
│   │   │   └── SchedulePostsPage.tsx     # Scheduled posts
│   │   │
│   │   ├── admin/               # Admin-specific components
│   │   │   ├── AdminDashboard.tsx        # Admin overview
│   │   │   ├── UserManagement.tsx        # Manage users
│   │   │   ├── VerificationQueue.tsx     # Approve sellers
│   │   │   └── ContentModeration.tsx     # Moderate content
│   │   │
│   │   ├── CreatePostModal.tsx
│   │   ├── MessengerWidget.tsx
│   │   ├── NotificationCenter.tsx
│   │   └── ...
│   │
│   ├── data/                    # Mock data (for demo)
│   │   ├── mockData.ts          # Sample products, users, etc.
│   │   └── ...
│   │
│   ├── hooks/                   # Custom React Hooks (Future)
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   ├── useNotifications.ts
│   │   └── ...
│   │
│   ├── utils/                   # Utility functions (Future)
│   │   ├── api.ts               # API client
│   │   ├── validation.ts        # Form validation
│   │   ├── formatting.ts        # Data formatting
│   │   └── ...
│   │
│   ├── types/                   # TypeScript types (Future)
│   │   ├── user.ts
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── ...
│   │
│   ├── styles/
│   │   └── globals.css          # Global styles + Tailwind
│   │
│   ├── App.tsx                  # Main App component
│   └── main.tsx                 # Entry point
│
├── database/                    # Database files
│   ├── schema.sql               # PostgreSQL schema
│   ├── seed.sql                 # Sample data
│   └── README.md                # Database documentation
│
├── server/                      # Backend (Future)
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   └── server.js
│
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
├── PROJECT_README.md            # This file
└── README.md                    # Quick start guide
```

---

## 🚀 Hướng dẫn cài đặt

### Prerequisites

- Node.js >= 18.x
- npm hoặc yarn
- PostgreSQL >= 14.x (cho backend)
- Git

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/social-commerce.git
cd social-commerce
```

### 2. Install Dependencies

```bash
npm install
# hoặc
yarn install
```

### 3. Setup Environment Variables (Future)

```bash
# Tạo file .env
cp .env.example .env

# Cấu hình các biến môi trường
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/social_commerce
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
```

### 4. Setup Database (Optional - cho backend)

```bash
# Tạo database
createdb social_commerce

# Import schema
psql -U postgres -d social_commerce -f database/schema.sql

# Import sample data
psql -U postgres -d social_commerce -f database/seed.sql
```

### 5. Run Development Server

```bash
# Frontend only (hiện tại)
npm run dev

# Mở browser tại http://localhost:5173
```

### 6. Run Backend (Future)

```bash
# Terminal mới
cd server
npm install
npm run dev

# API sẽ chạy tại http://localhost:3000
```

### 7. Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

---

## 📊 Database Schema

### Core Tables Overview

```
users (30+ fields)
├─ id, email, username, password_hash
├─ full_name, phone, avatar_url, bio
├─ role (buyer/seller/admin)
└─ is_verified, created_at, updated_at

products (25+ fields)
├─ id, seller_id, category_id
├─ title, slug, description
├─ price, stock_quantity, sku
└─ status, views_count, likes_count

orders (30+ fields)
├─ id, order_number, buyer_id
├─ subtotal, shipping_fee, total
├─ shipping_address, payment_method
└─ status, tracking_number

posts (15+ fields)
├─ id, author_id, content
├─ media_urls, product_id
└─ likes_count, comments_count

messages (10+ fields)
├─ id, conversation_id, sender_id
├─ content, message_type
└─ is_read, created_at

... và 25+ tables khác
```

**Xem chi tiết:** [Database README](/database/README.md)

---

## 🔄 User Flows

### 1. Buyer Journey

```
┌─────────────┐
│   Đăng ký   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Xác thực 2FA│ (Optional)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Browse Feed │◄────┐
│  & Products │     │
└──────┬──────┘     │
       │            │
       ▼            │
┌─────────────┐     │
│ Add to Cart │     │
└──────┬──────┘     │
       │            │
       ▼            │
┌─────────────┐     │
│  Checkout   │     │
└──────┬──────┘     │
       │            │
       ▼            │
┌─────────────┐     │
│Place Order  │     │
└──────┬──────┘     │
       │            │
       ▼            │
┌─────────────┐     │
│Track Order  │     │
└──────┬──────┘     │
       │            │
       ▼            │
┌─────────────┐     │
│Leave Review │─────┘
└─────────────┘
```

### 2. Seller Journey

```
┌─────────────┐
│ Đăng ký     │
│ (as Buyer)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  Nâng cấp thành Seller      │
│                             │
│  Step 1: CMND/CCCD         │
│         ↓                   │
│  Step 2: Giấy phép KD      │
│         ↓                   │
│  Step 3: Tài khoản NH      │
└──────────┬──────────────────┘
           │
           ▼
    ┌─────────────┐
    │Admin Review │
    └──────┬──────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌────────┐   ┌────────┐
│Approved│   │Rejected│
└────┬───┘   └────────┘
     │
     ▼
┌──────────────┐
│Seller        │◄────┐
│Dashboard     │     │
└──────┬───────┘     │
       │             │
       ▼             │
┌──────────────┐     │
│Add Products  │     │
└──────┬───────┘     │
       │             │
       ▼             │
┌──────────────┐     │
│Create Posts  │     │
└──────┬───────┘     │
       │             │
       ▼             │
┌──────────────┐     │
│Manage Orders │─────┘
└──────────────┘
```

### 3. Social Interaction Flow

```
┌─────────────┐
│  News Feed  │
└──────┬──────┘
       │
   ┌───┴────┐
   │        │
   ▼        ▼
┌──────┐ ┌──────────┐
│ Like │ │ Comment  │
└──────┘ └─────┬────┘
   │           │
   │           ▼
   │      ┌─────────┐
   │      │  Reply  │
   │      └─────────┘
   │
   ▼
┌──────────────┐
│   Follow     │
│   User       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Message    │
│   Seller     │
└──────────────┘
```

---

## 📸 Screenshots

### Home Feed
*Feed kết hợp posts và sản phẩm từ sellers đang follow*

### Product Detail
*Chi tiết sản phẩm với gallery, description, reviews*

### Shopping Cart
*Giỏ hàng với multi-seller support*

### Checkout
*Quy trình thanh toán đơn giản, rõ ràng*

### Seller Dashboard
*Analytics, charts, và quick actions*

### Admin Dashboard
*Platform-wide statistics và user management*

### Messaging
*Real-time chat với sellers*

### Seller Verification
*3-step verification process với document upload*

---

## 📡 API Documentation

### Authentication Endpoints

```typescript
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/setup-2fa
POST   /api/auth/verify-2fa
POST   /api/auth/disable-2fa
```

### User Endpoints

```typescript
GET    /api/users/me
PUT    /api/users/me
GET    /api/users/:id
GET    /api/users/:id/followers
GET    /api/users/:id/following
POST   /api/users/:id/follow
DELETE /api/users/:id/unfollow
```

### Product Endpoints

```typescript
GET    /api/products              // List all products
GET    /api/products/:id          // Product details
POST   /api/products              // Create (seller only)
PUT    /api/products/:id          // Update (seller only)
DELETE /api/products/:id          // Delete (seller only)
GET    /api/products/search       // Search products
GET    /api/products/category/:id // By category
```

### Order Endpoints

```typescript
GET    /api/orders                // My orders
GET    /api/orders/:id            // Order details
POST   /api/orders                // Create order
PUT    /api/orders/:id/status     // Update status (seller)
DELETE /api/orders/:id            // Cancel (buyer)
```

### Post Endpoints

```typescript
GET    /api/posts                 // Feed
GET    /api/posts/:id             // Post details
POST   /api/posts                 // Create post
PUT    /api/posts/:id             // Update
DELETE /api/posts/:id             // Delete
POST   /api/posts/:id/like        // Like
POST   /api/posts/:id/comment     // Comment
```

### Message Endpoints

```typescript
GET    /api/conversations         // My conversations
GET    /api/conversations/:id/messages
POST   /api/conversations         // Start conversation
POST   /api/messages              // Send message
PUT    /api/messages/:id/read     // Mark as read
```

### Notification Endpoints

```typescript
GET    /api/notifications         // My notifications
PUT    /api/notifications/:id/read
PUT    /api/notifications/read-all
DELETE /api/notifications/:id
```

**Chi tiết API specs:** Sẽ được document với Swagger/OpenAPI

---

## 🗺️ Roadmap

### Phase 1: MVP (Current) ✅
- [x] Basic UI/UX design
- [x] User authentication
- [x] Product catalog
- [x] Shopping cart
- [x] Order management
- [x] Social feed
- [x] Messaging (UI)
- [x] Seller dashboard (UI)
- [x] Admin dashboard (UI)

### Phase 2: Backend Integration (In Progress) 🚧
- [ ] REST API development
- [ ] Database integration
- [ ] Authentication backend (JWT)
- [ ] File upload service
- [ ] Real-time messaging (Socket.io)
- [ ] Email service
- [ ] Payment integration

### Phase 3: Advanced Features (Q2 2024) 📅
- [ ] AI content generation (OpenAI)
- [ ] Image recognition & tagging
- [ ] Advanced search (Elasticsearch)
- [ ] Recommendation engine
- [ ] Analytics dashboard
- [ ] Mobile apps (React Native)

### Phase 4: Scale & Optimize (Q3 2024) 🚀
- [ ] Performance optimization
- [ ] CDN integration
- [ ] Microservices architecture
- [ ] Load balancing
- [ ] Database sharding
- [ ] Caching layers (Redis)

### Phase 5: Expansion (Q4 2024) 🌍
- [ ] Multi-language support
- [ ] Multi-currency
- [ ] International shipping
- [ ] Live streaming
- [ ] Video content support
- [ ] Affiliate program

---

## 🤝 Contributing

### How to Contribute

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint & Prettier
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation

### Testing

- Write unit tests for utilities
- Write integration tests for API
- Test on multiple browsers
- Test responsive design

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developers

**Project Lead:** [Your Name]

**Contributors:**
- Frontend: [Name]
- Backend: [Name]
- Database: [Name]
- UI/UX: [Name]

---

## 📞 Support & Contact

- **Email:** support@socialcommerce.vn
- **Website:** https://socialcommerce.vn
- **Discord:** [Join our community]
- **GitHub Issues:** [Report bugs]

---

## 🙏 Acknowledgments

- React team for amazing framework
- Tailwind CSS for utility-first CSS
- Lucide for beautiful icons
- Unsplash for stock images
- PostgreSQL community
- Open source contributors

---

## 📚 Additional Resources

- [Frontend Documentation](./docs/FRONTEND.md)
- [Backend API Guide](./docs/BACKEND.md)
- [Database Schema](./database/README.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Security Best Practices](./docs/SECURITY.md)

---

**Made with ❤️ in Vietnam**

**Version:** 1.0.0  
**Last Updated:** February 4, 2024
