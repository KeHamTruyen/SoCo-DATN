# 🔧 Hướng dẫn Debug & Fix Issues - Phase 1

## ⚠️ Vấn đề bạn đang gặp:

### 1. Không truy cập được "Cửa hàng của tôi"
**Nguyên nhân:** Tài khoản của bạn hiện đang là **BUYER**, chưa phải **SELLER**

### 2. Trạng thái đăng nhập không được duy trì khi reload trang
**Nguyên nhân:** Backend chưa chạy hoặc API `/auth/me` bị lỗi

---

## ✅ GIẢI PHÁP

### Bước 1: Kiểm tra Backend có đang chạy không

```powershell
# Mở terminal trong folder backend
cd "d:\Downloads\Social Commerce Platform\backend"

# Chạy backend server
npm run dev
```

**Expected output:**
```
Server running on port 5000
Database connected
```

Truy cập: http://localhost:5000/api-docs để xem Swagger UI

---

### Bước 2: Kiểm tra Frontend có đang chạy không

```powershell
# Mở terminal mới trong folder frontend
cd "d:\Downloads\Social Commerce Platform\frontend"

# Chạy frontend
npm run dev
```

**Expected output:**
```
VITE v6.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

### Bước 3: Đăng ký tài khoản SELLER mới

#### Option A: Đăng ký qua Frontend UI

1. Truy cập: http://localhost:5173
2. Click "Đăng ký"
3. Điền thông tin:
   - Email: `seller1@example.com`
   - Username: `seller1`
   - Full Name: `Test Seller`
   - Phone: `0123456789`
   - Password: `123456`
   - **QUAN TRỌNG:** Chọn vai trò: **"Người bán"** (SELLER)
4. Click "Đăng ký"

#### Option B: Đăng ký qua API (dùng Postman/Thunder Client/Insomnia)

```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "seller1@example.com",
  "username": "seller1",
  "fullName": "Test Seller",
  "phone": "0123456789",
  "password": "123456",
  "role": "SELLER"
}
```

**Expected response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": {
      "id": "...",
      "email": "seller1@example.com",
      "username": "seller1",
      "role": "SELLER",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Bước 4: Đăng nhập với tài khoản SELLER

1. Đăng nhập với:
   - Email: `seller1@example.com`
   - Password: `123456`

2. Sau khi đăng nhập thành công, click vào **avatar** ở góc phải

3. Bạn sẽ thấy menu với các option:
   - ✅ **Bảng điều khiển** → `/seller/dashboard`
   - ✅ **Cửa hàng của tôi** → `/store/your-id`
   - ✅ **Lịch đăng bài**

4. Click vào "Bảng điều khiển" hoặc "Cửa hàng của tôi"

---

### Bước 5: Test các trang Seller

#### 5.1. Seller Dashboard
- URL: http://localhost:5173/seller/dashboard
- Features: Stats (revenue, orders, products), charts

#### 5.2. Quản lý sản phẩm
- URL: http://localhost:5173/seller/products
- Features: Product list, search, filters
- ⚠️ **Lưu ý:** Đang dùng mock data

#### 5.3. Thêm sản phẩm mới (✅ Tích hợp API)
- URL: http://localhost:5173/seller/products/add
- Click "Lưu sản phẩm" → Gọi API thật để tạo product

**Test flow:**
1. Điền thông tin sản phẩm:
   - Title: "iPhone 15 Pro Max"
   - Price: 29990000
   - Category: Chọn category
   - Description: "Sản phẩm chính hãng..."
   - Stock: 10
   - SKU: "IP15PM-001"

2. Thêm ảnh (URL):
   - `https://via.placeholder.com/800x800`

3. Click "Lưu sản phẩm"

4. Nếu thành công:
   - Alert: "Sản phẩm đã được tạo thành công"
   - Redirect về `/seller/products`

5. Xem sản phẩm vừa tạo:
   - Truy cập: http://localhost:5173/product/YOUR_PRODUCT_ID
   - Data được fetch từ API thật

#### 5.4. Quản lý đơn hàng
- URL: http://localhost:5173/seller/orders
- ⚠️ **Lưu ý:** Đang dùng mock data (chưa có Order API)

---

## 🐛 DEBUG AUTH PERSISTENCE

