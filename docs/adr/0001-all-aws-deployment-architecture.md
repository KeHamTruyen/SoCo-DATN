---
status: deprecated
superseded: docs/adr/0002-render-supabase-deployment.md
---

# Kiến trúc All-AWS với Cổng CloudFront

**Deprecated.** Production SoCo không còn chạy All-AWS. Quyết định hiện tại: [0002-render-supabase-deployment.md](./0002-render-supabase-deployment.md).

SoCo-DATN từng cân nhắc triển khai Ứng dụng chính theo Kiến trúc All-AWS: Frontend tĩnh trên S3, Backend API trên Máy chủ EC2, cả hai phục vụ qua một Cổng CloudFront; Neon/Upstash ngoài AWS.

**Considered Options (historical):** Hybrid (EC2 + Vercel), All-AWS với domain riêng, All-AWS không domain qua CloudFront reverse proxy.

**Consequences (historical):** CloudFront cần nhiều behavior; chi phí/ops EC2 cao hơn so với Render Free cho giai đoạn demo đồ án.
