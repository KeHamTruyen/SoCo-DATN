# ✅ Cloudinary Setup Checklist

## Bước 1: Đăng ký Cloudinary (FREE) ⏱️ 5 phút

1. Truy cập: https://cloudinary.com/users/register_free
2. Điền form đăng ký (email, password)
3. Verify email
4. Login vào: https://console.cloudinary.com/

---

## Bước 2: Lấy API Credentials ⏱️ 2 phút

1. Trong Dashboard, bạn sẽ thấy bảng "Account Details"
2. Copy 3 thông tin sau:

```
Cloud Name: dxxxxxxxx
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz123
```

📸 Screenshot vị trí: Góc trên bên phải Dashboard

---

## Bước 3: Update Backend .env ⏱️ 1 phút

Mở file: `backend/.env`

Thay thế 3 dòng này:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

Thành credentials của bạn:

```bash
CLOUDINARY_CLOUD_NAME=dxxxxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123
```

⚠️ **Lưu ý:** Không có dấu ngoặc kép, không có khoảng trắng!

---

## Bước 4: Restart Backend ⏱️ 30 giây

```powershell
# Trong terminal backend (nếu đang chạy, nhấn Ctrl+C để stop)
cd "d:\Downloads\Social Commerce Platform\backend"
npm run dev
```

✅ Kiểm tra console phải thấy:
```
Server running on port 5000
Database connected
```

❌ Nếu thấy lỗi "CLOUDINARY_CLOUD_NAME is required":
→ Check lại .env, đảm bảo không có khoảng trắng

---

## Bước 5: Test Upload API ⏱️ 2 phút

### Option A: Qua Swagger UI (Dễ nhất)

1. Mở: http://localhost:5000/api-docs
2. Tìm section **"Upload"**
3. Click **POST /api/upload/product**
4. Click **"Try it out"**
5. Click **"Authorize"** → Paste JWT token (lấy từ localStorage hoặc đăng nhập mới)
6. Click **"Choose File"** → Select ảnh bất kỳ
7. Click **"Execute"**

✅ Expected response:
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/dxxxxxxxx/image/upload/v1234567890/social-commerce/products/abc123.jpg",
    "publicId": "social-commerce/products/abc123"
  }
}
```

### Option B: Qua Frontend (Test full flow)

1. Đảm bảo frontend đang chạy: http://localhost:5173
2. Đăng nhập với tài khoản SELLER
3. Vào: http://localhost:5173/seller/products/add
4. Scroll xuống phần "Hình ảnh sản phẩm"
5. Click vào box "Click to upload or drag and drop"
6. Select ảnh
7. Chờ upload (thấy spinner)
8. ✅ Ảnh hiện ra với nút X ở góc

---

## Bước 6: Verify trên Cloudinary Dashboard ⏱️ 1 phút

1. Quay lại: https://console.cloudinary.com/
2. Click "Media Library" (menu bên trái)
3. Tìm folder: **"social-commerce/products"**
4. Click vào folder → Thấy ảnh vừa upload
5. Click vào ảnh → Copy URL → Paste vào browser → Ảnh mở được ✅

---

## 🎯 Checklist Hoàn thành

- [ ] Đã đăng ký Cloudinary account
- [ ] Đã copy Cloud Name, API Key, API Secret
- [ ] Đã update `backend/.env` với credentials
- [ ] Backend restart thành công (không có lỗi)
- [ ] Test upload qua Swagger UI thành công
- [ ] Test upload qua Frontend thành công
- [ ] Ảnh hiện trong Cloudinary Dashboard
- [ ] URL ảnh mở được trong browser

---

## ❗ Troubleshooting

### Lỗi: "Request failed with status code 401"
**Nguyên nhân:** JWT token không hợp lệ hoặc hết hạn

**Fix:**
1. Đăng xuất
2. Đăng nhập lại
3. Test upload lại

---

### Lỗi: "Invalid credentials"
**Nguyên nhân:** Sai Cloud Name, API Key, hoặc API Secret

**Fix:**
1. Double check credentials trong Cloudinary Dashboard
2. Copy lại chính xác (không có khoảng trắng)
3. Restart backend

---

### Lỗi: "File too large"
**Nguyên nhân:** Ảnh > 5MB

**Fix:**
1. Compress ảnh trước khi upload
2. Hoặc tăng limit trong `backend/src/config/cloudinary.js`:
```javascript
limits: { fileSize: 10 * 1024 * 1024 } // 10MB
```

---

### Lỗi: "Cannot read property 'path' of undefined"
**Nguyên nhân:** Multer không nhận được file

**Fix:**
1. Check Content-Type header phải là `multipart/form-data`
2. Check field name phải là `image` (cho single upload)
3. Check file có được select đúng không

---

## 🎉 Next Steps

Sau khi setup thành công:

1. ✅ Test tạo sản phẩm hoàn chỉnh từ `/seller/products/add`
2. ✅ Upload nhiều ảnh cho 1 sản phẩm
3. ✅ View sản phẩm ở `/product/:id` → Ảnh load từ Cloudinary
4. 🔜 Setup upload avatar cho user profile
5. 🔜 Setup upload media cho posts

---

## 📚 Resources

- Cloudinary Dashboard: https://console.cloudinary.com/
- Cloudinary Docs: https://cloudinary.com/documentation
- Swagger API: http://localhost:5000/api-docs
- Frontend: http://localhost:5173

---

*Setup guide updated: February 13, 2026*
