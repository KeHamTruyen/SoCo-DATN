
# Tài liệu Đặc tả Yêu cầu: Dự án Social Commerce

## 1. Ý tưởng Dự án Social Commerce

Social Commerce là một nền tảng mạng xã hội đa năng, tích hợp sâu tính năng thương mại điện tử, được xây dựng để trở thành một đồ án tốt nghiệp ấn tượng. Dự án này không chỉ đơn thuần là một trang web mua bán hay một mạng xã hội độc lập, mà là sự kết hợp của cả hai, tạo ra một hệ sinh thái nơi hoạt động xã hội trực tiếp thúc đẩy kinh doanh. Điểm độc đáo của Social Commerce là cơ chế "buyer-to-seller": mọi người dùng đều bắt đầu là người mua, nhưng có thể nâng cấp vai trò thành người bán (seller) thông qua một quy trình xác thực đơn giản. Điều này tạo ra một mô hình kinh doanh an toàn và minh bạch, nơi các giao dịch mua bán được xây dựng trên sự tin tưởng và tương tác xã hội.

## 2. Công nghệ đề xuất

-   **Frontend:** React.js, một thư viện JavaScript mạnh mẽ để xây dựng giao diện người dùng tương tác, với khả năng tạo các component tái sử dụng.
-   **Backend:** Node.js/Express, môi trường runtime và framework nhẹ, nhanh, lý tưởng cho việc xây dựng API.
-   **Database:** PostgreSQL, một cơ sở dữ liệu quan hệ (RDBMS) mạnh mẽ và đáng tin cậy, hỗ trợ tính toàn vẹn dữ liệu (ACID), phù hợp để lưu trữ dữ liệu có cấu trúc và quan hệ phức tạp như người dùng, bài đăng, hồ sơ, sản phẩm, và các quan hệ giữa chúng (ví dụ: quan hệ giữa bài đăng và bình luận).
-   **Authentication:** JSON Web Tokens (JWT) để xác thực người dùng an toàn.
-   **Real-time:** Socket.io cho tính năng chat, thông báo tức thì và các cập nhật thời gian thực.
-   **Lưu trữ file:** Cloudinary để quản lý hình ảnh và video hiệu quả.


### 3. Actors (Stakeholders)

#### Visitor (Khách vãng lai)

-   **Mô tả:** Người chưa đăng nhập vào hệ thống.
-   **Hành vi chính:**
    -   Xem các trang công khai và chi tiết sản phẩm
    -   Đăng ký tài khoản mới
    -   Đăng nhập vào hệ thống
    -   Khôi phục mật khẩu khi quên

#### User (Người dùng đã đăng nhập)

-   **Mô tả:** Người đã có tài khoản, đã xác thực và đang sử dụng nền tảng với vai trò cơ bản.
-   **Hành vi chính:**
    -   Quản lý hồ sơ cá nhân (ảnh đại diện, ảnh bìa, tiểu sử, thông tin cá nhân)
    -   Cài đặt quyền riêng tư cho tài khoản
    -   Xem bảng tin (feed) được cá nhân hóa
    -   Tạo bài đăng (văn bản và hình ảnh)
    -   Thích, bình luận và chia sẻ bài đăng
    -   Theo dõi hoặc bỏ theo dõi người dùng khác
    -   Gửi và nhận tin nhắn trực tiếp 1-1
    -   Tham gia, rời khỏi hoặc tương tác trong các nhóm
    -   Báo cáo nội dung hoặc hành vi vi phạm
    -   Sử dụng công cụ AI để tạo nội dung bài viết từ ý tưởng hoặc từ hình ảnh
    -   Lên lịch đăng bài và quản lý danh sách bài viết đã lên lịch
    -   Xem danh sách thông báo đã nhận
    -   Tùy chỉnh cài đặt thông báo cá nhân

#### Buyer (Người mua)

-   **Mô tả:** Là User thực hiện các hoạt động mua sắm trên nền tảng.
-   **Hành vi chính (ngoài các quyền của User):**
    -   Tìm kiếm và xem chi tiết sản phẩm
    -   Thêm sản phẩm vào giỏ hàng và quản lý giỏ hàng
    -   Thực hiện đặt hàng và thanh toán (giả lập)
    -   Theo dõi trạng thái đơn hàng
    -   Đánh giá, xếp hạng sản phẩm và người bán sau khi nhận hàng
    -   Yêu cầu hoàn tiền khi cần
    -   Nhận thông báo tức thì về mọi cập nhật liên quan đến đơn hàng

#### Seller (Người bán)

