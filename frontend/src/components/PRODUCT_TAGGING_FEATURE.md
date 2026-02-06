# 🏷️ Product Tagging Feature

## Tổng quan

Tính năng **Tag Sản phẩm** cho phép seller gắn thẻ (tag) sản phẩm vào bài viết, giúp chuyển đổi từ content thành sales trực tiếp. Người xem có thể click vào sản phẩm được tag để xem chi tiết hoặc mua ngay.

---

## 🎯 Mục đích

1. **Tăng conversion rate**: Chuyển từ engagement → sales
2. **Shopping trực tiếp**: Mua ngay từ bài viết mà không cần tìm kiếm
3. **Content marketing**: Seller có thể kết hợp storytelling với sản phẩm
4. **User experience**: Trải nghiệm mua sắm liền mạch

---

## 📋 Tính năng chính

### 1. **Tag sản phẩm khi tạo bài viết**

#### **Trong CreatePostModal:**
- ✅ Button "Gắn sản phẩm" với counter (hiện số sản phẩm đã chọn)
- ✅ Product selector với search
- ✅ Tối đa 5 sản phẩm/bài viết
- ✅ Preview sản phẩm đã tag
- ✅ Remove sản phẩm đã chọn

#### **UI Components:**
```
┌─────────────────────────────────────┐
│ [Gắn sản phẩm (2)]  ← Button        │
└─────────────────────────────────────┘
          ↓ Click
┌─────────────────────────────────────┐
│ Chọn sản phẩm gắn thẻ    Tối đa 5   │
│ ┌─────────────────────────────────┐ │
│ │ 🔍 Tìm kiếm sản phẩm...         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ ✓ Áo thun nam cotton          │   │
│ │   299,000đ • Kho: 150         │   │
│ └───────────────────────────────┘   │
│ ┌───────────────────────────────┐   │
│ │   Giày sneaker thể thao       │   │
│ │   899,000đ • Kho: 80          │   │
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

### 2. **Preview sản phẩm đã tag**

#### **Hiển thị trước khi post:**
```
┌─────────────────────────────────────────┐
│ 🏷️ Sản phẩm được gắn thẻ        2/5    │
├─────────────────────────────────────────┤
│ ┌───────────────────────────────────┐   │
│ │ [img] Áo thun nam cotton      [X] │   │
│ │       299,000đ • Còn 150 SP       │   │
│ │       🔗 Link sản phẩm            │   │
│ └───────────────────────────────────┘   │
│ ┌───────────────────────────────────┐   │
│ │ [img] Giày sneaker            [X] │   │
│ │       899,000đ • Còn 80 SP        │   │
│ │       🔗 Link sản phẩm            │   │
│ └───────────────────────────────────┘   │
├─────────────────────────────────────────┤
│ 💡 Sản phẩm sẽ hiển thị dưới bài viết   │
│    với link để mua ngay                 │
└─────────────────────────────────────────┘
```

**Features:**
- ✅ Hiển thị image thumbnail (16x16)
- ✅ Product title (line-clamp-1)
- ✅ Price (formatted)
- ✅ Stock count
- ✅ "🔗 Link sản phẩm" badge
- ✅ Remove button (X)
- ✅ Hover effects

---

### 3. **Hiển thị trong Feed**

#### **PostWithProducts Component:**

```
┌────────────────────────────────────────┐
│ [Avatar] Shop Thời Trang Việt ✓       │
│          2 giờ trước                   │
├────────────────────────────────────────┤
│ 🔥 FLASH SALE CUỐI TUẦN!              │
│ Giảm giá đến 50%...                   │
├────────────────────────────────────────┤
│ [Product Image]                        │
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ │
│ │ 🛒 2 sản phẩm trong bài viết       │ │
│ ├────────────────────────────────────┤ │
│ │ ┌──────────────────────────┐       │ │
│ │ │[img] Áo thun nam     [+]│       │ │
│ │ │      299,000đ            │       │ │
│ │ │      Còn 150 • Giao nhanh│       │ │
│ │ └──────────────────────────┘       │ │
│ │ ┌──────────────────────────┐       │ │
│ │ │[img] Giày sneaker    [+]│       │ │
│ │ │      899,000đ            │       │ │
│ │ │      Còn 80 • Giao nhanh │       │ │
│ │ └──────────────────────────┘       │ │
│ └────────────────────────────────────┘ │
├────────────────────────────────────────┤
│ ❤️ 456   💬 89   📤 34                │
└────────────────────────────────────────┘
```

**Interactive Features:**
- ✅ Click product card → Navigate to Product Detail
- ✅ Click [+] button → Add to cart
- ✅ Hover effects (scale image, border color)
- ✅ Gradient background (blue-purple)
- ✅ Stock & delivery info
- ✅ "Xem tất cả" button (if > 2 products)

---

## 🎨 Design System

### **Colors:**
```css
/* Product section background */
background: linear-gradient(to bottom right, #EFF6FF, #FAF5FF);
/* from-blue-50 to-purple-50 */

/* Product card hover */
border-color: #60A5FA; /* blue-400 */

/* Shopping cart icon container */
background: #2563EB; /* blue-600 */

/* Price color */
color: #2563EB; /* blue-600 */

/* Stock/delivery text */
color: #16A34A; /* green-600 */
```

### **Spacing:**
- Product section padding: `12px` (p-3)
- Product card padding: `8px` (p-2)
- Gap between products: `8px` (gap-2)
- Product image size: `64px` (w-16 h-16)

### **Typography:**
- Section title: `text-sm font-medium`
- Product title: `text-sm font-medium line-clamp-1`
- Price: `text-base font-semibold text-blue-600`
- Stock: `text-xs text-gray-500`

---

## 🔧 Implementation

### **1. CreatePostModal.tsx**

```tsx
const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
const [showProductSelector, setShowProductSelector] = useState(false);

// Toggle product selection (max 5)
const handleProductToggle = (productId: string) => {
  if (selectedProducts.includes(productId)) {
    setSelectedProducts(selectedProducts.filter(id => id !== productId));
  } else {
    if (selectedProducts.length < 5) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      alert('Tối đa 5 sản phẩm cho mỗi bài viết!');
    }
  }
};