### Kiểm tra localStorage

1. Mở DevTools (F12)
2. Tab "Application" → "Local Storage" → `http://localhost:5173`
3. Kiểm tra có 2 keys:
   - `token`: JWT token string
   - `user`: JSON object với `role: "SELLER"`

### Nếu không có token/user trong localStorage:

**Debug bằng Console:**

```javascript
// Check token
console.log(localStorage.getItem('token'));

// Check user
console.log(JSON.parse(localStorage.getItem('user')));

// Check API response
fetch('http://localhost:5000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(res => res.json())
.then(data => console.log('Profile:', data));
```

### Nếu API `/auth/me` trả về lỗi:

**Possible issues:**

1. **401 Unauthorized:**
   - Token hết hạn
   - Token không hợp lệ
   - **Fix:** Đăng nhập lại

2. **CORS error:**
   - Backend chưa config CORS đúng
   - **Fix:** Check `backend/src/app.js`:
   ```javascript
   app.use(cors({
     origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
     credentials: true
   }));
   ```

3. **Backend chưa chạy:**
   - **Fix:** `cd backend && npm run dev`

---

## 🔍 DEBUG ROLE ISSUES

### Kiểm tra role của user hiện tại:

```javascript
// Paste vào Console (F12)
const user = JSON.parse(localStorage.getItem('user'));
console.log('Current role:', user?.role);

// Expected: "SELLER" hoặc "ADMIN"
// If "BUYER" → Không thấy menu Seller
```

### Nếu role là "BUYER":

**Option 1: Đăng ký tài khoản mới với role SELLER** (recommended)

**Option 2: Update role trong database** (for testing only)

```sql
-- Nếu bạn có quyền truy cập database
UPDATE "User" 
SET role = 'SELLER' 
WHERE email = 'your-email@example.com';
```

**Option 3: Update qua API** (chưa có endpoint, cần tạo admin endpoint)

---

## 📊 KIỂM TRA TOÀN BỘ FLOW

### Flow hoàn chỉnh cho Seller:

```
1. Register với role="SELLER"
   ↓
2. Login → Nhận token + user object
   ↓
3. Token được lưu vào localStorage
   ↓
4. AuthContext.useEffect() check token
   ↓
5. Gọi /auth/me để lấy user info
   ↓
6. Set user vào state
   ↓
7. Header check user.role === 'SELLER'
   ↓
8. Hiển thị menu "Cửa hàng của tôi"
   ↓
9. Click → Navigate to /seller/dashboard
   ↓
10. RoleRoute check allowedRoles includes user.role
   ↓
11. Nếu pass → Render SellerDashboard
    Nếu fail → Redirect to /home
```

### Test từng bước:

```javascript
// 1. Check backend health
fetch('http://localhost:5000/api-docs')
  .then(res => console.log('Backend:', res.ok ? '✅' : '❌'));

// 2. Check token exists
console.log('Token:', localStorage.getItem('token') ? '✅' : '❌');

// 3. Check user exists
const user = JSON.parse(localStorage.getItem('user') || '{}');
console.log('User:', user.id ? '✅' : '❌');
console.log('Role:', user.role);

// 4. Check role is SELLER
console.log('Is Seller:', ['SELLER', 'ADMIN'].includes(user.role) ? '✅' : '❌');

// 5. Test navigate to seller page
// Paste in console:
window.location.href = '/seller/dashboard';
```

---

## 🎯 QUICK FIX CHECKLIST

- [ ] Backend đang chạy (`npm run dev` trong folder backend)
- [ ] Frontend đang chạy (`npm run dev` trong folder frontend)
- [ ] Database connected (check backend console)
- [ ] Đã đăng ký tài khoản với **role="SELLER"**
- [ ] Đã đăng nhập thành công
- [ ] localStorage có `token` và `user`
- [ ] `user.role` là "SELLER" hoặc "ADMIN"
- [ ] Reload trang → vẫn đăng nhập (không bị redirect to /login)
- [ ] Click avatar → thấy menu "Bảng điều khiển" và "Cửa hàng của tôi"
- [ ] Click "Bảng điều khiển" → vào được `/seller/dashboard`

---

## ❓ TÌM LỖI CỤ THỂ