-   **Mô tả:** Là User đã được phê duyệt nâng cấp vai trò để kinh doanh trên nền tảng.
-   **Hành vi chính (ngoài các quyền của User và Buyer):**
    -   Quản lý danh mục sản phẩm (thêm, sửa, xóa, quản lý biến thể và tồn kho)
    -   Gắn thẻ sản phẩm vào bài đăng của mình
    -   Xem dashboard thống kê hiệu suất kinh doanh (lượt xem, doanh số, đơn hàng…)
    -   Quản lý đơn hàng (xem danh sách, cập nhật trạng thái)
    -   Xử lý yêu cầu hoàn tiền từ người mua
    -   Phản hồi đánh giá của khách hàng
    -   Sử dụng AI để tạo nội dung quảng cáo từ sản phẩm hoặc kết hợp đa phương thức
    -   Nhận thông báo tức thì khi có đơn hàng mới, thay đổi trạng thái đơn, yêu cầu hoàn tiền hoặc đánh giá mới

#### Admin (Quản trị viên hệ thống)

-   **Mô tả:** Người có quyền cao nhất để giám sát và vận hành toàn bộ nền tảng.
-   **Hành vi chính:**
    -   Quản lý tài khoản người dùng (tìm kiếm, lọc, khóa/mở khóa tài khoản)
    -   Kiểm duyệt và quản lý nội dung (bài đăng, sản phẩm, bình luận)
    -   Xem và xử lý các báo cáo vi phạm từ cộng đồng
    -   Phê duyệt hoặc từ chối đơn đăng ký trở thành người bán
    -   Xem thống kê, biểu đồ và phân tích tổng quan hệ thống (tăng trưởng, tỷ lệ buyer/seller, doanh thu…)
    -   Theo dõi nhật ký hoạt động (audit log) khi cần thiết
 
## 4. Functional Requirements (by Stakeholder)

Dưới đây là danh sách các yêu cầu chức năng được phân loại theo từng Stakeholder tương tác với hệ thống.

### 4.1. Dành cho Visitor (Khách vãng lai)

Một người dùng vãng lai muốn có thể:

-   Đăng ký tài khoản
-   Đăng nhập vào hệ thống
-   Khôi phục mật khẩu
-   Tìm kiếm sản phẩm
-   Xem chi tiết sản phẩm

### 4.2. Dành cho User (Người dùng đã đăng nhập)

Một người dùng đã đăng nhập muốn có thể:

-   Sử dụng xác thực hai yếu tố (2FA) khi đăng nhập
-   Đăng xuất khỏi hệ thống
-   Quản lý hồ sơ cá nhân (thay đổi ảnh đại diện, ảnh bìa, thông tin)
-   Cài đặt quyền riêng tư cho tài khoản
-   Xem bảng tin (Feed) cá nhân hóa từ những người mình theo dõi
-   Tạo bài đăng (văn bản, hình ảnh)
-   Tương tác với bài đăng (Thích, Bình luận)
-   Theo dõi người dùng khác
-   Nhắn tin 1-1 với người dùng khác
-   Tham gia và tương tác trong Nhóm (Groups)
-   Báo cáo nội dung hoặc hành vi vi phạm
-   Sử dụng AI để tạo nội dung bài viết từ ý tưởng (Text-to-Text)
-   Sử dụng AI để tạo caption từ hình ảnh (Image-to-Text)
-   Lên lịch đăng bài vào thời điểm mong muốn
-   Quản lý các bài viết đã lên lịch (Xem, Sửa, Xóa)
-   **Xem danh sách thông báo đã nhận**
-   **Tùy chỉnh cài đặt thông báo cá nhân**

### 4.3. Dành cho Buyer (Người mua)

Một người mua (đã có quyền của User) muốn có thể:

-   Đăng ký để trở thành Người bán
-   Thêm sản phẩm vào giỏ hàng
-   Quản lý giỏ hàng (Xem, Cập nhật số lượng, Xóa sản phẩm)
-   Thực hiện thanh toán (giả lập)
-   Theo dõi trạng thái đơn hàng đã đặt
-   Đánh giá và xếp hạng sản phẩm/người bán sau khi mua hàng
-   **Nhận thông báo tức thì về cập nhật trạng thái đơn hàng**

### 4.4. Dành cho Seller (Người bán)

Một người bán (đã có quyền của User) muốn có thể:

