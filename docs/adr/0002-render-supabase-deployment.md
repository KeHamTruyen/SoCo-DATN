---
status: accepted
supersedes: docs/adr/0001-all-aws-deployment-architecture.md
---

# Deploy production trên Render + Supabase

Production SoCo dùng **Render** cho frontend tĩnh và backend Node, và **Supabase Postgres** (`SocialCommerce`) cho Prisma `DATABASE_URL` — thay All-AWS (S3/CloudFront/EC2) để giảm ops và khớp free tier đồ án.

**Considered Options:** All-AWS (ADR 0001), Hybrid Vercel FE + Render API, Render FE+API + Neon.

**Consequences:** Bốn service Render (`socomain`, `be-socomain`, `socoadmin`, `be-socoadmin`); CORS/`FRONTEND_URL` phải trỏ URL Render; Free plan có cold start; Redis (`REDIS_URL`) vẫn optional trong code, không bắt buộc trên mọi instance.
