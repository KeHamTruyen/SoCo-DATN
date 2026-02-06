# Social Commerce Platform - Backend

Backend API cho Social Commerce Platform sử dụng Express.js và PostgreSQL (Prisma ORM).

## 🚀 Cài đặt

1. Cài dependencies:

```bash
npm install
```

2. Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

3. Cập nhật DATABASE_URL trong file `.env` với thông tin PostgreSQL của bạn

4. Generate Prisma Client:

```bash
npm run prisma:generate
```

5. Chạy migrations:

```bash
npm run prisma:migrate
```

6. (Optional) Seed database:

```bash
npm run prisma:seed
```

## 🏃 Chạy ứng dụng

### Development mode:

```bash
npm run dev
```

### Production mode:

```bash
npm start
```

## 📁 Cấu trúc thư mục

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── middlewares/    # Middleware functions
│   ├── validators/     # Input validation
│   ├── utils/          # Utility functions
│   ├── config/         # Configuration
│   ├── prisma/         # Database schema & migrations
│   ├── uploads/        # Uploaded files
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── .env                # Environment variables
└── package.json
```

## 🛠️ Scripts

- `npm run dev` - Chạy server ở development mode với nodemon
- `npm start` - Chạy server ở production mode
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Chạy database migrations
- `npm run prisma:studio` - Mở Prisma Studio GUI
- `npm run prisma:seed` - Seed database với sample data

## 📚 API Endpoints

### Auth

- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/forgot-password` - Quên mật khẩu

### Users

- `GET /api/users/profile` - Lấy profile
- `PUT /api/users/profile` - Cập nhật profile
- `GET /api/users/:id` - Lấy thông tin user

### Products

- `GET /api/products` - Lấy danh sách products
- `GET /api/products/:id` - Lấy chi tiết product
- `POST /api/products` - Tạo product mới (seller)
- `PUT /api/products/:id` - Cập nhật product (seller)
- `DELETE /api/products/:id` - Xóa product (seller)

### Orders

- `GET /api/orders` - Lấy danh sách orders
- `GET /api/orders/:id` - Lấy chi tiết order
- `POST /api/orders` - Tạo order mới
- `PUT /api/orders/:id` - Cập nhật order status

### Cart

- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart` - Thêm item vào giỏ
- `PUT /api/cart/:id` - Cập nhật số lượng
- `DELETE /api/cart/:id` - Xóa item

### Posts

- `GET /api/posts` - Lấy danh sách posts
- `GET /api/posts/:id` - Lấy chi tiết post
- `POST /api/posts` - Tạo post mới
- `PUT /api/posts/:id` - Cập nhật post
- `DELETE /api/posts/:id` - Xóa post

### Groups

- `GET /api/groups` - Lấy danh sách groups
- `GET /api/groups/:id` - Lấy chi tiết group
- `POST /api/groups` - Tạo group mới
- `POST /api/groups/:id/join` - Tham gia group
- `POST /api/groups/:id/leave` - Rời group

### Messages

- `GET /api/messages` - Lấy danh sách messages
- `POST /api/messages` - Gửi message mới
- `PUT /api/messages/:id/read` - Đánh dấu đã đọc

### Notifications

- `GET /api/notifications` - Lấy danh sách notifications
- `PUT /api/notifications/:id/read` - Đánh dấu đã đọc
- `PUT /api/notifications/read-all` - Đánh dấu tất cả đã đọc

## 🔐 Authentication

API sử dụng JWT (JSON Web Tokens) để authentication. Include token trong header:

```
Authorization: Bearer <your-jwt-token>
```

## 🗄️ Database Schema

Xem file `src/prisma/schema.prisma` để biết chi tiết về database schema.

## 📝 License

ISC
