# Social Commerce Database Documentation

## 📋 Tổng quan

Database PostgreSQL cho ứng dụng Social Commerce với mô hình "buyer-to-seller". Bao gồm 30+ tables với đầy đủ tính năng:

- ✅ User authentication & 2FA
- ✅ Seller verification (3-step process)
- ✅ Product catalog & inventory
- ✅ Shopping cart & orders
- ✅ Social feed (posts, likes, comments)
- ✅ Real-time messaging
- ✅ Notifications
- ✅ Scheduled posts
- ✅ Groups & communities
- ✅ Reviews & ratings
- ✅ Analytics & seller stats

---

## 🚀 Cách sử dụng

### 1. Tạo Database

```bash
# Tạo database PostgreSQL
createdb social_commerce

# Hoặc qua psql
psql -U postgres
CREATE DATABASE social_commerce;
\q
```

### 2. Chạy Schema

```bash
# Import schema
psql -U postgres -d social_commerce -f database/schema.sql

# Hoặc
psql -U postgres social_commerce < database/schema.sql
```

### 3. Import Sample Data (Optional)

```bash
# Import sample data để test
psql -U postgres -d social_commerce -f database/seed.sql
```

---

## 📊 Database Structure

### **Core Tables**

#### **Users & Authentication**
- `users` - User accounts (buyer/seller/admin)
- `two_factor_auth` - 2FA settings
- `password_reset_tokens` - Password reset tokens

#### **Seller Verification**
- `seller_verifications` - 3-step verification process
  - Step 1: Personal information + ID card
  - Step 2: Business information
  - Step 3: Bank account

#### **Products**
- `products` - Product catalog
- `product_images` - Product images (multiple per product)
- `product_variants` - Size, color variants
- `categories` - Hierarchical categories

#### **Shopping & Orders**
- `carts` - Shopping carts
- `cart_items` - Cart items
- `orders` - Customer orders
- `order_items` - Order line items

#### **Social Feed**
- `posts` - Social posts with products
- `post_likes` - Post likes
- `post_comments` - Comments (with nesting)
- `scheduled_posts` - Scheduled posts for future

#### **Messaging**
- `conversations` - Chat conversations
- `conversation_participants` - Participants in conversations
- `messages` - Messages with media support

#### **Social Features**
- `follows` - User following relationships
- `groups` - Communities/groups
- `group_members` - Group membership
- `notifications` - Real-time notifications
- `reviews` - Product reviews & ratings

#### **Analytics**
- `product_views` - Product view tracking
- `seller_stats` - Daily seller statistics
- `ai_content_history` - AI-generated content log

---

## 🔑 Key Features

### **1. Role-Based Access**

```sql
-- Roles: buyer, seller, admin
-- Email-based admin detection (email contains 'admin')
-- Email-based seller detection (email contains 'seller')
```

### **2. Seller Verification Process**

```sql
SELECT 
    step1_completed,  -- ID card verification
    step2_completed,  -- Business license
    step3_completed,  -- Bank account
    status            -- pending/reviewing/approved/rejected
FROM seller_verifications
WHERE user_id = '...';
```

### **3. Product Management**

```sql
-- Products with variants, images, inventory tracking
SELECT p.*, 
       array_agg(pi.image_url) as images,
       count(pv.id) as variant_count
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
LEFT JOIN product_variants pv ON p.id = pv.product_id
GROUP BY p.id;
```

### **4. Social Feed**

```sql
-- Posts with engagement metrics
SELECT p.*,
       u.full_name as author_name,
       u.avatar_url as author_avatar,
       COUNT(DISTINCT pl.id) as likes_count,
       COUNT(DISTINCT pc.id) as comments_count
FROM posts p
JOIN users u ON p.author_id = u.id
LEFT JOIN post_likes pl ON p.id = pl.post_id
LEFT JOIN post_comments pc ON p.id = pc.post_id
WHERE p.status = 'published'
GROUP BY p.id, u.full_name, u.avatar_url
ORDER BY p.created_at DESC;
```

### **5. Real-time Messaging**

```sql
-- Get user conversations with last message
SELECT c.*,
       m.content as last_message,
       m.created_at as last_message_at,
       COUNT(CASE WHEN m.is_read = false AND m.sender_id != '...' THEN 1 END) as unread_count
FROM conversations c
JOIN conversation_participants cp ON c.id = cp.conversation_id
LEFT JOIN LATERAL (
    SELECT * FROM messages 
    WHERE conversation_id = c.id 
    ORDER BY created_at DESC 
    LIMIT 1
) m ON true
WHERE cp.user_id = '...'
GROUP BY c.id, m.content, m.created_at;
```

---

## 🔍 Common Queries

### **Get User Profile with Stats**

```sql
SELECT 
    u.*,
    COUNT(DISTINCT f1.follower_id) as followers_count,
    COUNT(DISTINCT f2.following_id) as following_count,
    COUNT(DISTINCT p.id) as products_count,
    COUNT(DISTINCT po.id) as posts_count
FROM users u
LEFT JOIN follows f1 ON u.id = f1.following_id
LEFT JOIN follows f2 ON u.id = f2.follower_id
LEFT JOIN products p ON u.id = p.seller_id AND p.status = 'active'
LEFT JOIN posts po ON u.id = po.author_id AND po.status = 'published'
WHERE u.id = '...'
GROUP BY u.id;
```

