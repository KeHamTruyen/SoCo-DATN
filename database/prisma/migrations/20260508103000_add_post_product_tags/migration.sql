-- Create enum for post product tag anchors
CREATE TYPE "PostProductAnchorType" AS ENUM ('MEDIA_HOTSPOT', 'INLINE_TEXT', 'CONTENT_BLOCK');

-- Create table to support multi-product tagging in posts
CREATE TABLE "post_product_tags" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
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
    CONSTRAINT "post_product_tags_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "post_product_tags_post_id_sort_order_idx" ON "post_product_tags"("post_id", "sort_order");
CREATE INDEX "post_product_tags_product_id_idx" ON "post_product_tags"("product_id");

ALTER TABLE "post_product_tags"
    ADD CONSTRAINT "post_product_tags_post_id_fkey"
    FOREIGN KEY ("post_id") REFERENCES "posts"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "post_product_tags"
    ADD CONSTRAINT "post_product_tags_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