// Submit with tagged products
const handleSubmit = () => {
  const post = {
    content,
    products: selectedProducts, // ← Tagged product IDs
    scheduled: schedulePost ? scheduledDate : null,
    createdAt: new Date().toISOString()
  };
  onSubmit(post);
  onClose();
};
```

### **2. PostWithProducts.tsx**

```tsx
interface Post {
  id: string;
  author: { ... };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  taggedProducts?: Product[]; // ← Tagged products
}

export function PostWithProducts({ post, onNavigate, onLike, onAddToCart }) {
  return (
    <div>
      {/* Post header, content, image... */}
      
      {/* Tagged Products Section */}
      {post.taggedProducts && post.taggedProducts.length > 0 && (
        <div className="tagged-products-section">
          {post.taggedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onNavigate('product-detail', product.id)}
              onAddToCart={() => onAddToCart(product)}
            />
          ))}
        </div>
      )}
      
      {/* Like, Comment, Share buttons... */}
    </div>
  );
}
```

### **3. HomePage.tsx**

```tsx
import { PostWithProducts } from './PostWithProducts';

// Sample post with tagged products
<PostWithProducts
  post={{
    id: 'post-1',
    author: { ... },
    content: '🔥 FLASH SALE CUỐI TUẦN! ...',
    taggedProducts: [
      {
        id: '1',
        title: 'Áo thun nam cotton cao cấp',
        price: 299000,
        image: '...',
        stock: 150
      },
      {
        id: '2',
        title: 'Giày sneaker thể thao',
        price: 899000,
        image: '...',
        stock: 80
      }
    ]
  }}
  onNavigate={onNavigate}
  onLike={handleLike}
  onAddToCart={onAddToCart}
/>
```

---

## 📊 User Flows

### **Flow 1: Seller tạo bài viết với tagged products**

```
1. Click "Bạn đang nghĩ gì?" button
   ↓
2. Viết nội dung bài viết
   ↓
3. Click "Gắn sản phẩm"
   ↓
4. Search sản phẩm (nếu cần)
   ↓
5. Click chọn sản phẩm (max 5)
   ↓
6. Review preview sản phẩm đã chọn
   ↓
7. Click "Đăng bài"
   ↓
8. Post hiển thị trong feed với products tagged
```

### **Flow 2: Buyer tương tác với post có tagged products**

```
1. Scroll feed, thấy post có tagged products
   ↓
2. Đọc content & xem products
   ↓
   ┌────────────┬────────────┐
   │            │            │
   ▼            ▼            ▼
Click        Click        Click
product      [+] Add      Like/Comment
card         to Cart      
   │            │            │
   ▼            ▼            ▼