-   Gắn thẻ sản phẩm của mình vào bài đăng
-   Quản lý sản phẩm (Thêm, Sửa, Xóa, quản lý biến thể)
-   Xem dashboard hiệu suất kinh doanh (doanh số, lượt xem...)
-   Quản lý đơn hàng (xem, cập nhật trạng thái đơn)
-   Xử lý các yêu cầu hoàn tiền (giả lập)
-   Phản hồi các đánh giá của người mua
-   Sử dụng AI để tạo bài viết quảng cáo từ sản phẩm đã gắn thẻ (Product-to-Text)
-   Sử dụng AI để tạo nội dung kết hợp đa phương thức (Văn bản + Ảnh + Sản phẩm)
-   **Nhận thông báo tức thì về đơn hàng mới, cập nhật trạng thái, yêu cầu hoàn tiền**
-   **Nhận thông báo khi có đánh giá mới từ khách hàng**

### 4.5. Dành cho Admin (Quản trị viên)

Một quản trị viên muốn có thể:

-   Quản lý tài khoản người dùng (Tìm kiếm, Lọc, Vô hiệu hóa)
-   Quản lý nội dung (kiểm duyệt Bài đăng, Sản phẩm)
-   Xem và xử lý các báo cáo vi phạm từ người dùng
-   Xem thống kê và phân tích tổng quan hệ thống (tăng trưởng, tỷ lệ buyer/seller)

## 5. Non-Functional Requirements

### 1. Hiệu năng (Performance)

**Mô tả:** Hệ thống phản hồi nhanh, tải feed và xử lý giao dịch hiệu quả.

**Chi tiết:** Tốc độ phản hồi: Thời gian tải các trang chính nên dưới 2 giây.

**Khả năng chịu tải:** Hệ thống cần xử lý được đồng thời ít nhất 1000 người dùng.

**Triển khai:**
-   Frontend: Sử dụng infinite scroll cho feed để giảm tải ban đầu.
-   Backend: Tối ưu hóa các truy vấn database bằng cách sử dụng indexing và joins hiệu quả.
-   Database: Tối ưu hóa cấu trúc dữ liệu với các bảng quan hệ, indexes, và stored procedures để xử lý truy vấn phức tạp. **Kiểm thử:** Sử dụng các công cụ load testing như JMeter hoặc Artillery.

### 2. Bảo mật (Security)

**Mô tả:** Hệ thống phải bảo vệ dữ liệu người dùng khỏi các mối đe dọa bên ngoài.

**Chi tiết:**
-   Mã hóa mật khẩu: Mật khẩu người dùng phải được lưu trữ dưới dạng băm (hash) bằng bcrypt.
-   Xác thực: Sử dụng JWT (JSON Web Tokens), quản lý refreshToken, is2FAEnabled, và loginAttempts (chống brute-force).
-   Bảo vệ khỏi tấn công: Ngăn chặn SQL Injection và Cross-Site Scripting (XSS).
-   Kết nối an toàn: Mọi giao tiếp giữa client và server phải sử dụng giao thức HTTPS. **Cách triển khai:**
-   Backend: Sử dụng các middleware bảo mật như Helmet.js.
-   Frontend: Đảm bảo các form đều có validation hợp lệ.

### 3. Khả dụng và Độ tin cậy (Availability & Reliability)

**Mô tả:** Hệ thống phải hoạt động ổn định và liên tục, mục tiêu 99% uptime.

**Triển khai:**
-   Deployment: Sử dụng các dịch vụ cloud như Heroku hoặc Vercel.
-   Monitoring: Triển khai các công cụ giám sát.
-   Error Handling: Cài đặt cơ chế bắt lỗi tập trung (centralized error handling).

### 4. Khả năng sử dụng (Usability)

**Mô tả:** Giao diện người dùng phải trực quan, dễ hiểu và dễ thao tác.

**Chi tiết:** Thiết kế nhất quán, Tương thích di động (Responsive Design).

**Triển khai:** Sử dụng thư viện Shadcn UI (Tailwind CSS). 

### 5. Khả năng Mở rộng (Scalability)

**Mô tả:** Hệ thống có thể dễ dàng mở rộng để xử lý số lượng người dùng và dữ liệu lớn hơn.

**Triển khai:**
-   Backend: Cấu trúc code theo từng module chức năng.
-   Database: PostgreSQL có khả năng mở rộng tốt thông qua replication, partitioning, và sharding.

### 6. Thời gian thực (Real-time)

**Mô tả:** Hệ thống phải hỗ trợ các tính năng thời gian thực như thông báo ngay lập tức, chat, và cập nhật trạng thái đơn hàng.

**Chi tiết:**
-   Socket.io được sử dụng để thiết lập kết nối WebSocket hai chiều.
-   Thông báo được gửi ngay lập tức khi có sự kiện xảy ra.
-   Chat được đồng bộ hóa thời gian thực giữa các người dùng.

