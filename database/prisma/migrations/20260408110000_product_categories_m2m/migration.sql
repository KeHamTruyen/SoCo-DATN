-- Create join table for Product <-> Category many-to-many relation
CREATE TABLE "_ProductCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- Backfill data from legacy products.category_id
INSERT INTO "_ProductCategories" ("A", "B")
SELECT "id", "category_id"
FROM "products"
WHERE "category_id" IS NOT NULL;

-- Ensure uniqueness and query performance
CREATE UNIQUE INDEX "_ProductCategories_AB_unique" ON "_ProductCategories"("A", "B");
CREATE INDEX "_ProductCategories_B_index" ON "_ProductCategories"("B");

-- Add relation constraints
ALTER TABLE "_ProductCategories"
ADD CONSTRAINT "_ProductCategories_A_fkey"
FOREIGN KEY ("A") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_ProductCategories"
ADD CONSTRAINT "_ProductCategories_B_fkey"
FOREIGN KEY ("B") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop legacy single-category column
ALTER TABLE "products" DROP COLUMN "category_id";