### Lỗi 1: "Redirect to /login khi vào /seller/dashboard"

**Nguyên nhân:**
- Chưa đăng nhập
- Token hết hạn
- User không có role SELLER

**Fix:**
1. Đăng nhập lại
2. Check localStorage có token
3. Check user.role === "SELLER"

---

### Lỗi 2: "Redirect to /home khi vào /seller/dashboard"

**Nguyên nhân:**
- User đã đăng nhập nhưng role là "BUYER"

**Fix:**
1. Check role: `JSON.parse(localStorage.getItem('user')).role`
2. Nếu là "BUYER" → Đăng ký tài khoản mới với role "SELLER"

---

### Lỗi 3: "Reload trang → bị logout"

**Nguyên nhân:**
- Backend không chạy
- API `/auth/me` bị lỗi
- Token không hợp lệ

**Debug:**
```javascript
// Check API response
fetch('http://localhost:5000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(res => res.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err));
```

**Fix:**
1. Đảm bảo backend đang chạy
2. Check CORS configuration
3. Đăng nhập lại để có token mới

---

### Lỗi 4: "Cannot read property 'role' of null"

**Nguyên nhân:**
- AuthContext chưa load xong user
- User chưa đăng nhập

**Fix:**
- Đợi `loading === false` trước khi render
- ProtectedRoute đang handle điều này với loading spinner

---

## 📞 CÁC API CẦN THIẾT (Phase 1)

### Auth APIs (✅ Done):
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy profile
- `PUT /api/auth/profile` - Cập nhật profile

### Product APIs (✅ Done):
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Xem chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm mới (SELLER/ADMIN)
- `PUT /api/products/:id` - Cập nhật sản phẩm (SELLER/ADMIN)
- `DELETE /api/products/:id` - Xóa sản phẩm (SELLER/ADMIN)
- `POST /api/products/:id/publish` - Publish sản phẩm
- `GET /api/products/seller/me` - Lấy sản phẩm của seller

### Category APIs (✅ Done):
- `GET /api/categories` - Lấy tất cả categories
- `GET /api/categories/:id` - Chi tiết category

---

## 🚀 NEXT STEPS

Sau khi fix được các issues trên:

1. **Test tạo sản phẩm:**
   - Vào `/seller/products/add`
   - Tạo 2-3 sản phẩm test
   - Verify trong database hoặc qua API

2. **Test xem chi tiết sản phẩm:**
   - Vào `/product/:id`
   - Check data từ API
   - Test thêm vào giỏ hàng

3. **Ready cho Phase 2:**
   - Cart & Checkout APIs
   - Order Management APIs

---

## 💡 TIPS

### Register nhiều tài khoản test:

```javascript
// Seller 1
{
  "email": "seller1@example.com",
  "username": "seller1",
  "fullName": "Seller One",
  "phone": "0123456789",
  "password": "123456",
  "role": "SELLER"
}

// Seller 2
{
  "email": "seller2@example.com",
  "username": "seller2",
  "fullName": "Seller Two",
  "phone": "0987654321",
  "password": "123456",
  "role": "SELLER"
}

// Buyer
{
  "email": "buyer1@example.com",
  "username": "buyer1",
  "fullName": "Buyer One",
  "phone": "0111222333",
  "password": "123456",
  "role": "BUYER"
}

// Admin (nếu cần)
{
  "email": "admin@example.com",
  "username": "admin",
  "fullName": "Admin User",
  "phone": "0999888777",
  "password": "admin123",
  "role": "ADMIN"
}
```

### Clear localStorage nếu gặp lỗi lạ:

```javascript
// Paste vào Console
localStorage.clear();
location.reload();
```

### Check tất cả routes có thể truy cập:

**Public routes (không cần login):**
- `/login`
- `/register`
- `/forgot-password`

**Protected routes (cần login):**
- `/home`
- `/profile`
- `/product/:id`
- `/cart`
- `/marketplace`
- `/messages`
- `/notifications`

**Seller routes (cần role=SELLER hoặc ADMIN):**
- `/seller/dashboard`
- `/seller/products`
- `/seller/products/add`
- `/seller/orders`

**Admin routes (cần role=ADMIN):**
- `/admin/dashboard`

---

*Last updated: February 13, 2026*
