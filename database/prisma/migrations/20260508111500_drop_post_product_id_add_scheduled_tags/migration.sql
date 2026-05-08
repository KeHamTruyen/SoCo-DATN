-- Remove legacy single-product tags from posts and scheduled posts
ALTER TABLE "posts" DROP CONSTRAINT IF EXISTS "posts_product_id_fkey";
DROP INDEX IF EXISTS "posts_product_id_created_at_idx";
ALTER TABLE "posts" DROP COLUMN IF EXISTS "product_id";

ALTER TABLE "scheduled_posts" DROP CONSTRAINT IF EXISTS "scheduled_posts_product_id_fkey";
ALTER TABLE "scheduled_posts" DROP COLUMN IF EXISTS "product_id";

-- Create tag table for scheduled posts (multi-product support)
CREATE TABLE "scheduled_post_product_tags" (
    "id" TEXT NOT NULL,
    "scheduled_post_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "anchor_type" "PostProductAnchorType" NOT NULL DEFAULT 'MEDIA_HOTSPOT',
    "position_x" DOUBLE PRECISION,
    "position_y" DOUBLE PRECISION,
    "block_id" VARCHAR(120),
    "start_offset" INTEGER,
    "end_offset" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "scheduled_post_product_tags_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "scheduled_post_product_tags_scheduled_post_id_sort_order_idx"
    ON "scheduled_post_product_tags"("scheduled_post_id", "sort_order");
CREATE INDEX "scheduled_post_product_tags_product_id_idx"
    ON "scheduled_post_product_tags"("product_id");

ALTER TABLE "scheduled_post_product_tags"
    ADD CONSTRAINT "scheduled_post_product_tags_scheduled_post_id_fkey"
    FOREIGN KEY ("scheduled_post_id") REFERENCES "scheduled_posts"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "scheduled_post_product_tags"
    ADD CONSTRAINT "scheduled_post_product_tags_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
