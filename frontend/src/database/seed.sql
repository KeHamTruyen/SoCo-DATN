-- =====================================================
-- SOCIAL COMMERCE DATABASE - SAMPLE DATA
-- =====================================================

-- =====================================================
-- SAMPLE USERS
-- =====================================================

-- Admin User
INSERT INTO users (id, email, username, password_hash, full_name, phone, avatar_url, bio, role, is_verified, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@socialcommerce.vn', 'admin', '$2b$10$YourHashedPasswordHere', 'Quản trị viên', '0901234567', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'System Administrator', 'admin', true, NOW() - INTERVAL '6 months');

-- Seller Users
INSERT INTO users (id, email, username, password_hash, full_name, phone, avatar_url, bio, role, is_verified, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'seller1@gmail.com', 'fashionista_vn', '$2b$10$YourHashedPasswordHere', 'Nguyễn Thị Thu Hà', '0912345678', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 'Chuyên thời trang nữ cao cấp 👗 | Ship toàn quốc 🚚', 'seller', true, NOW() - INTERVAL '4 months'),
('550e8400-e29b-41d4-a716-446655440003', 'seller2@gmail.com', 'techgear_pro', '$2b$10$YourHashedPasswordHere', 'Trần Văn Minh', '0923456789', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'Đồ công nghệ chính hãng 💻 | Bảo hành 12 tháng ⚡', 'seller', true, NOW() - INTERVAL '3 months'),
('550e8400-e29b-41d4-a716-446655440004', 'seller3@gmail.com', 'homedeco_hcm', '$2b$10$YourHashedPasswordHere', 'Lê Thị Mai', '0934567890', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 'Nội thất trang trí nhà cửa 🏠 | HCM', 'seller', true, NOW() - INTERVAL '2 months');

-- Buyer Users
INSERT INTO users (id, email, username, password_hash, full_name, phone, avatar_url, bio, role, is_verified, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'buyer1@gmail.com', 'anhnguyen', '$2b$10$YourHashedPasswordHere', 'Nguyễn Văn An', '0945678901', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400', 'Yêu thời trang & công nghệ', 'buyer', true, NOW() - INTERVAL '2 months'),
('550e8400-e29b-41d4-a716-446655440006', 'buyer2@gmail.com', 'thuylinh', '$2b$10$YourHashedPasswordHere', 'Phạm Thùy Linh', '0956789012', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', 'Đam mê shopping 🛍️', 'buyer', true, NOW() - INTERVAL '1 month');

-- =====================================================
-- CATEGORIES
-- =====================================================

INSERT INTO categories (id, name, slug, description, icon_url, display_order) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Thời trang', 'thoi-trang', 'Quần áo, giày dép, phụ kiện', '👗', 1),
('650e8400-e29b-41d4-a716-446655440002', 'Điện tử', 'dien-tu', 'Điện thoại, laptop, phụ kiện công nghệ', '📱', 2),
('650e8400-e29b-41d4-a716-446655440003', 'Nội thất', 'noi-that', 'Đồ trang trí, nội thất nhà cửa', '🏠', 3),
('650e8400-e29b-41d4-a716-446655440004', 'Mỹ phẩm', 'my-pham', 'Skincare, makeup, nước hoa', '💄', 4),
('650e8400-e29b-41d4-a716-446655440005', 'Thể thao', 'the-thao', 'Dụng cụ thể thao, quần áo gym', '⚽', 5);

-- Sub-categories
INSERT INTO categories (id, name, slug, description, parent_id, display_order) VALUES
('650e8400-e29b-41d4-a716-446655440011', 'Áo nữ', 'ao-nu', 'Áo sơ mi, áo thun, áo khoác nữ', '650e8400-e29b-41d4-a716-446655440001', 1),
('650e8400-e29b-41d4-a716-446655440012', 'Váy đầm', 'vay-dam', 'Váy dạ hội, váy công sở', '650e8400-e29b-41d4-a716-446655440001', 2),
('650e8400-e29b-41d4-a716-446655440013', 'Điện thoại', 'dien-thoai', 'Smartphone các hãng', '650e8400-e29b-41d4-a716-446655440002', 1),
('650e8400-e29b-41d4-a716-446655440014', 'Laptop', 'laptop', 'Laptop gaming, văn phòng', '650e8400-e29b-41d4-a716-446655440002', 2);

-- =====================================================
-- PRODUCTS
-- =====================================================

-- Fashion Products (Seller 1)
INSERT INTO products (id, seller_id, category_id, title, slug, description, price, compare_at_price, sku, stock_quantity, status, published_at, created_at) VALUES
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440012', 'Váy Maxi Hoa Nhí Vintage', 'vay-maxi-hoa-nhi-vintage', 'Váy maxi dáng dài phối họa tiết hoa nhí vintage cực xinh. Chất vải lụa mềm mại, thoáng mát. Thích hợp đi biển, dạo phố.', 450000, 650000, 'DRESS001', 50, 'active', NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440011', 'Áo Sơ Mi Trắng Công Sở', 'ao-so-mi-trang-cong-so', 'Áo sơ mi trắng form chuẩn công sở, chất vải cotton cao cấp không nhăn. Thiết kế thanh lịch, sang trọng.', 280000, 350000, 'SHIRT001', 100, 'active', NOW() - INTERVAL '3 weeks', NOW() - INTERVAL '3 weeks'),
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440011', 'Set Đồ Thể Thao Nữ', 'set-do-the-thao-nu', 'Bộ đồ tập gym, yoga 2 món gồm áo bra và quần legging. Chất liệu thun co giãn 4 chiều, thấm hút mồ hôi tốt.', 320000, 450000, 'SPORT001', 80, 'active', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks');

-- Electronics Products (Seller 2)
INSERT INTO products (id, seller_id, category_id, title, slug, description, price, compare_at_price, sku, stock_quantity, status, published_at, created_at) VALUES
('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440013', 'iPhone 15 Pro Max 256GB', 'iphone-15-pro-max-256gb', 'iPhone 15 Pro Max chính hãng VN/A. Bảo hành 12 tháng tại Apple. Chip A17 Pro, Camera 48MP, Titan Design.', 32990000, 34990000, 'IP15PM256', 20, 'active', NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440014', 'MacBook Air M2 13 inch', 'macbook-air-m2-13-inch', 'MacBook Air M2 2023 Chính hãng Apple Việt Nam. RAM 8GB, SSD 256GB. Màn hình Retina 13.6 inch.', 27990000, 29990000, 'MBAM2256', 15, 'active', NOW() - INTERVAL '3 weeks', NOW() - INTERVAL '3 weeks'),
('750e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', 'Tai nghe AirPods Pro 2', 'tai-nghe-airpods-pro-2', 'AirPods Pro thế hệ 2 với chip H2, chống ồn chủ động 2x tốt hơn. Sạc MagSafe, kháng nước IPX4.', 6490000, 6990000, 'APP2023', 50, 'active', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks');

-- Home Decor Products (Seller 3)
INSERT INTO products (id, seller_id, category_id, title, slug, description, price, compare_at_price, sku, stock_quantity, status, published_at, created_at) VALUES
('750e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440003', 'Đèn Ngủ Để Bàn Hiện Đại', 'den-ngu-de-ban-hien-dai', 'Đèn ngủ LED để bàn thiết kế tối giản Bắc Âu. 3 chế độ ánh sáng, điều chỉnh độ sáng. Tiết kiệm điện.', 250000, 350000, 'LAMP001', 60, 'active', NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('750e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440003', 'Gương Trang Điểm Có Đèn LED', 'guong-trang-diem-co-den-led', 'Gương trang điểm để bàn với đèn LED viền. Xoay 360 độ, phóng to 10x. Sạc USB tiện lợi.', 380000, 500000, 'MIRROR001', 40, 'active', NOW() - INTERVAL '3 weeks', NOW() - INTERVAL '3 weeks'),
('750e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440003', 'Kệ Sách Gỗ 5 Tầng', 'ke-sach-go-5-tang', 'Kệ sách đứng 5 tầng bằng gỗ công nghiệp cao cấp. Thiết kế chắc chắn, lắp ráp dễ dàng. Kích thước: 60x30x180cm.', 850000, 1200000, 'SHELF001', 25, 'active', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks');

-- =====================================================
-- PRODUCT IMAGES
-- =====================================================

INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary) VALUES
-- Váy Maxi
('750e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800', 'Váy Maxi Hoa Nhí - Ảnh chính', 0, true),
('750e8400-e29b-41d4-a716-446655440001', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800', 'Váy Maxi Hoa Nhí - Chi tiết', 1, false),

-- Áo Sơ Mi
('750e8400-e29b-41d4-a716-446655440002', 'https://images.unsplash.com/photo-1589992281258-4c8e0f72b32e?w=800', 'Áo Sơ Mi Trắng', 0, true),

-- Set Thể Thao
('750e8400-e29b-41d4-a716-446655440003', 'https://images.unsplash.com/photo-1518459384831-f5c0c82574cc?w=800', 'Set Đồ Thể Thao', 0, true),

-- iPhone
('750e8400-e29b-41d4-a716-446655440004', 'https://images.unsplash.com/photo-1696446702883-e2079167c5b8?w=800', 'iPhone 15 Pro Max', 0, true),

-- MacBook
('750e8400-e29b-41d4-a716-446655440005', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', 'MacBook Air M2', 0, true),

-- AirPods
('750e8400-e29b-41d4-a716-446655440006', 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800', 'AirPods Pro 2', 0, true),

-- Đèn Ngủ
('750e8400-e29b-41d4-a716-446655440007', 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800', 'Đèn Ngủ Để Bàn', 0, true),

-- Gương
('750e8400-e29b-41d4-a716-446655440008', 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800', 'Gương Trang Điểm LED', 0, true),

-- Kệ Sách
('750e8400-e29b-41d4-a716-446655440009', 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800', 'Kệ Sách Gỗ', 0, true);

-- =====================================================
-- FOLLOWS
-- =====================================================

INSERT INTO follows (follower_id, following_id, created_at) VALUES
-- Buyers follow sellers
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '1 month'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '3 weeks'),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '2 weeks'),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440004', NOW() - INTERVAL '1 week');

-- =====================================================
-- POSTS
-- =====================================================

INSERT INTO posts (id, author_id, content, media_urls, media_type, product_id, likes_count, comments_count, status, published_at, created_at) VALUES
('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Váy mới về rồi các nàng ơi! 🌸 Form dáng siêu đẹp, chất vải mát mẻ. Thích hợp mặc đi biển hoặc dạo phố cuối tuần. Còn 50 cái thôi nhé! 💕', ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'], 'image', '750e8400-e29b-41d4-a716-446655440001', 234, 45, 'published', NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week'),

('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'iPhone 15 Pro Max giá tốt nhất thị trường! 📱 Chính hãng VN/A, bảo hành 12 tháng. Free ốp lưng + dán cường lực cao cấp. Inbox ngay để được tư vấn! 🔥', ARRAY['https://images.unsplash.com/photo-1696446702883-e2079167c5b8?w=800'], 'image', '750e8400-e29b-41d4-a716-446655440004', 189, 32, 'published', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

('850e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'Decor phòng ngủ tối giản Bắc Âu 🏠✨ Đèn ngủ LED siêu xinh, 3 chế độ ánh sáng. Giá chỉ 250k, ship toàn quốc! Link shop trong bio nhé 💫', ARRAY['https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800'], 'image', '750e8400-e29b-41d4-a716-446655440007', 156, 28, 'published', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');

-- =====================================================
-- GROUPS
-- =====================================================

INSERT INTO groups (id, name, slug, description, cover_image_url, avatar_url, privacy, created_by, members_count, created_at) VALUES
('950e8400-e29b-41d4-a716-446655440001', 'Cộng đồng Thời trang Việt', 'cong-dong-thoi-trang-viet', 'Nơi chia sẻ phong cách thời trang, xu hướng mới nhất. Review sản phẩm thật, giá tốt!', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400', 'public', '550e8400-e29b-41d4-a716-446655440002', 12500, NOW() - INTERVAL '3 months'),

('950e8400-e29b-41d4-a716-446655440002', 'Đam mê Công nghệ', 'dam-me-cong-nghe', 'Thảo luận về công nghệ, điện thoại, laptop. Tư vấn mua sắm, so sánh giá.', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400', 'public', '550e8400-e29b-41d4-a716-446655440003', 8900, NOW() - INTERVAL '2 months'),

('950e8400-e29b-41d4-a716-446655440003', 'Review Sản phẩm', 'review-san-pham', 'Review trung thực các sản phẩm đã mua. Chia sẻ kinh nghiệm shopping online.', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', 'public', '550e8400-e29b-41d4-a716-446655440001', 6700, NOW() - INTERVAL '1 month');

-- =====================================================
-- GROUP MEMBERS
-- =====================================================

INSERT INTO group_members (group_id, user_id, role, joined_at) VALUES
-- Thời trang group
('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'admin', NOW() - INTERVAL '3 months'),
('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'member', NOW() - INTERVAL '2 months'),
('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006', 'member', NOW() - INTERVAL '1 month'),

-- Công nghệ group
('950e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'admin', NOW() - INTERVAL '2 months'),
('950e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'member', NOW() - INTERVAL '1 month'),

-- Review group
('950e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'admin', NOW() - INTERVAL '1 month'),
('950e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', 'member', NOW() - INTERVAL '2 weeks');

-- =====================================================
-- CONVERSATIONS & MESSAGES
-- =====================================================

-- Direct conversation between buyer and seller
INSERT INTO conversations (id, type, created_by, created_at) VALUES
('a50e8400-e29b-41d4-a716-446655440001', 'direct', '550e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '1 week');

INSERT INTO conversation_participants (conversation_id, user_id, role, joined_at, last_read_at) VALUES
('a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'member', NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 hour'),
('a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'member', NOW() - INTERVAL '1 week', NOW() - INTERVAL '2 hours');

INSERT INTO messages (id, conversation_id, sender_id, content, message_type, created_at) VALUES
('b50e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'Chào shop, váy maxi còn size M không ạ?', 'text', NOW() - INTERVAL '1 week'),
('b50e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Dạ chào bạn, vẫn còn size M nhé! Bạn cần shop tư vấn thêm không ạ?', 'text', NOW() - INTERVAL '1 week' + INTERVAL '5 minutes'),
('b50e8400-e29b-41d4-a716-446655440003', 'a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'Vâng, mình cao 1m60 nặng 50kg thì mặc vừa không shop?', 'text', NOW() - INTERVAL '1 week' + INTERVAL '10 minutes'),
('b50e8400-e29b-41d4-a716-446655440004', 'a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Size M sẽ rất vừa vặn với số đo của bạn ạ! Váy có độ co giãn nhẹ nên mặc rất thoải mái nhé 😊', 'text', NOW() - INTERVAL '1 week' + INTERVAL '12 minutes');

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

INSERT INTO notifications (user_id, type, title, message, related_user_id, related_product_id, action_url, is_read, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'new_follower', 'Người theo dõi mới', 'Nguyễn Văn An đã bắt đầu theo dõi bạn', '550e8400-e29b-41d4-a716-446655440005', null, '/profile/550e8400-e29b-41d4-a716-446655440005', true, NOW() - INTERVAL '1 week'),

('550e8400-e29b-41d4-a716-446655440002', 'product_liked', 'Sản phẩm được yêu thích', 'Phạm Thùy Linh đã thích sản phẩm "Váy Maxi Hoa Nhí Vintage"', '550e8400-e29b-41d4-a716-446655440006', '750e8400-e29b-41d4-a716-446655440001', '/product/750e8400-e29b-41d4-a716-446655440001', false, NOW() - INTERVAL '2 days'),

('550e8400-e29b-41d4-a716-446655440005', 'new_message', 'Tin nhắn mới', 'Nguyễn Thị Thu Hà đã trả lời tin nhắn của bạn', '550e8400-e29b-41d4-a716-446655440002', null, '/messages/a50e8400-e29b-41d4-a716-446655440001', false, NOW() - INTERVAL '1 day');

-- =====================================================
-- REVIEWS
-- =====================================================

INSERT INTO reviews (id, product_id, user_id, rating, title, content, images, is_verified_purchase, created_at) VALUES
('c50e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 5, 'Váy đẹp, chất vải tốt!', 'Mình đã mua và rất hài lòng. Váy đúng như mô tả, chất vải mềm mại, mặc rất thoải mái. Shop giao hàng nhanh, đóng gói cẩn thận. Sẽ ủng hộ shop tiếp!', ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'], true, NOW() - INTERVAL '3 days'),

('c50e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440006', 5, 'iPhone chính hãng, giá tốt', 'Shop uy tín, máy zin 100%, kích hoạt bảo hành Apple ngon lành. Giao hàng nhanh, tư vấn nhiệt tình. Recommend!', ARRAY['https://images.unsplash.com/photo-1696446702883-e2079167c5b8?w=400'], true, NOW() - INTERVAL '1 week');

-- =====================================================
-- SCHEDULED POSTS (Upcoming posts)
-- =====================================================

INSERT INTO scheduled_posts (user_id, content, media_urls, media_type, product_id, scheduled_time, status, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440002', '🎉 FLASH SALE CUỐI TUẦN 🎉 Giảm giá 30% toàn bộ váy đầm! Từ 20:00 hôm nay đến hết Chủ nhật. Nhanh tay đặt hàng nhé các nàng! 💕', ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'], 'image', null, NOW() + INTERVAL '6 hours', 'scheduled', NOW()),

('550e8400-e29b-41d4-a716-446655440003', 'Sắp về hàng MacBook Air M3 mới nhất! 🔥 Ai đặt trước inbox shop để được giá tốt nhất nhé! Expected: Tuần sau.', ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'], 'image', null, NOW() + INTERVAL '1 day', 'scheduled', NOW());

-- =====================================================
-- SELLER STATS (Sample data)
-- =====================================================

INSERT INTO seller_stats (seller_id, date, total_sales, total_orders, total_revenue, total_products, total_views, new_followers) VALUES
-- Seller 1 stats
('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '7 days', 10, 8, 4500000, 3, 450, 12),
('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '6 days', 15, 12, 6750000, 3, 520, 18),
('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '5 days', 8, 6, 3600000, 3, 380, 8),
('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '4 days', 12, 10, 5400000, 3, 490, 15),
('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '3 days', 20, 16, 9000000, 3, 680, 25),
('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '2 days', 18, 14, 8100000, 3, 620, 20),
('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE - INTERVAL '1 day', 14, 11, 6300000, 3, 550, 16),

-- Seller 2 stats
('550e8400-e29b-41d4-a716-446655440003', CURRENT_DATE - INTERVAL '7 days', 5, 4, 52000000, 3, 280, 8),
('550e8400-e29b-41d4-a716-446655440003', CURRENT_DATE - INTERVAL '6 days', 8, 6, 83000000, 3, 350, 12),
('550e8400-e29b-41d4-a716-446655440003', CURRENT_DATE - INTERVAL '5 days', 3, 2, 39000000, 3, 220, 5),
('550e8400-e29b-41d4-a716-446655440003', CURRENT_DATE - INTERVAL '4 days', 6, 5, 62000000, 3, 310, 10),
('550e8400-e29b-41d4-a716-446655440003', CURRENT_DATE - INTERVAL '3 days', 10, 8, 104000000, 3, 420, 18),
('550e8400-e29b-41d4-a716-446655440003', CURRENT_DATE - INTERVAL '2 days', 7, 5, 72000000, 3, 380, 14),
('550e8400-e29b-41d4-a716-446655440003', CURRENT_DATE - INTERVAL '1 day', 4, 3, 41000000, 3, 290, 7);

-- =====================================================
-- UPDATE PRODUCT STATS
-- =====================================================

UPDATE products SET 
    views_count = FLOOR(RANDOM() * 1000) + 100,
    likes_count = FLOOR(RANDOM() * 200) + 20,
    comments_count = FLOOR(RANDOM() * 50) + 5,
    sales_count = FLOOR(RANDOM() * 100) + 10
WHERE status = 'active';