Product      Cart         Engagement
Detail       Updated      +1
Page                      
```

---

## 🎯 Business Impact

### **Benefits for Sellers:**
- ✅ **Higher conversion**: Shorten buyer journey
- ✅ **Content marketing**: Storytelling + products
- ✅ **Cross-selling**: Tag multiple products
- ✅ **Engagement**: More interactions

### **Benefits for Buyers:**
- ✅ **Convenience**: Buy directly from post
- ✅ **Discovery**: Find products through content
- ✅ **Context**: Understand product usage
- ✅ **Trust**: See product in real scenarios

### **Platform Benefits:**
- ✅ **GMV increase**: More transactions
- ✅ **Session time**: Users stay longer
- ✅ **Content quality**: Sellers create better content
- ✅ **Network effect**: More sellers = more content

---

## 📈 Metrics to Track

### **Engagement Metrics:**
- Product tag rate (% posts with tagged products)
- Average products per post
- Click-through rate on tagged products
- Add-to-cart rate from tagged products

### **Conversion Metrics:**
- Purchase rate from tagged products
- Revenue from tagged products
- Average order value (tagged vs non-tagged)
- Conversion funnel (view → click → cart → purchase)

### **Content Metrics:**
- Posts with products: Like/Comment rate
- Posts without products: Like/Comment rate
- Comparison: Tagged vs regular posts

---

## 🚀 Future Enhancements

### **Phase 1 (Current):** ✅
- [x] Basic product tagging (max 5)
- [x] Search products
- [x] Preview tagged products
- [x] Display in feed
- [x] Add to cart from post

### **Phase 2:**
- [ ] **Product positioning on image**: Tag products directly on photo (Instagram style)
- [ ] **Auto-suggest products**: AI suggests products based on content
- [ ] **Product collections**: Create collections to tag
- [ ] **Price drop alerts**: Notify followers when tagged product on sale

### **Phase 3:**
- [ ] **Live shopping**: Tag products in live streams
- [ ] **Affiliate tagging**: Tag products from other sellers (commission)
- [ ] **Product bundles**: Tag pre-made bundles
- [ ] **AR try-on**: Virtual try-on for tagged products

### **Phase 4:**
- [ ] **Shoppable videos**: Tag products in videos (TikTok style)
- [ ] **Dynamic pricing**: Show personalized prices
- [ ] **Inventory sync**: Real-time stock updates
- [ ] **One-click checkout**: Buy without leaving feed

---

## 🐛 Edge Cases & Handling

### **1. Product out of stock:**
```tsx
{product.stock === 0 ? (
  <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs">
    Hết hàng
  </span>
) : (
  <button onClick={onAddToCart}>Thêm vào giỏ</button>
)}
```

### **2. Product deleted:**
```tsx
{post.taggedProducts.filter(p => p.status === 'active').map(...)}
```

### **3. Max 5 products:**
```tsx
if (selectedProducts.length >= 5) {
  toast.error('Tối đa 5 sản phẩm cho mỗi bài viết!');
  return;
}
```

### **4. Seller-only feature:**
```tsx
{currentUser.role === 'seller' && (
  <button onClick={() => setShowProductSelector(true)}>
    Gắn sản phẩm
  </button>
)}
```

---

## 📱 Responsive Design

### **Desktop (≥1024px):**
- Product cards: Full width with image left, info center, button right
- Show all products (no "View all" button needed)
- Hover effects enabled

### **Tablet (768px - 1023px):**
- Product cards: Slightly smaller
- Product title: 1 line truncate
- Button text: "Thêm"

### **Mobile (<768px):**
- Product cards: Stack vertically
- Image: 64px → 56px
- Button: Icon only
- Show max 2 products + "Xem tất cả" button

---

## 🎨 Visual Examples

### **CreatePostModal - Product Selector:**
![Product Selector](screenshot-placeholder.png)

### **Feed - Post with Tagged Products:**
![Post with Products](screenshot-placeholder.png)

### **Mobile View:**
![Mobile View](screenshot-placeholder.png)

---

## 🔗 Related Files

- `/components/CreatePostModal.tsx` - Tag products UI
- `/components/PostWithProducts.tsx` - Display tagged products
- `/components/HomePage.tsx` - Feed with tagged posts
- `/components/PRODUCT_TAGGING_FEATURE.md` - This file

---

**Version:** 1.0.0  
**Last Updated:** February 5, 2024  
**Status:** ✅ Implemented
