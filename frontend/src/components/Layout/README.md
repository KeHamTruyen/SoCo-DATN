# Layout Components

Hệ thống Layout components được tạo để đồng bộ Header, Footer và Mobile Navigation cho toàn bộ ứng dụng.

## 📁 Components

### 1. **Header.tsx**
Header chính của ứng dụng với 2 variants:

#### **Variant: default** (Full Header)
- Logo "Social Commerce" (click để về home)
- Navigation links (Marketplace, Nhóm)
- Search bar (responsive)
- Notifications (NotificationCenter)
- Messages icon với unread count
- Cart icon với item count
- User menu dropdown
  - Avatar
  - Profile info
  - Quick links (Profile, Settings)
  - Seller-specific menu (Dashboard, Store, Schedule Posts)
  - Buyer: "Trở thành người bán" button
  - Admin: "Quản trị hệ thống" link
  - Logout

#### **Variant: simple** (Minimal Header)
- Back button với custom label
- Centered title
- No search, no icons

#### **Usage:**
```tsx
import { Header } from './components/Layout';

<Header
  currentUser={user}
  onNavigate={handleNavigate}
  onLogout={handleLogout}
  cartItemCount={5}
  showSearch={true}
  variant="default"
/>

// Simple header
<Header
  currentUser={user}
  onNavigate={handleNavigate}
  onLogout={handleLogout}
  variant="simple"
  title="Chi tiết sản phẩm"
  backButton={{
    show: true,
    onClick: () => navigate('home'),
    label: 'Quay lại'
  }}
/>
```

---

### 2. **Footer.tsx**
Footer đầy đủ thông tin với 4 cột:

#### **Sections:**
1. **Company Info**
   - Logo và description
   - Social media links (Facebook, Twitter, Instagram, YouTube)

2. **Quick Links**
   - Marketplace
   - Groups
   - Become Seller
   - About us
   - News

3. **Support**
   - Help center
   - FAQ
   - Shipping policy
   - Return policy
   - Terms of service
   - Privacy policy

4. **Contact**
   - Address (with MapPin icon)
   - Phone number
   - Email
   - App download buttons (Google Play, App Store)

#### **Bottom Bar:**
- Copyright notice
- Payment methods (Visa, Mastercard, COD)

#### **Usage:**
```tsx
import { Footer } from './components/Layout';

<Footer onNavigate={handleNavigate} />
```

---

### 3. **MobileNav.tsx**
Bottom navigation bar cho mobile (ẩn trên desktop lg+)

#### **Navigation Items:**
1. **Home** - Trang chủ
2. **Shopping Bag** - Marketplace
3. **Search** - Tìm kiếm
4. **Store** - Cửa hàng (seller) hoặc "Bán hàng" (buyer)
5. **User** - Trang cá nhân

#### **Features:**
- Active state highlighting (blue color)
- Icon + label
- Responsive to user role (buyer vs seller)
- Safe area bottom padding (for notch devices)

#### **Usage:**
```tsx
import { MobileNav } from './components/Layout';

<MobileNav
  currentUser={user}
  onNavigate={handleNavigate}
  activePage="home"
/>
```

---

### 4. **PageLayout.tsx**
Wrapper component tích hợp Header + Footer + MobileNav + MessengerWidget

#### **Props:**
```tsx
interface PageLayoutProps {
  children: React.ReactNode;
  currentUser: any;
  onNavigate: (page: string, id?: string) => void;
  onLogout: () => void;
  cartItemCount?: number;
  
  // Header options
  showHeader?: boolean;          // default: true
  headerVariant?: 'default' | 'simple'; // default: 'default'
  headerTitle?: string;
  showSearch?: boolean;          // default: true
  backButton?: {
    show: boolean;
    onClick: () => void;
    label?: string;
  };
  
  // Footer options
  showFooter?: boolean;          // default: true
  
  // Mobile nav
  showMobileNav?: boolean;       // default: true
  activePage?: string;           // default: 'home'
  
  // Messenger widget
  showMessenger?: boolean;       // default: true
  
  // Layout options
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full'; // default: '7xl'
  padding?: boolean;             // default: true
  backgroundColor?: string;      // default: 'bg-gray-50'
}
```

#### **Usage Examples:**

