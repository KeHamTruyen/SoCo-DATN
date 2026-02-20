# Social Commerce Platform

Nền tảng thương mại xã hội kết hợp mua sắm và tương tác xã hội, cho phép người dùng mua bán sản phẩm, chia sẻ bài viết và kết nối với cộng đồng.

## 🚀 Tính năng chính

- **Mạng xã hội**: Đăng bài, bình luận, like, follow người dùng khác
- **Marketplace**: Mua bán sản phẩm, quản lý đơn hàng
- **Tag sản phẩm**: Gắn thẻ sản phẩm trong bài viết
- **Nhóm cộng đồng**: Tạo và tham gia các nhóm chuyên đề
- **Tin nhắn**: Chat trực tiếp giữa người dùng
- **Thông báo**: Nhận thông báo real-time
- **Seller Dashboard**: Quản lý sản phẩm và đơn hàng cho người bán
- **Admin Panel**: Quản lý hệ thống và người dùng

## 📁 Cấu trúc dự án

```
social-commerce-platform/
├── backend/          # Node.js + Express + Prisma + PostgreSQL
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   └── validators/
│   └── prisma/       # Database schema và migrations
│
└── frontend/         # React + TypeScript + Vite + Tailwind CSS
    └── src/
        ├── components/
        ├── styles/
        └── data/
```

## 🛠️ Công nghệ sử dụng

### Backend

- **Node.js** + **Express.js** - REST API
- **Prisma ORM** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Multer** - File upload
- **bcryptjs** - Password hashing

### Frontend

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - UI components
- **Lucide React** - Icons
- **React Hook Form** - Form handling

## 📦 Cài đặt

### Yêu cầu

- Node.js >= 18
- PostgreSQL >= 14
- npm hoặc yarn

### Backend

```bash
cd backend
npm install

# Tạo file .env từ .env.example
cp .env.example .env

# Cấu hình DATABASE_URL trong .env
# DATABASE_URL="postgresql://user:password@localhost:5432/social_commerce?schema=public"

# Chạy migrations
npm run prisma:migrate

# Khởi động server
npm run dev
```

Backend sẽ chạy tại `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install

# Khởi động dev server
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`

## 🗄️ Database

Dự án sử dụng PostgreSQL với Prisma ORM. Schema database nằm trong `backend/prisma/schema.prisma`.

### Các bảng chính:

- Users
- Posts
- Products
- Orders
- Comments
- Messages
- Groups
- Notifications
- Reviews

## 🔐 Biến môi trường

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./src/uploads
```

## 📝 Scripts

### Backend

```bash
npm start          # Chạy production server
npm run dev        # Chạy development server với nodemon
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Chạy database migrations
npm run prisma:studio    # Mở Prisma Studio GUI
```

### Frontend

```bash
npm run dev        # Chạy development server
npm run build      # Build production
```

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

ISC

## 👥 Tác giả

Social Commerce Platform Team

## 📞 Liên hệ

- Repository: [GitHub](https://github.com/yourusername/social-commerce-platform)
