-- Add product soft delete lifecycle fields
CREATE TYPE "ProductDeletionState" AS ENUM ('ACTIVE', 'SOFT_DELETED', 'PURGED_PENDING', 'PURGED_DONE', 'PURGE_FAILED');

ALTER TABLE "products"
ADD COLUMN "deletion_state" "ProductDeletionState" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "deleted_at" TIMESTAMP(3),
ADD COLUMN "deleted_by" TEXT,
ADD COLUMN "delete_reason" TEXT,
ADD COLUMN "purge_after" TIMESTAMP(3),
ADD COLUMN "last_purge_error" TEXT;

CREATE INDEX "products_deletion_state_purge_after_idx" ON "products"("deletion_state", "purge_after");
CREATE INDEX "products_seller_id_deleted_at_idx" ON "products"("seller_id", "deleted_at");

CREATE TABLE "product_deletion_audits" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "actor_id" TEXT,
    "actor_role" TEXT,
    "event" VARCHAR(80) NOT NULL,
    "reason" VARCHAR(300),
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_deletion_audits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_deletion_audits_product_id_created_at_idx" ON "product_deletion_audits"("product_id", "created_at");
