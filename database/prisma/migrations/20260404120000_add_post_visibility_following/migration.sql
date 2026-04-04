-- AlterEnum: audience "people you follow" (followees)
ALTER TYPE "PostVisibility" ADD VALUE 'FOLLOWING';

-- Scheduled posts: persist visibility until publish
ALTER TABLE "scheduled_posts" ADD COLUMN "visibility" "PostVisibility" NOT NULL DEFAULT 'PUBLIC';
