-- AlterTable
ALTER TABLE "posts" ADD COLUMN "location" VARCHAR(500),
ADD COLUMN "feeling" VARCHAR(120),
ADD COLUMN "tagged_user_ids" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "scheduled_posts" ADD COLUMN "location" VARCHAR(500),
ADD COLUMN "feeling" VARCHAR(120),
ADD COLUMN "tagged_user_ids" TEXT[] DEFAULT ARRAY[]::TEXT[];