**Cách triển khai:**
-   Sử dụng Socket.io cho tất cả các tính năng real-time.
-   Triển khai event-driven architecture để xử lý các sự kiện tức thời.

## 6. Định hướng Phát triển và Tính năng Nâng cao trong Tương lai

Đây là các tính năng tiềm năng có thể được phát triển để mở rộng và nâng cao giá trị cho nền tảng Social Commerce.

### Hệ thống Đề xuất Nâng cao (Advanced Recommendation Engine)

**Mô tả:** Xây dựng một engine đề xuất thông minh, tự động gợi ý cho người dùng những nội dung và sản phẩm phù hợp nhất dựa trên hành vi, sở thích và mối quan hệ xã hội của họ. Hệ thống sẽ kết hợp nhiều nguồn dữ liệu để đưa ra đề xuất chính xác và đa dạng ở nhiều vị trí quan trọng như:

-   Trang chủ (Feed): Đề xuất bài đăng từ người chưa theo dõi nhưng có nội dung tương tự những gì người dùng thường tương tác.
-   Khám phá sản phẩm: Gợi ý sản phẩm dựa trên lịch sử xem/mua, sản phẩm trong giỏ hàng bị bỏ qua, và sản phẩm đang hot trong nhóm người dùng theo dõi.
-   Khi xem một sản phẩm: “Người mua sản phẩm này cũng mua…”, “Sản phẩm tương tự”, “Người bán này còn có…”.
-   Khi xem một bài đăng: Gợi ý các bài đăng liên quan hoặc sản phẩm được gắn thẻ trong bài đăng đó.

**Các thuật toán dự kiến sử dụng:**

-   Collaborative Filtering (User-based & Item-based)
-   Content-based Filtering (dựa trên hashtag, danh mục sản phẩm, nội dung AI-generated)
-   Hybrid Model kết hợp cả hai trên + yếu tố xã hội (bạn bè của bạn đang mua gì, người bạn follow đang bán gì)
-   Có thể nâng cấp lên Matrix Factorization hoặc Deep Learning (Neural Collaborative Filtering) khi dữ liệu đủ lớn

**Lợi ích:**

-   Tăng thời gian onsite và tỷ lệ chuyển đổi mua hàng
-   Giúp người bán nhỏ tiếp cận khách hàng tiềm năng mà không cần chạy quảng cáo
-   Tạo cảm giác “hiểu người dùng” → tăng độ gắn kết với nền tảng
-   Tăng doanh thu tự nhiên mà không phụ thuộc hoàn toàn vào quảng cáo trả phí

**Dự định triển khai từng giai đoạn:**

1.  Giai đoạn 1 (MVP): Rule-based + simple Collaborative Filtering (dùng PostgreSQL + materialized view)
2.  Giai đoạn 2: Tích hợp Redis để cache kết quả đề xuất, cập nhật real-time khi có tương tác mới
3.  Giai đoạn 3: Chuyển sang Python service riêng (FastAPI + scikit-learn/TensorFlow) hoặc dùng dịch vụ như Amazon Personalize, Google Recommendations AI khi quy mô lớn


### Hệ thống Voucher Giảm Giá (Voucher System)

**Mô tả:**  
Phát triển hệ thống quản lý voucher giảm giá toàn diện, cho phép người bán tạo, phân phối và theo dõi các mã khuyến mãi linh hoạt. Các loại voucher bao gồm:  
- **Giảm giá cố định** (ví dụ: -50.000 VNĐ cho đơn hàng trên 200.000 VNĐ)  
- **Giảm phần trăm** (ví dụ: -20% cho toàn bộ giỏ hàng, tối đa 100.000 VNĐ)  
- **Miễn phí vận chuyển** (áp dụng cho đơn hàng trong khu vực nhất định) 
- **Voucher giới hạn** (chỉ áp dụng cho sản phẩm cụ thể, danh mục, hoặc người bán)

Người dùng có thể nhận voucher qua nhiều kênh: mua hàng, hoàn thành nhiệm vụ gamification. Hệ thống tự động kiểm tra điều kiện áp dụng (thời hạn, số lượng còn lại, giá trị đơn tối thiểu) và hiển thị voucher khả dụng khi checkout.

**Lợi ích:**  
- **Đối với người bán:** Công cụ marketing mạnh mẽ để tăng doanh số đột phá, thu hút khách hàng mới, và kích hoạt lại khách hàng cũ. Giúp tối ưu hóa chiến lược giá và cạnh tranh hiệu quả hơn.  
- **Đối với người mua:** Trải nghiệm mua sắm tiết kiệm và hấp dẫn hơn, tăng cảm giác "deal tốt" và khuyến khích mua sắm impulsively.  
- **Đối với nền tảng:** Tăng giá trị giao dịch trung bình (AOV), giảm tỷ lệ bỏ giỏ hàng, và tạo dữ liệu phân tích về hành vi khuyến mãi để cải thiện thuật toán đề xuất.  