### **Get Seller Dashboard Stats**

```sql
SELECT 
    COUNT(DISTINCT o.id) as total_orders,
    SUM(oi.total_price) as total_revenue,
    COUNT(DISTINCT p.id) as total_products,
    AVG(r.rating) as avg_rating,
    COUNT(DISTINCT f.follower_id) as total_followers
FROM users u
LEFT JOIN order_items oi ON u.id = oi.seller_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('completed', 'delivered')
LEFT JOIN products p ON u.id = p.seller_id AND p.status = 'active'
LEFT JOIN reviews r ON p.id = r.product_id AND r.is_published = true
LEFT JOIN follows f ON u.id = f.following_id
WHERE u.id = '...'
GROUP BY u.id;
```

### **Get Product Feed with Seller Info**

```sql
SELECT 
    p.*,
    u.full_name as seller_name,
    u.avatar_url as seller_avatar,
    u.is_verified as seller_verified,
    (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image,
    AVG(r.rating) as avg_rating,
    COUNT(r.id) as review_count
FROM products p
JOIN users u ON p.seller_id = u.id
LEFT JOIN reviews r ON p.id = r.product_id AND r.is_published = true
WHERE p.status = 'active'
GROUP BY p.id, u.full_name, u.avatar_url, u.is_verified
ORDER BY p.created_at DESC;
```

---

## 🔐 Security Features

1. **Password Hashing** - Use bcrypt with salt rounds ≥ 10
2. **UUID Primary Keys** - Prevent enumeration attacks
3. **Soft Delete Support** - Use `is_active` flags
4. **Cascading Deletes** - Proper ON DELETE constraints
5. **Unique Constraints** - Prevent duplicate data
6. **Check Constraints** - Validate data integrity

---

## 📈 Indexes

Các indexes quan trọng đã được tạo sẵn cho:

- User lookups (email, username)
- Product searches (seller, category, status)
- Order queries (buyer, seller, status)
- Social feed (author, created_at)
- Messages (conversation, sender)
- Notifications (user, created_at)

---

## 🔄 Triggers

### **Auto-update `updated_at`**

```sql
-- Tự động cập nhật updated_at khi record thay đổi
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 📊 Views

### **seller_dashboard_overview**
Tổng quan dashboard cho seller

### **products_with_stats**
Products với đầy đủ stats (rating, reviews, seller info)

---

## 🛠️ Maintenance

### **Backup Database**

```bash
pg_dump -U postgres social_commerce > backup_$(date +%Y%m%d).sql
```

### **Restore Database**

```bash
psql -U postgres social_commerce < backup_20240204.sql
```

### **Vacuum & Analyze**

```sql
VACUUM ANALYZE;
```

---

## 🌱 Sample Data

File `seed.sql` bao gồm:

- ✅ 6 users (1 admin, 3 sellers, 2 buyers)
- ✅ 5 categories with subcategories
- ✅ 9 products across different categories
- ✅ Product images
- ✅ 3 posts with engagement
- ✅ 3 groups with members
- ✅ Sample conversations & messages
- ✅ Notifications
- ✅ Reviews
- ✅ Scheduled posts
- ✅ Seller statistics (7 days)

### **Sample Login Credentials**

```
Admin:
Email: admin@socialcommerce.vn
Role: admin

Sellers:
Email: seller1@gmail.com (Nguyễn Thị Thu Hà - Fashion)
Email: seller2@gmail.com (Trần Văn Minh - Electronics)
Email: seller3@gmail.com (Lê Thị Mai - Home Decor)

Buyers:
Email: buyer1@gmail.com (Nguyễn Văn An)
Email: buyer2@gmail.com (Phạm Thùy Linh)

Note: Password hash cần generate thật qua bcrypt
```

---

## 📚 ERD (Entity Relationship)

```
users
  ├─ two_factor_auth
  ├─ seller_verifications
  ├─ products
  │   ├─ product_images
  │   ├─ product_variants
  │   └─ reviews
  ├─ carts
  │   └─ cart_items
  ├─ orders (buyer)
  │   └─ order_items (seller)
  ├─ posts
  │   ├─ post_likes
  │   └─ post_comments
  ├─ scheduled_posts
  ├─ messages
  ├─ notifications
  ├─ follows (follower/following)
  ├─ group_members
  └─ seller_stats
```

---

## 🔮 Future Enhancements

Các tính năng có thể mở rộng:

- [ ] Wishlist/Saved items
- [ ] Coupons & promotions
- [ ] Shipping providers integration
- [ ] Payment gateway tables
- [ ] Product comparison
- [ ] Live streaming sessions
- [ ] Affiliate program
- [ ] Points & rewards system

---

## 📞 Support

Nếu cần hỗ trợ về database structure hoặc queries, hãy tham khảo:

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- SQL Performance Tips: Sử dụng EXPLAIN ANALYZE
- Index Optimization: Check slow queries với pg_stat_statements

---

**Created for Social Commerce Platform**  
Database Version: 1.0.0  
PostgreSQL Version: 14+
