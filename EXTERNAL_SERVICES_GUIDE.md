# 🛠️ External Services & Tools Guide

Danh sách các công cụ và dịch vụ bên ngoài cần thiết cho **Social Commerce Platform**

---

## 📁 1. FILE STORAGE & CDN (BẮT BUỘC)

### Vấn đề cần giải quyết:
- ❌ Không lưu ảnh sản phẩm, avatar, post images trực tiếp vào server
- ❌ Không dùng base64 để lưu ảnh vào database (quá nặng)
- ✅ Cần cloud storage với CDN để phân phối ảnh nhanh

### 🟢 Khuyến nghị: **Cloudinary** (Best for this project)

**Ưu điểm:**
- ✅ Free tier: 25GB storage, 25GB bandwidth/tháng
- ✅ Tự động resize, crop, optimize ảnh
- ✅ CDN toàn cầu built-in
- ✅ Upload API đơn giản (SDK cho Node.js và React)
- ✅ Transformation URL-based (không cần xử lý backend)
- ✅ Automatic format conversion (WebP, AVIF)
- ✅ Video support (cho future features)

**Use cases trong project:**
- Product images (với nhiều sizes: thumbnail, medium, full)
- User avatars
- Post images/videos
- Review images
- Seller verification documents

**Pricing:**
- Free: 25GB storage, 25GB bandwidth
- Plus: $99/tháng - 125GB storage, 125GB bandwidth
- Advanced: $249/tháng - 250GB storage, 250GB bandwidth

