-- CreateEnum
CREATE TYPE "GroupJoinRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "group_join_requests" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "GroupJoinRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_join_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_invites" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "used_by" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "max_uses" INTEGER NOT NULL DEFAULT 1,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "group_join_requests_group_id_user_id_key" ON "group_join_requests"("group_id", "user_id");

-- CreateIndex
CREATE INDEX "group_join_requests_group_id_status_idx" ON "group_join_requests"("group_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "group_invites_code_key" ON "group_invites"("code");

-- CreateIndex
CREATE INDEX "group_invites_group_id_is_active_idx" ON "group_invites"("group_id", "is_active");

-- AddForeignKey
ALTER TABLE "group_join_requests" ADD CONSTRAINT "group_join_requests_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_join_requests" ADD CONSTRAINT "group_join_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_join_requests" ADD CONSTRAINT "group_join_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_invites" ADD CONSTRAINT "group_invites_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_invites" ADD CONSTRAINT "group_invites_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_invites" ADD CONSTRAINT "group_invites_used_by_fkey" FOREIGN KEY ("used_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