**Dự định triển khai từng giai đoạn:**  
1. **Giai đoạn 1 (MVP):** Xây dựng bảng voucher cơ bản trong PostgreSQL (với các trường: mã voucher, loại, giá trị, điều kiện áp dụng, số lượng còn lại, thời hạn, quan hệ đến seller/product). Tích hợp validation đơn giản trong OrderService khi checkout.  
2. **Giai đoạn 2:** Thêm tính năng phân phối voucher (qua email, push notification, hoặc gắn vào bài đăng xã hội), sử dụng Redis để cache voucher hot và kiểm tra tính hợp lệ real-time. Tích hợp với NotificationService để thông báo khi voucher sắp hết hạn.  
3. **Giai đoạn 3:** Nâng cao với phân tích hiệu suất voucher (conversion rate, ROI), tích hợp QR code cho voucher offline, và API để người bán tự động tạo voucher theo quy tắc (ví dụ: tự động tạo voucher cho khách VIP). Có thể dùng background job để quét và vô hiệu hóa voucher hết hạn hàng ngày.


### Gamification và Chương trình Khách hàng thân thiết

**Mô tả:** Tích hợp các yếu tố trò chơi hóa (gamification) vào nền tảng để khuyến khích người dùng tham gia tích cực hơn, kết hợp với chương trình khách hàng thân thiết để thưởng cho sự trung thành. Cụ thể:

-   **Gamification:** Người dùng kiếm điểm thưởng, huy hiệu, hoặc hoàn thành thử thách qua các hoạt động như tạo bài đăng chất lượng, tương tác (like, comment, share), mua hàng, đánh giá sản phẩm, mời bạn bè tham gia, hoặc hoàn thành nhiệm vụ hàng ngày/tuần (ví dụ: "Đăng 5 bài trong tuần để nhận huy hiệu Sáng Tạo"). Điểm có thể được hiển thị trên hồ sơ cá nhân và bảng xếp hạng cộng đồng.
-   **Chương trình Khách hàng Thân Thiết:** Phân cấp người dùng dựa trên điểm tích lũy hoặc giá trị mua sắm (ví dụ: Bronze, Silver, Gold, Platinum), với các lợi ích tăng dần như giảm giá độc quyền, ưu tiên hiển thị bài đăng, hoặc quyền truy cập sự kiện đặc biệt. Điểm có thể đổi lấy voucher, quà tặng, hoặc tính năng cao cấp (như tùy chỉnh giao diện).

**Lợi ích:**

-   Tăng tương tác và thời gian sử dụng nền tảng bằng cách biến các hoạt động hàng ngày thành "trò chơi" vui vẻ, giảm tỷ lệ rời bỏ (churn rate).
-   Khuyến khích hành vi tích cực như nội dung chất lượng cao và mua sắm lặp lại, giúp người bán xây dựng cộng đồng trung thành và tăng doanh số.
-   Tạo sự khác biệt cạnh tranh, làm nền tảng trở nên hấp dẫn hơn so với các mạng xã hội thương mại thông thường, đồng thời thu thập dữ liệu hành vi để cải thiện đề xuất cá nhân hóa.

**Dự định triển khai từng giai đoạn:**

1.  **Giai đoạn 1 (MVP):** Triển khai hệ thống điểm cơ bản và huy hiệu, lưu trữ trong PostgreSQL (bảng riêng cho điểm, huy hiệu với quan hệ đến user và hoạt động). Sử dụng event-driven để cập nhật điểm sau mỗi hành động (tích hợp với PostService, OrderService).
2.  **Giai đoạn 2:** Thêm thử thách và bảng xếp hạng, sử dụng Redis để lưu trữ và sắp xếp điểm nhanh chóng (leaderboard). Tích hợp Socket.io cho cập nhật real-time và notification khi đạt mốc.
3.  **Giai đoạn 3:** Mở rộng với AI để tạo thử thách cá nhân hóa (dựa trên hành vi user), và tích hợp với hệ thống voucher để đổi điểm. Có thể dùng thư viện như Gamify.js cho frontend hoặc xây dựng custom service.
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTE3MjEzMDc1MTcsLTQwMjMwMzQyNiwtOT
A4NzEyNDA5LDEwOTYxNTY3MjldfQ==
-->