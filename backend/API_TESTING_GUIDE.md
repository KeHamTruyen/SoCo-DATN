# API Testing Guide - Hướng dẫn Test Backend

## 🔍 Swagger là gì?

**Swagger (OpenAPI)** là công cụ để:
- ✅ **Tự động tạo documentation** cho API (danh sách tất cả endpoints, parameters, responses)
- ✅ **Test API trực tiếp từ trình duyệt** không cần Postman hay công cụ khác
- ✅ **Hiển thị ví dụ request/response** cho từng endpoint
- ✅ **Generate API client code** tự động cho frontend

## 🚀 Cách sử dụng Swagger

### 1. Start Backend Server
```bash
cd backend
npm run dev
```

### 2. Truy cập Swagger UI
Mở trình duyệt và vào: **http://localhost:5000/api-docs**

### 3. Test API endpoints
- Click vào endpoint bạn muốn test (ví dụ: `POST /auth/register`)
- Click nút **"Try it out"**
- Nhập dữ liệu vào form
- Click **"Execute"** để gửi request
- Xem kết quả ngay trong giao diện

## 📋 Các endpoints hiện có

### Authentication (Xác thực)
| Method | Endpoint | Mô tả | Auth Required |
|--------|----------|-------|---------------|
| POST | `/api/auth/register` | Đăng ký tài khoản mới | ❌ |
| POST | `/api/auth/login` | Đăng nhập | ❌ |
| POST | `/api/auth/logout` | Đăng xuất | ❌ |
| GET | `/api/auth/me` | Lấy thông tin user hiện tại | ✅ |
| PUT | `/api/auth/profile` | Cập nhật thông tin cá nhân | ✅ |
| PUT | `/api/auth/password` | Đổi mật khẩu | ✅ |

## 🛠️ Các công cụ test khác

### 1. **Postman** (Phổ biến nhất)
- Download: https://www.postman.com/downloads/
- Giao diện trực quan, lưu được collection
- Tốt cho test phức tạp, automation

### 2. **Thunder Client** (VS Code Extension)
- Cài trong VS Code: `Ctrl+Shift+X` → search "Thunder Client"
- Nhẹ, tích hợp ngay trong editor
- Dễ dùng cho test nhanh

### 3. **curl** (Command line)
```bash
# Test đăng ký
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test1234",
    "fullName": "Test User",
    "phone": "0123456789"
  }'

# Test đăng nhập
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

### 4. **REST Client** (VS Code Extension)
- Tạo file `.http` hoặc `.rest`
- Viết request trực tiếp trong file
- Ví dụ:
```http
### Register
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "username": "testuser",
  "password": "Test1234",
  "fullName": "Test User",
  "phone": "0123456789"
}

### Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test1234"
}
```

## 🔐 Test Protected Endpoints (Cần JWT)

### Với Swagger:
1. Test `/auth/login` trước để lấy token
2. Copy token từ response
3. Click nút **"Authorize"** ở đầu trang (🔒 icon)
4. Paste token vào (format: `Bearer <token>`)
5. Bây giờ có thể test các protected endpoints

### Với Postman/Thunder Client:
1. Vào tab **Authorization**
2. Chọn type: **Bearer Token**
3. Paste token vào

### Với curl:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 💡 Tips khi test

### ✅ Nên làm:
- Test từng endpoint một cách có hệ thống
- Kiểm tra cả trường hợp thành công và lỗi
- Test validation (nhập dữ liệu sai để xem error handling)
- Test authentication/authorization
- Lưu lại các test case quan trọng

### ❌ Tránh:
- Không test với dữ liệu thật (password, email thật)
- Không commit API keys/tokens vào git
- Không test production API khi còn đang dev

## 📊 Kiểm tra Database

Sau khi test API, kiểm tra dữ liệu trong database:

### Prisma Studio (GUI - Dễ nhất):
```bash
cd backend
npx prisma studio
```
→ Mở http://localhost:5555 để xem data

### PostgreSQL CLI:
```bash
psql -U postgres -d social_commerce
SELECT * FROM "User";
```

## 🐛 Debug khi có lỗi

1. **Kiểm tra backend server logs** trong terminal
2. **Xem response error message** trong Swagger/Postman
3. **Check database** xem data có được tạo không
4. **Verify JWT token** ở https://jwt.io
5. **Check network tab** trong browser DevTools (F12)

## 📝 Ví dụ test flow đầy đủ

```
1. POST /auth/register → Tạo tài khoản
2. POST /auth/login → Đăng nhập, lưu token
3. GET /auth/me → Xem thông tin user (với token)
4. PUT /auth/profile → Cập nhật profile
5. PUT /auth/password → Đổi mật khẩu
6. POST /auth/login → Đăng nhập lại với mật khẩu mới
7. POST /auth/logout → Đăng xuất
```

---

**Khuyến nghị:** Dùng Swagger cho test nhanh, Postman cho test phức tạp và automation!
