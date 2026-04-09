ALTER TABLE "product_views"
ADD COLUMN "viewed_from_product_id" TEXT;

CREATE INDEX "product_views_user_id_created_at_idx"
ON "product_views"("user_id", "created_at" DESC);

CREATE INDEX "product_views_session_id_created_at_idx"
ON "product_views"("session_id", "created_at" DESC);

ALTER TABLE "product_views"
ADD CONSTRAINT "product_views_viewed_from_product_id_fkey"
FOREIGN KEY ("viewed_from_product_id")
REFERENCES "products"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

CREATE TABLE "user_search_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "query" VARCHAR(200) NOT NULL,
    "normalized_query" VARCHAR(200) NOT NULL,
    "session_id" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_search_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "user_search_events_user_id_created_at_idx"
ON "user_search_events"("user_id", "created_at" DESC);

CREATE INDEX "user_search_events_normalized_query_created_at_idx"
ON "user_search_events"("normalized_query", "created_at" DESC);

ALTER TABLE "user_search_events"
ADD CONSTRAINT "user_search_events_user_id_fkey"
FOREIGN KEY ("user_id")
REFERENCES "users"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

CREATE TABLE "product_co_views" (
    "id" TEXT NOT NULL,
    "source_product_id" TEXT NOT NULL,
    "target_product_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "last_viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "product_co_views_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "product_co_views_source_product_id_target_product_id_key"
ON "product_co_views"("source_product_id", "target_product_id");

CREATE INDEX "product_co_views_source_product_id_score_idx"
ON "product_co_views"("source_product_id", "score" DESC);

CREATE INDEX "product_co_views_target_product_id_score_idx"
ON "product_co_views"("target_product_id", "score" DESC);

ALTER TABLE "product_co_views"
ADD CONSTRAINT "product_co_views_source_product_id_fkey"
FOREIGN KEY ("source_product_id")
REFERENCES "products"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "product_co_views"
ADD CONSTRAINT "product_co_views_target_product_id_fkey"
FOREIGN KEY ("target_product_id")
REFERENCES "products"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