**Setup:**
```bash
npm install cloudinary multer-storage-cloudinary

# .env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Website:** https://cloudinary.com

---

### 🔵 Alternative 1: **AWS S3 + CloudFront**

**Ưu điểm:**
- ✅ Rất rẻ cho storage lớn ($0.023/GB/tháng)
- ✅ Scalable vô hạn
- ✅ Control hoàn toàn
- ✅ Tích hợp tốt với AWS ecosystem

**Nhược điểm:**
- ⚠️ Phức tạp hơn setup
- ⚠️ Cần setup CloudFront riêng cho CDN
- ⚠️ Cần xử lý image transformation riêng

**Pricing:**
- S3: $0.023/GB/tháng (first 50TB)
- CloudFront: $0.085/GB (first 10TB)
- Free tier: 5GB S3 + 50GB CloudFront (12 tháng đầu)

**Website:** https://aws.amazon.com/s3/

---

### 🔵 Alternative 2: **Firebase Storage**

**Ưu điểm:**
- ✅ Free tier: 5GB storage, 1GB/day bandwidth
- ✅ Tích hợp với Firebase Auth
- ✅ Real-time capabilities
- ✅ Setup đơn giản

**Nhược điểm:**
- ⚠️ Bandwidth giới hạn (1GB/day free)
- ⚠️ Không có image transformation built-in

**Pricing:**
- Free: 5GB storage, 1GB/day download
- Blaze: $0.026/GB storage, $0.12/GB download

**Website:** https://firebase.google.com/products/storage

---

### 🔵 Alternative 3: **UploadThing** (New, specialized)

**Ưu điểm:**
- ✅ Developer-friendly, modern API
- ✅ Free tier: 2GB storage, unlimited bandwidth
- ✅ Built for Next.js/React
- ✅ Image optimization built-in

**Pricing:**
- Free: 2GB storage
- Pro: $20/tháng - 100GB storage

**Website:** https://uploadthing.com

---

## 💳 2. PAYMENT GATEWAY (BẮT BUỘC)

### Vấn đề cần giải quyết:
- Xử lý thanh toán online an toàn
- Hỗ trợ nhiều phương thức thanh toán
- Compliance với PCI-DSS

### 🟢 Cho thị trường Việt Nam:

#### **VNPay** (Khuyến nghị #1 cho VN)
- ✅ Phổ biến nhất tại VN
- ✅ Hỗ trợ: ATM, Visa/Master, QR code, ví điện tử
- ✅ Phí thấp (~1.5-2% per transaction)
- ✅ Tích hợp đơn giản
- ⚠️ Cần đăng ký doanh nghiệp
- **Website:** https://vnpay.vn

#### **Momo** (Khuyến nghị #2 cho VN)
- ✅ Người dùng rất nhiều tại VN
- ✅ API đơn giản
- ✅ QR code, in-app payment
- ✅ Phí ~2%
- **Website:** https://developers.momo.vn

#### **ZaloPay**
- ✅ Ecosystem Zalo (nhiều users)
- ✅ Phí ~2%
- **Website:** https://zalopay.vn

---

### 🔵 Cho thị trường quốc tế:

#### **Stripe** (Best for international)
- ✅ Free tier, chỉ trả khi có transaction
- ✅ Phí: 3.4% + $0.30 per transaction (international)
- ✅ API tuyệt vời, documentation đầy đủ
- ✅ Hỗ trợ subscription, refund, dispute
- ✅ Dashboard quản lý payments
- ✅ Webhooks cho automation
- **Website:** https://stripe.com

#### **PayPal**
- ✅ Phổ biến toàn cầu
- ✅ Phí: 3.49% + fixed fee
- ✅ Buyer protection
- **Website:** https://paypal.com

---

## 📧 3. EMAIL SERVICE (BẮT BUỘC)

### Vấn đề cần giải quyết:
- Gửi email xác nhận đơn hàng
- Email reset password
- Email marketing
- Email notifications

### 🟢 Khuyến nghị: **Resend** (Modern, developer-friendly)

**Ưu điểm:**
- ✅ Free: 3,000 emails/tháng, 1 domain
- ✅ API cực kỳ đơn giản
- ✅ React Email support (design emails bằng React)
- ✅ Good deliverability
- ✅ Webhooks

**Pricing:**
- Free: 3,000 emails/tháng
- Pro: $20/tháng - 50,000 emails

**Website:** https://resend.com

---

### 🔵 Alternative 1: **SendGrid**

**Ưu điểm:**
- ✅ Free: 100 emails/day (3,000/tháng)
- ✅ Template engine
- ✅ Analytics
- ✅ Proven reliability

**Pricing:**
- Free: 100 emails/day
- Essentials: $19.95/tháng - 50,000 emails

**Website:** https://sendgrid.com

---

### 🔵 Alternative 2: **AWS SES**

**Ưu điểm:**
- ✅ Rất rẻ: $0.10/1,000 emails
- ✅ Free tier: 62,000 emails/tháng (nếu gửi từ EC2)
- ✅ Scalable

**Nhược điểm:**
- ⚠️ Phức tạp hơn setup
- ⚠️ Cần verify domain

**Website:** https://aws.amazon.com/ses/

---

### 🔵 Alternative 3: **Mailgun**

**Pricing:**
- Free: 5,000 emails/tháng (3 tháng đầu)
- Foundation: $35/tháng - 50,000 emails

**Website:** https://mailgun.com

---

## 📱 4. SMS SERVICE (TÙY CHỌN)

### Use cases:
- OTP verification
- Order status notifications
- Marketing SMS

### 🟢 Cho Việt Nam: **Esms.vn**
- ✅ Phổ biến tại VN
- ✅ Brandname SMS
- ✅ API đơn giản
- 💰 ~500-700 VND/SMS
- **Website:** https://esms.vn

### 🔵 Quốc tế: **Twilio**
- ✅ Global coverage
- ✅ Powerful API
- 💰 $0.0079/SMS (US)
- **Website:** https://twilio.com

---

## 🔔 5. PUSH NOTIFICATIONS (BẮT BUỘC)

### Use cases:
- Order status updates
- New message notifications
- Product back in stock alerts

### 🟢 Khuyến nghị: **Firebase Cloud Messaging (FCM)**

**Ưu điểm:**
- ✅ Hoàn toàn MIỄN PHÍ
- ✅ Hỗ trợ iOS, Android, Web
- ✅ Reliable, scalable
- ✅ Tích hợp với Firebase ecosystem

**Website:** https://firebase.google.com/products/cloud-messaging

---

### 🔵 Alternative: **OneSignal**

**Ưu điểm:**
- ✅ Free: unlimited notifications
- ✅ Dashboard tốt
- ✅ A/B testing
- ✅ Segmentation

**Website:** https://onesignal.com

---

## 💬 6. REAL-TIME MESSAGING (BẮT BUỘC)

### Use cases:
- Chat giữa buyer và seller
- Real-time notifications
- Live updates

### 🟢 Option 1: **Socket.IO** (Self-hosted, FREE)

**Ưu điểm:**
- ✅ Hoàn toàn MIỄN PHÍ
- ✅ Full control
- ✅ WebSocket + fallbacks
- ✅ Room/namespace support

**Nhược điểm:**
- ⚠️ Cần manage scaling
- ⚠️ Infrastructure overhead

**Website:** https://socket.io

---

### 🔵 Option 2: **Pusher**

**Ưu điểm:**
- ✅ Free: 100 connections, 200k messages/day
- ✅ Managed service
- ✅ Easy scaling
- ✅ Dashboard

**Pricing:**
- Free: 100 connections
- Standard: $49/tháng - 500 connections

**Website:** https://pusher.com

---

### 🔵 Option 3: **Ably**

**Ưu điểm:**
- ✅ Free: 6M messages/tháng
- ✅ Global edge network
- ✅ Better free tier than Pusher

**Website:** https://ably.com

---

## 🗄️ 7. DATABASE HOSTING (BẮT BUỘC)

### 🟢 Khuyến nghị cho development/MVP:

#### **Supabase** (Best overall)
- ✅ Free: 500MB database, unlimited API requests
- ✅ PostgreSQL
- ✅ Auto-generated REST API
- ✅ Real-time subscriptions
- ✅ Auth built-in
- ✅ Storage included
- **Website:** https://supabase.com

#### **Neon** (Serverless Postgres)
- ✅ Free: 10GB storage, autoscale
- ✅ Instant branching (DB git-like)
- ✅ Serverless, pay-per-use
- **Website:** https://neon.tech

#### **Railway** (Simple, đẹp)
- ✅ Free: $5 credit/tháng
- ✅ PostgreSQL, Redis, etc.
- ✅ Deploy cả backend luôn
- ✅ Modern UI/UX
- **Website:** https://railway.app

---

### 🔵 Cho production:

#### **AWS RDS**
- ✅ Managed PostgreSQL
- ✅ Auto backups, scaling
- 💰 ~$15-50/tháng (db.t3.micro)

#### **DigitalOcean Managed Database**
- ✅ $15/tháng starter
- ✅ Đơn giản hơn AWS

---

## 🔍 8. SEARCH SERVICE (TÙY CHỌN - Phase 4)

### Use cases:
- Product search với filters phức tạp
- Search autocomplete/suggestions
- Typo tolerance

### 🟢 Khuyến nghị: **Meilisearch** (Open source, self-hosted)

**Ưu điểm:**
- ✅ FREE (self-hosted)
- ✅ Blazing fast
- ✅ Typo tolerance
- ✅ Faceted search
- ✅ Easy to setup

**Website:** https://meilisearch.com

---

### 🔵 Alternative: **Algolia**

**Ưu điểm:**
- ✅ Free: 10,000 searches/tháng
- ✅ Instant search
- ✅ Analytics
- ✅ Managed service

**Pricing:**
- Free: 10k searches/tháng
- Build: $0.50/1,000 searches after free tier

**Website:** https://algolia.com

---

## 🧠 9. AI SERVICES (TÙY CHỌN - Phase 8)

### Use cases:
- Generate product descriptions
- Generate post captions
- Image tagging
- Chatbot

### 🟢 Khuyến nghị: **OpenAI API**

**Models:**
- GPT-4o: $2.50/1M input tokens, $10/1M output tokens
- GPT-4o-mini: $0.15/1M input tokens, $0.60/1M output tokens (recommended cho project này)

**Website:** https://platform.openai.com

---

### 🔵 Alternatives:

#### **Anthropic Claude**
- Claude 3.5 Sonnet: $3/1M input, $15/1M output
- Better for long contexts
- **Website:** https://anthropic.com

#### **Google Gemini**
- Gemini 1.5 Flash: FREE up to 15 requests/minute
- $0.075/1M input tokens sau free tier
- **Website:** https://ai.google.dev

---

## 📊 10. ANALYTICS & MONITORING

### 🟢 Analytics:

#### **Google Analytics 4** (FREE)
- ✅ Hoàn toàn miễn phí
- ✅ Standard cho web analytics
- **Website:** https://analytics.google.com

#### **PostHog** (Modern, open source)
- ✅ Free: 1M events/tháng
- ✅ Product analytics + session replay
- ✅ Feature flags
- **Website:** https://posthog.com

---

### 🟢 Error Tracking:

#### **Sentry** (Khuyến nghị)
- ✅ Free: 5,000 errors/tháng
- ✅ Frontend + Backend tracking
- ✅ Source maps support
- ✅ Performance monitoring
- **Website:** https://sentry.io

---

### 🟢 Logging:

#### **Better Stack Logs** (formerly Logtail)
- ✅ Free: 1GB/tháng, 3-day retention
- ✅ Beautiful UI
- ✅ Live tail
- **Website:** https://betterstack.com

---

## ⚡ 11. CACHING (TÙY CHỌN - Cho scaling)

### 🟢 Khuyến nghị: **Upstash Redis**

**Ưu điểm:**
- ✅ Free: 10,000 commands/day
- ✅ Serverless Redis
- ✅ Global edge locations
- ✅ REST API (không cần Redis client)

**Use cases:**
- Cache API responses
- Session storage
- Rate limiting
- Real-time leaderboards

**Website:** https://upstash.com

---

## 🚀 12. DEPLOYMENT & HOSTING

### Backend:

#### **Railway** (Easiest)
- ✅ Free: $5 credit/tháng
- ✅ Deploy từ GitHub auto
- ✅ Database included
- **Website:** https://railway.app

#### **Render**
- ✅ Free tier (540 hours/tháng)
- ✅ Auto-deploy từ GitHub
- **Website:** https://render.com

#### **AWS EC2 / DigitalOcean Droplet** (Traditional)
- 💰 ~$5-10/tháng

---

### Frontend:

#### **Vercel** (Best for React/Vite)
- ✅ FREE unlimited
- ✅ Auto deploy từ GitHub
- ✅ Global CDN
- ✅ Preview deployments
- **Website:** https://vercel.com

#### **Netlify**
- ✅ Similar to Vercel
- ✅ Free tier generous
- **Website:** https://netlify.com

#### **Cloudflare Pages**
- ✅ FREE unlimited
- ✅ Fast global CDN
- **Website:** https://pages.cloudflare.com

---

## 💰 COST ESTIMATE (MVP Phase)

### Minimum Budget (FREE tier everything):
| Service | Plan | Cost |
|---------|------|------|
| Cloudinary | Free | $0 |
| Supabase (DB) | Free | $0 |
| Resend (Email) | Free | $0 |
| FCM (Push) | Free | $0 |
| Socket.IO | Self-hosted | $0 |
| Vercel (Frontend) | Free | $0 |
| Railway (Backend) | Free tier | $0 |
| **TOTAL** | | **$0/month** |

⚠️ **Chưa bao gồm**: Payment gateway fees (%, per transaction)

---

### Recommended Budget (Paid for better limits):
| Service | Plan | Cost |
|---------|------|------|
| Cloudinary | Plus | $99/month |
| Railway (DB + API) | Paid | $20/month |
| Resend | Pro | $20/month |
| FCM | Free | $0 |
| Pusher (Real-time) | Standard | $49/month |
| Vercel | Free | $0 |
| Sentry | Free | $0 |
| **TOTAL** | | **~$188/month** |

---

### Production Scale (~10k users):
| Service | Plan | Cost |
|---------|------|------|
| Cloudinary | Advanced | $249/month |
| AWS RDS (Postgres) | db.t3.medium | $50/month |
| AWS EC2 (API) | t3.medium | $30/month |
| SendGrid | Essentials | $20/month |
| Pusher | Pro | $99/month |
| Algolia | Build | ~$100/month |
| Sentry | Team | $29/month |
| OpenAI API | Pay-as-go | ~$50/month |
| **TOTAL** | | **~$627/month** |

---

## 🎯 PRIORITY ORDER

### Phase 1 (MVP) - BẮT BUỘC:
1. ✅ **Cloudinary** - Product images
2. ✅ **Supabase/Railway** - Database hosting
3. ✅ **Resend/SendGrid** - Email service
4. ⏸️ **VNPay/Stripe** - Payment (khi làm checkout)

### Phase 2 (Beta) - KHUYẾN NGHỊ:
5. **FCM/OneSignal** - Push notifications
6. **Socket.IO/Pusher** - Real-time messaging
7. **Sentry** - Error tracking

### Phase 3 (Production) - TỐI ƯU:
8. **Algolia/Meilisearch** - Advanced search
9. **Redis/Upstash** - Caching
10. **PostHog** - Analytics
11. **OpenAI API** - AI features

---

## 📝 NEXT STEPS

### Immediate (This week):
1. **Đăng ký Cloudinary** - Setup upload middleware ngay
2. **Setup database hosting** - Supabase hoặc Railway
3. **Setup email service** - Resend free tier

### Before launch:
4. Đăng ký VNPay/Stripe merchant account (cần 1-2 tuần approve)
5. Setup Firebase project cho FCM
6. Setup Sentry error tracking
7. Setup Google Analytics

### After launch:
8. Monitor & scale dựa trên usage
9. Upgrade plans khi cần
10. Add caching layer nếu slow

---

*Last updated: February 13, 2026*
