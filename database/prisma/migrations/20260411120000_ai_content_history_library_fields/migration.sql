-- AlterTable: Creative Lab Library (source idea + product snapshot)
ALTER TABLE "ai_content_history" ADD COLUMN IF NOT EXISTS "source_idea" TEXT;
ALTER TABLE "ai_content_history" ADD COLUMN IF NOT EXISTS "linked_product_id" TEXT;
ALTER TABLE "ai_content_history" ADD COLUMN IF NOT EXISTS "product_title" VARCHAR(500);
ALTER TABLE "ai_content_history" ADD COLUMN IF NOT EXISTS "product_image_url" VARCHAR(2048);
