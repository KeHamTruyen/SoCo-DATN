# Social Commerce Platform (SoCo-DATN)

Nền tảng thương mại xã hội kết hợp mua sắm và tương tác xã hội: feed, marketplace, giỏ hàng và đơn hàng, tin nhắn, nhóm, thông báo và các luồng người bán / quản trị.

**Tiến độ chi tiết, API và hạng mục đang tinh chỉnh:** xem [DEVELOPMENT_CHECKLIST.md](DEVELOPMENT_CHECKLIST.md).

## 📚 Tài liệu liên quan

| Tài liệu                                                     | Mô tả ngắn                                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------------- |
| [DEVELOPMENT_CHECKLIST.md](DEVELOPMENT_CHECKLIST.md)         | Tiến độ tính năng FE/BE, TODO, endpoint tổng quan                   |
| [EXTERNAL_SERVICES_GUIDE.md](EXTERNAL_SERVICES_GUIDE.md)     | Cloudinary, email (SMTP), Gemini AI, dịch vụ ngoài và cách cấu hình |
| [backend/README.md](backend/README.md)                       | Cài đặt backend, cấu trúc thư mục, script Prisma (ủy quyền `database/`) |
| [database/package.json](database/package.json)               | Lệnh Prisma: `generate`, `db:push`, `db:reset`, `migrate`, `migrate:deploy`, `migrate:status`, `studio`, `seed` |
| [backend/API_TESTING_GUIDE.md](backend/API_TESTING_GUIDE.md) | Gợi ý kiểm thử API                                                  |
| [backend/.env.example](backend/.env.example)                 | Danh sách biến môi trường đầy đủ (mẫu)                              |

## 🚀 Tính năng chính (tổng quan)

- **Feed & bài viết**: Đăng bài, like, bình luận; upload media qua Cloudinary; lên lịch đăng bài (cron phía server)
- **Marketplace**: Tìm kiếm, lọc, sắp xếp, phân trang sản phẩm; chi tiết sản phẩm
- **Giỏ hàng & đơn hàng**: Cart, checkout (thanh toán mock/COD), theo dõi đơn (buyer/seller)
- **Người dùng & hồ sơ**: Đăng ký/đăng nhập (JWT), follow, xem hồ sơ
- **Tin nhắn**: REST API + **Socket.IO** cho realtime (đang mở rộng typing, v.v.)
- **Thông báo**: API thông báo; đánh dấu đã đọc
- **Nhóm cộng đồng**: Tạo/tham gia nhóm, trang nhóm
- **Đánh giá & lưu**: Reviews API; mục đã lưu (saved items)
- **Báo cáo & quản trị**: Báo cáo nội dung; admin dashboard (tối thiểu)
- **Người bán**: Đăng ký seller, xác minh (dữ liệu nhạy cảm có thể mã hóa khi cấu hình key); dashboard người bán
- **AI**: Backend `/api/ai/*` (Google Gemini); frontend có SDK GenAI cho tích hợp gợi ý/sáng tạo (theo tiến độ UI)

## 📁 Cấu trúc dự án

```
SoCo-DATN/
├── backend/                 # Node.js (ESM) + Express + Prisma Client + PostgreSQL
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   └── ...
│   └── .env.example
│
├── database/                # Prisma schema + seed (`db push` hoặc `migrate` — xem README)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── package.json
│
├── frontend/                # React 19 + TypeScript + Vite + Tailwind CSS
│   └── src/
│       ├── app/             # router, layouts, providers
│       ├── features/        # theo domain (feed, marketplace, cart, …)
│       ├── pages/
│       ├── shared/
│       └── styles/
│
├── Materials/               # Tài liệu mô tả / yêu cầu đồ án (nếu có)
├── DEVELOPMENT_CHECKLIST.md
└── EXTERNAL_SERVICES_GUIDE.md
```

## 🛠️ Công nghệ sử dụng

### Backend

- **Node.js** + **Express** — REST API (ES modules)
- **Prisma** + **PostgreSQL**
- **JWT** (jsonwebtoken), **bcryptjs**, **cookie-parser**, **CORS**
- **Socket.IO** — realtime messaging
- **Cloudinary** + **multer** / **multer-storage-cloudinary** — upload ảnh (sản phẩm, avatar, bài viết, …)
- **node-cron** — bài viết lên lịch
- **Nodemailer** — email (quên mật khẩu, thông báo qua SMTP nếu bật)
- **@google/generative-ai** — Gemini trên server
- **express-rate-limit**, **express-validator**, **winston**
- **swagger-jsdoc** + **swagger-ui-express** — tài liệu API (khi bật cấu hình)

### Frontend

- **React 19** + **TypeScript**
- **Vite 6**
- **Tailwind CSS 4** (`@tailwindcss/vite`)
- **react-router-dom** 7
- **Lucide React**, **Motion**, **Recharts**
- **@google/genai** — tích hợp phía client (theo tính năng)

## 📦 Cài đặt nhanh

### Yêu cầu

- Node.js **>= 18**
- PostgreSQL **>= 14**
- npm (hoặc yarn/pnpm)

### Backend

