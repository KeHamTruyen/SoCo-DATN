# SoCo-DATN

SoCo-DATN là hệ thống social commerce gồm ứng dụng người dùng, API lõi, cơ sở dữ liệu dùng chung và cụm quản trị tách riêng. Mục tiêu của dự án là kết hợp mua sắm trực tuyến với tương tác cộng đồng trong cùng một nền tảng: đăng bài, marketplace, chat, nhóm, đơn hàng, seller center và admin moderation.

## Tổng quan kiến trúc

Hệ thống được tổ chức theo kiểu nhiều ứng dụng cùng dùng chung một schema Prisma/PostgreSQL:

- `frontend/`: web người dùng viết bằng React + TypeScript + Vite
- `backend/`: core API cho người dùng, seller, feed, marketplace, chat, notification, AI
- `database/`: Prisma schema, seed script và các lệnh quản lý database
- `admin/frontend/`: giao diện quản trị riêng
- `admin/backend/`: admin API riêng, dùng chung database với core API

Các cổng mặc định khi chạy local:

| Thành phần | URL mặc định |
| --- | --- |
| User frontend | `http://localhost:3000` |
| Core backend | `http://localhost:5000` |
| Admin backend | `http://localhost:5001` |
| Admin frontend | `http://localhost:5174` |

## Chức năng chính

- Xác thực người dùng bằng JWT, quản lý hồ sơ, đổi mật khẩu, follow người dùng
- Feed mạng xã hội: tạo bài viết, media upload, like, bình luận, bài viết hẹn giờ
- Marketplace: danh sách sản phẩm, tìm kiếm, lọc, phân trang, chi tiết sản phẩm
- Giỏ hàng và đơn hàng: checkout, lịch sử mua hàng, theo dõi trạng thái đơn
- Seller center: quản lý shop, sản phẩm, đơn bán và thống kê seller
- Nhắn tin và thông báo: REST API, có hỗ trợ realtime với Socket.IO ở một số luồng
- Nhóm cộng đồng: khám phá nhóm, tham gia nhóm, quản lý thành viên
- Báo cáo nội dung, duyệt seller, quản lý người dùng và moderation qua cụm admin
- Tích hợp dịch vụ ngoài như Cloudinary, SMTP và Google Gemini AI

## Công nghệ sử dụng

### Backend và database

- Node.js, Express, ES Modules
- PostgreSQL, Prisma ORM
- JWT, bcryptjs, cookie-parser, cors, express-validator
- Socket.IO cho realtime
- Cloudinary + multer cho upload media
- Nodemailer cho email
- `@google/generative-ai` cho AI phía server

### Frontend

- React 19, TypeScript, Vite 6
- Tailwind CSS 4
- React Router 7
- Lucide React, Motion, Recharts
- `socket.io-client`

## Cấu trúc thư mục

```text
SoCo-DATN/
|-- frontend/          # Ứng dụng người dùng
|-- backend/           # Core API
|-- database/          # Prisma schema, seed, database scripts
|-- admin/
|   |-- frontend/      # Giao diện quản trị
|   `-- backend/       # Admin API
|-- Materials/         # Tài liệu đồ án / tham khảo
|-- DEVELOPMENT_CHECKLIST.md
|-- EXTERNAL_SERVICES_GUIDE.md
`-- README.md
```

## Yêu cầu môi trường

- Node.js `>= 18`
- PostgreSQL `>= 14`
- npm

## Khởi động nhanh

### 1. Cài dependencies

```bash
cd database && npm install
cd ../backend && npm install
cd ../frontend && npm install
cd ../admin/backend && npm install
cd ../admin/frontend && npm install
```

### 2. Tạo file môi trường

Sao chép các file mẫu:

- `backend/.env.example` -> `backend/.env`
- `admin/backend/.env.example` -> `admin/backend/.env`
- `frontend/.env.example` -> `frontend/.env` nếu cần override
- `admin/frontend/.env.example` -> `admin/frontend/.env`

Biến quan trọng cần cấu hình trước:

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `ADMIN_JWT_SECRET`
- `VITE_ADMIN_API_BASE_URL`

Nếu dùng upload, email hoặc AI thì cấu hình thêm:

- `CLOUDINARY_*`
- `SMTP_*`
- `GEMINI_API_KEY`

## Khởi tạo database

Toàn bộ schema nằm trong `database/prisma/schema.prisma`, nhưng các lệnh Prisma thường được gọi từ `backend/` để dùng đúng `backend/.env`.

```bash
cd backend
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

Ý nghĩa nhanh:

- `prisma:generate`: generate Prisma Client
- `prisma:push`: đồng bộ schema vào database theo luồng dev hiện tại
- `prisma:seed`: tạo dữ liệu seed cơ bản, bao gồm tài khoản admin nếu đã khai báo `SEED_*`

Nếu muốn reset database trong môi trường dev:

```bash
cd backend
npm run prisma:reset
npm run prisma:generate
```

## Chạy hệ thống local

Mở 4 terminal riêng:

### Core backend

```bash
cd backend
npm run dev
```

### User frontend

```bash
cd frontend
npm run dev
```

### Admin backend

```bash
cd admin/backend
npm run prisma:generate
npm run dev
```

### Admin frontend

```bash
cd admin/frontend
npm run dev
```

Sau khi chạy xong:

- User app: `http://localhost:3000`
- Admin app: `http://localhost:5174`

## Scripts thường dùng

### `backend/`

```bash
npm run dev
npm start
npm run prisma:generate
npm run prisma:push
npm run prisma:reset
npm run prisma:migrate
npm run prisma:migrate:deploy
npm run prisma:migrate:status
npm run prisma:studio
npm run prisma:seed
```

### `frontend/`

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### `admin/backend/`

```bash
npm run dev
npm start
npm run prisma:generate
```

### `admin/frontend/`

```bash
npm run dev
npm run build
npm run preview
```

## Tài liệu liên quan

| Tài liệu | Mục đích |
| --- | --- |
| [DEVELOPMENT_CHECKLIST.md](DEVELOPMENT_CHECKLIST.md) | Tiến độ tính năng, checklist và hạng mục đang tinh chỉnh |
| [EXTERNAL_SERVICES_GUIDE.md](EXTERNAL_SERVICES_GUIDE.md) | Hướng dẫn cấu hình Cloudinary, SMTP, Gemini và dịch vụ ngoài |
| [backend/README.md](backend/README.md) | Hướng dẫn chi tiết cho core backend |
| [admin/README.md](admin/README.md) | Hướng dẫn chi tiết cho cụm admin |
| [frontend/README.md](frontend/README.md) | Ghi chú riêng cho frontend |
| [backend/API_TESTING_GUIDE.md](backend/API_TESTING_GUIDE.md) | Gợi ý kiểm thử API |

## Ghi chú triển khai

- Core API và admin API dùng chung PostgreSQL và Prisma schema.
- Admin không còn là một nhóm route nằm trong core backend, mà chạy như service riêng.
- Một số tính năng phụ thuộc dịch vụ ngoài; nếu thiếu cấu hình, các luồng upload, email hoặc AI có thể không hoạt động đầy đủ.
- Luồng database hiện tại ưu tiên `prisma db push` cho phát triển nội bộ.

## Repository

- GitHub: [KeHamTruyen/SoCo-DATN](https://github.com/KeHamTruyen/SoCo-DATN)
- License: `ISC`