**1. Standard page với tất cả elements:**
```tsx
<PageLayout
  currentUser={currentUser}
  onNavigate={onNavigate}
  onLogout={onLogout}
  cartItemCount={3}
  activePage="home"
>
  {/* Your page content */}
</PageLayout>
```

**2. Product detail page (simple header, no footer):**
```tsx
<PageLayout
  currentUser={currentUser}
  onNavigate={onNavigate}
  onLogout={onLogout}
  cartItemCount={3}
  headerVariant="simple"
  headerTitle="Chi tiết sản phẩm"
  backButton={{
    show: true,
    onClick: () => onNavigate('marketplace'),
    label: 'Quay lại'
  }}
  showFooter={false}
  activePage="marketplace"
>
  {/* Product details */}
</PageLayout>
```

**3. Checkout page (no messenger widget):**
```tsx
<PageLayout
  currentUser={currentUser}
  onNavigate={onNavigate}
  onLogout={onLogout}
  cartItemCount={3}
  showMessenger={false}
  showFooter={false}
  backgroundColor="bg-white"
>
  {/* Checkout form */}
</PageLayout>
```

**4. Modal page (no header, footer, mobile nav):**
```tsx
<PageLayout
  currentUser={currentUser}
  onNavigate={onNavigate}
  onLogout={onLogout}
  showHeader={false}
  showFooter={false}
  showMobileNav={false}
  showMessenger={false}
  maxWidth="md"
  padding={false}
>
  {/* Modal content */}
</PageLayout>
```

---

## 🎨 Design System

### **Colors:**
- Primary: Blue (#2563EB - blue-600)
- Secondary: Purple (#9333EA - purple-600)
- Text: Gray scale
- Background: Gray-50

### **Spacing:**
- Header height: 64px (h-16)
- Mobile nav height: ~72px
- Container max-width: 1280px (max-w-7xl)
- Padding: 16px mobile, 24px tablet, 32px desktop

### **Responsive Breakpoints:**
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

---

## 🔄 Migration Guide

### **Before (Old approach):**
```tsx
export function HomePage({ currentUser, onNavigate, onLogout, cartItemCount, onAddToCart }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header code duplicated */}
      <header className="bg-white border-b...">
        {/* 100+ lines of header code */}
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Your content */}
      </div>

      {/* Mobile nav duplicated */}
      <div className="lg:hidden fixed bottom-0...">
        {/* 50+ lines of mobile nav */}
      </div>

      {/* Messenger widget duplicated */}
      <MessengerWidget currentUser={currentUser} />
    </div>
  );
}
```

### **After (New approach):**
```tsx
import { PageLayout } from './Layout';

export function HomePage({ currentUser, onNavigate, onLogout, cartItemCount, onAddToCart }) {
  return (
    <PageLayout
      currentUser={currentUser}
      onNavigate={onNavigate}
      onLogout={onLogout}
      cartItemCount={cartItemCount}
      activePage="home"
    >
      {/* Just your content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Your page-specific content */}
      </div>
    </PageLayout>
  );
}
```

**Benefits:**
✅ Code reduction: ~150 lines → ~20 lines per page
✅ Consistent UI across all pages
✅ Single source of truth for layout
✅ Easy to update globally
✅ Better maintainability

---

## 📦 Export

All components exported from `index.ts`:

```tsx
export { Header } from './Header';
export { Footer } from './Footer';
export { MobileNav } from './MobileNav';
export { PageLayout } from './PageLayout';
```

**Import examples:**
```tsx
// Individual components
import { Header, Footer } from './components/Layout';

// PageLayout (recommended)
import { PageLayout } from './components/Layout';
```

---

## 🚀 Best Practices

1. **Always use PageLayout** for pages - Don't recreate header/footer manually
2. **Pass activePage prop** - For correct mobile nav highlighting
3. **Use headerVariant="simple"** - For detail pages (product, post, etc.)
4. **Hide footer on modals/checkouts** - For better focus
5. **Adjust maxWidth** - Based on content type (sm for forms, 7xl for feeds)

---

## 🔮 Future Enhancements

- [ ] Breadcrumbs support
- [ ] Loading states
- [ ] Scroll-triggered header collapse
- [ ] Sticky footer (for short pages)
- [ ] Theme switcher (light/dark mode)
- [ ] Internationalization (i18n)

---

**Version:** 1.0.0  
**Last Updated:** February 5, 2024