```bash
cd backend
npm install
cd ../database
npm install
cd ../backend

# Sao chép môi trường: Unix/macOS
cp .env.example .env
# Windows (CMD/PowerShell): copy .env.example .env

# Điền DATABASE_URL và các biến bắt buộc (xem mục Biến môi trường bên dưới)

npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

API mặc định: `http://localhost:5000` (cổng có thể đổi qua `PORT` trong `.env`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Dev server được cấu hình chạy tại **`http://localhost:3000`** (khớp `FRONTEND_URL` trong `backend/.env.example`). Đảm bảo backend cho phép CORS với URL này.

### Dịch vụ ngoài (khuyến nghị)

- **Cloudinary**: cần cho upload ảnh sản phẩm, avatar, bài viết theo luồng hiện tại — xem [EXTERNAL_SERVICES_GUIDE.md](EXTERNAL_SERVICES_GUIDE.md).
- **Gemini** (`GEMINI_API_KEY`): bật tính năng AI phía server/client tương ứng.
- **SMTP**: email (ví dụ quên mật khẩu) khi bạn cấu hình Nodemailer.

Thiếu từng loại có thể khiến một số luồng lỗi hoặc bị giới hạn; chi tiết và fallback nằm trong guide và code.

## 🗄️ Database

PostgreSQL với Prisma. Schema và seed: [`database/prisma/`](database/prisma/).  
Chi tiết bảng/quan hệ: mở `database/prisma/schema.prisma` hoặc từ `backend` chạy `npm run prisma:studio` (lệnh thực thi trong package `database/`, đọc `DATABASE_URL` từ `backend/.env`).

**Luồng dev hiện dùng (không bắt buộc file migration):** `npm run prisma:push` — đồng bộ schema trực tiếp; `npm run prisma:reset` — xóa DB rồi tạo lại theo schema (mất dữ liệu).

**Tham khảo Prisma Migrate (khi đã có thư mục `database/prisma/migrations/` hoặc triển khai production có migration):**

| Lệnh (từ `backend/`) | Ý nghĩa ngắn |
| -------------------- | ------------- |
| `npm run prisma:migrate` | `prisma migrate dev` — tạo/áp migration trong dev (tương tác) |
| `npm run prisma:migrate:deploy` | `prisma migrate deploy` — áp các migration đã commit (CI/production) |
| `npm run prisma:migrate:status` | `prisma migrate status` — trạng thái migration so với DB |

Tùy chọn: từ `backend` chạy `npm run prisma:seed` — thực thi [`database/prisma/seed.js`](database/prisma/seed.js) (biến seed trong `backend/.env`, xem `backend/.env.example`).

## 🔐 Biến môi trường (tóm tắt)

Cấu hình đầy đủ: **[backend/.env.example](backend/.env.example)**.

| Nhóm                         | Gợi ý                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------- |
| **Cốt lõi**                  | `DATABASE_URL`, `PORT`, `NODE_ENV`, `JWT_SECRET`, `JWT_EXPIRE`, `FRONTEND_URL`                  |
| **Upload / CDN**             | `CLOUDINARY_*`, `MAX_FILE_SIZE`, `UPLOAD_PATH`                                                  |
| **Bảo mật dữ liệu nhạy cảm** | `SENSITIVE_DATA_KEY` (production nên có; dev có thể để trống theo ghi chú trong `.env.example`) |
| **Giới hạn request**         | `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`                                               |
| **Email**                    | `SMTP_*`, `SMTP_FROM`                                                                           |
| **AI**                       | `GEMINI_API_KEY`, `GEMINI_TEMPERATURE`, `GEMINI_MAX_TOKENS`                                     |

Hướng dẫn đăng ký tài khoản dịch vụ và best practice: [EXTERNAL_SERVICES_GUIDE.md](EXTERNAL_SERVICES_GUIDE.md).

## 📝 Scripts

### Backend (`backend/`)

```bash
npm start                 # Production
npm run dev               # Development (nodemon)
npm run prisma:generate   # Generate Prisma Client
npm run prisma:push       # Đồng bộ schema (db push)
npm run prisma:reset      # Reset DB + push schema (mất dữ liệu)
npm run prisma:migrate    # migrate dev (tham khảo; cần thư mục migrations)
npm run prisma:migrate:deploy   # migrate deploy (production/CI)
npm run prisma:migrate:status   # migrate status
npm run prisma:studio     # Prisma Studio
npm run prisma:seed       # Seed (nếu có file seed)
```

### Frontend (`frontend/`)

```bash
npm run dev       # Dev server (cổng 3000)
npm run build     # Build production
npm run preview   # Xem bản build
npm run lint      # tsc --noEmit
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo branch (`git checkout -b feature/TenTinhNang`)
3. Commit và push
4. Mở Pull Request

## 📄 License

ISC

## 👥 Tác giả

Social Commerce Platform Team — repository: [KeHamTruyen/SoCo-DATN](https://github.com/KeHamTruyen/SoCo-DATN)

## 📞 Liên hệ

- GitHub: [https://github.com/KeHamTruyen/SoCo-DATN](https://github.com/KeHamTruyen/SoCo-DATN)
