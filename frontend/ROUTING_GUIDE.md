# 🛣️ React Router Implementation Guide

## ✅ Đã thay đổi gì?

### **Trước đây (State-based routing):**
```tsx
// URL không đổi, luôn là "/"
const [currentPage, setCurrentPage] = useState('home');
onNavigate('profile')  // Chỉ đổi state, không đổi URL
```

### **Bây giờ (URL-based routing):**
```tsx
// URL thay đổi theo page
navigate('/profile')  // URL thành "/profile"
<Link to="/marketplace">  // Click để navigate
```

---

## 📋 Cấu trúc Routes

### **Public Routes** (Không cần đăng nhập)
- `/login` - Trang đăng nhập
- `/register` - Trang đăng ký
- `/forgot-password` - Quên mật khẩu

### **Protected Routes** (Cần đăng nhập)
- `/` hoặc `/home` - Trang chủ
- `/profile/:username` - Profile user khác
- `/profile` - Profile của mình
- `/product/:id` - Chi tiết sản phẩm
- `/cart` - Giỏ hàng
- `/checkout` - Thanh toán
- `/messages` - Tin nhắn
- `/notifications` - Thông báo
- `/marketplace` - Chợ
- `/store/:username` - Cửa hàng
- `/search` - Tìm kiếm
- `/groups` - Nhóm
- `/group/:id` - Chi tiết nhóm
- `/post/:id` - Chi tiết bài viết
- `/schedule-posts` - Lên lịch đăng
- `/settings` - Cài đặt
- `/become-seller` - Đăng ký seller

### **Seller Routes** (Chỉ SELLER hoặc ADMIN)
- `/seller/dashboard` - Dashboard người bán
- `/seller/products` - Quản lý sản phẩm
- `/seller/products/add` - Thêm sản phẩm
- `/seller/orders` - Quản lý đơn hàng

### **Admin Routes** (Chỉ ADMIN)
- `/admin/dashboard` - Dashboard admin

---

## 🔒 Route Guards

### **ProtectedRoute**
- Kiểm tra user đã đăng nhập chưa
- Nếu chưa → redirect về `/login`
- Lưu URL đang cố truy cập để redirect lại sau khi login

### **RoleRoute**
- Kiểm tra user có role phù hợp không
- Nếu không → redirect về `/home`

---

## 🎯 Cách sử dụng trong Components

### **1. Navigate programmatically:**
```tsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const goToProfile = () => {
    navigate('/profile/john');
  };
  
  const goBack = () => {
    navigate(-1);  // Quay lại trang trước
  };
}
```

### **2. Link components:**
```tsx
import { Link } from 'react-router-dom';

<Link to="/marketplace">Đi đến Chợ</Link>
<Link to={`/product/${productId}`}>Xem sản phẩm</Link>
```

### **3. Get URL params:**
```tsx
import { useParams } from 'react-router-dom';

function ProductDetailPage() {
  const { id } = useParams();  // Từ URL: /product/123 → id = "123"
}
```

### **4. Get search params:**
```tsx
import { useSearchParams } from 'react-router-dom';

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');  // Từ URL: /search?q=laptop → query = "laptop"
}
```

### **5. Check current location:**
```tsx
import { useLocation } from 'react-router-dom';

function MyComponent() {
  const location = useLocation();
  const isActive = location.pathname === '/home';
}
```

---

## 🔄 Migration từ old code

### **OLD (Props-based):**
```tsx
interface PageProps {
  currentUser: User;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

function HomePage({ currentUser, onNavigate, onLogout }: PageProps) {
  return (
    <button onClick={() => onNavigate('profile')}>
      Go to Profile
    </button>
  );
}
```

### **NEW (Hooks-based):**
```tsx
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const { user, logout } = useAuth();  // Get from context
  const navigate = useNavigate();
  
  return (
    <button onClick={() => navigate('/profile')}>
      Go to Profile
    </button>
  );
}
```

---

## 🧪 Test Routing

### **1. Start frontend:**
```bash
cd frontend
npm run dev
```

### **2. Test các URLs:**
- `http://localhost:3000/` → Redirect to `/home` (nếu đã login) hoặc `/login`
- `http://localhost:3000/login` → Login page
- `http://localhost:3000/register` → Register page
- `http://localhost:3000/home` → Home page (cần login)
- `http://localhost:3000/marketplace` → Marketplace (cần login)
- `http://localhost:3000/seller/dashboard` → Seller dashboard (cần SELLER role)
- `http://localhost:3000/admin/dashboard` → Admin (cần ADMIN role)

### **3. Test Protected Routes:**
1. Chưa login → Vào `/home` → Tự động redirect về `/login`
2. Login xong → Tự động redirect về `/home`
3. Login rồi → Vào `/seller/dashboard` nhưng không phải seller → Redirect về `/home`

### **4. Test Browser Features:**
- ✅ Back/Forward buttons hoạt động
- ✅ Bookmark URLs
- ✅ Share links
- ✅ F5 refresh giữ nguyên trang

---

## ⚡ Context Providers

App được wrap bởi 3 providers:
```tsx
<AuthProvider>      {/* Quản lý authentication */}
  <CartProvider>    {/* Quản lý giỏ hàng */}
    <BrowserRouter> {/* Quản lý routing */}
      <App />
    </BrowserRouter>
  </CartProvider>
</AuthProvider>
```

### **Sử dụng Contexts:**
```tsx
import { useAuth } from './contexts/AuthContext';
import { useCart } from './contexts/CartContext';

function MyComponent() {
  const { user, login, logout } = useAuth();
  const { cart, addToCart, cartItemCount } = useCart();
}
```

---

## 🚨 Breaking Changes

### **Components cần update:**
Tất cả page components sẽ không còn nhận props sau đây:
- ❌ `currentUser` → Dùng `useAuth().user`
- ❌ `onNavigate` → Dùng `useNavigate()`
- ❌ `onLogout` → Dùng `useAuth().logout()`
- ❌ `cart` → Dùng `useCart().cart`
- ❌ `onAddToCart` → Dùng `useCart().addToCart()`
- ❌ `cartItemCount` → Dùng `useCart().cartItemCount`

---

## 📝 TODO: Update còn lại

Các page components sau vẫn dùng props cũ, cần refactor:
- [ ] HomePage
- [ ] ProfilePage
- [ ] MarketplacePage
- [ ] ProductDetailPage
- [ ] CartPage
- [ ] CheckoutPage
- [ ] MessagesPage
- [ ] NotificationsPage
- [ ] SellerDashboard
- [ ] ProductManagementPage
- [ ] OrderManagementPage
- [ ] AddProductPage
- [ ] Và tất cả các pages khác...

**Cách refactor:**
1. Remove props interface
2. Add hooks: `useAuth()`, `useCart()`, `useNavigate()`
3. Replace `onNavigate('page')` → `navigate('/page')`
4. Replace `currentUser` → `user`
5. Replace `onLogout()` → `logout()`

---

## 🎉 Benefits

✅ **URL-based routing** - URLs thay đổi theo page  
✅ **Browser history** - Back/forward buttons hoạt động  
✅ **Bookmarkable** - Share links được  
✅ **Protected routes** - Auto redirect chưa login  
✅ **Role-based access** - Kiểm tra permissions  
✅ **Better UX** - Loading states, redirects  
✅ **SEO friendly** - Mỗi page có URL riêng  

---

**Routing đã sẵn sàng! Giờ cần update các page components để dùng hooks thay vì props.** 🚀
