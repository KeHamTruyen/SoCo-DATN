# SoCo-DATN

Social Commerce đồ án tốt nghiệp: mạng xã hội gắn thương mại. Glossary này ghi ngôn ngữ dùng khi mô tả **triển khai production hiện tại** và tài liệu hướng dẫn.

## Triển khai (production)

**Kiến trúc Render + Supabase**:
Ứng dụng chính và cụm admin chạy trên Render; PostgreSQL dùng Supabase (project `SocialCommerce`). Không host production trên Vercel hay All-AWS.
_Avoid_: All-AWS, CloudFront+S3+EC2 (như production hiện tại), Neon (cho SoCo production)

**Frontend tĩnh (Render)**:
Bản build Vite SPA (`frontend/dist`, `admin/frontend/dist`) phục vụ như Static Site trên Render.
_Avoid_: S3 static hosting, Vercel SPA (cho SoCo)

**Backend API (Render)**:
Web Service Node.js trên Render chạy Express + Socket.IO (`be-socomain`, `be-socoadmin`).
_Avoid_: EC2, PM2 trên VPS (như production hiện tại)

**Cơ sở dữ liệu Supabase**:
PostgreSQL do Supabase quản lý; Backend API kết nối bằng `DATABASE_URL` (Prisma).
_Avoid_: Neon (SoCo prod), RDS, Postgres trên Render

**Ứng dụng chính**:
Cặp user app: static `socomain` + API `be-socomain`.
_Avoid_: Chỉ nói “hệ thống đầy đủ” khi chưa gồm admin

**Cụm admin**:
Static `socoadmin` + API `be-socoadmin`, dùng chung schema/DB với ứng dụng chính.
_Avoid_: Admin gắn chung một URL với user app

**Blueprint Render**:
File `render.yaml` mô tả bốn service (hai web, hai static) và biến môi trường sync.
_Avoid_: Deploy thủ công không ghi trong blueprint khi nói về nguồn sự thật cấu hình

**URL production**:
- User FE: `https://socomain.onrender.com`
- User API: `https://be-socomain.onrender.com`
- Admin FE: `https://socoadmin.onrender.com`
- Admin API: `https://be-socoadmin.onrender.com`
_Avoid_: `*.cloudfront.net`, IP EC2

## Thuật ngữ lịch sử (không dùng cho production hiện tại)

**Kiến trúc All-AWS** (superseded):
Mô hình lab/luận văn cũ: Frontend S3 + Backend EC2 + CloudFront; đã được thay bằng Kiến trúc Render + Supabase cho môi trường live.
_Avoid_: Mô tả All-AWS như đang chạy production

**Hướng dẫn HTML / Chương triển khai**:
Nếu còn tài liệu lab All-AWS, coi là đường dẫn học thuật lịch sử; sự thật deploy live lấy từ glossary Triển khai (production) và `docs/adr/0002-*.md`.
_Avoid_: Hai sự thật production song song không ghi rõ cái nào đang live
