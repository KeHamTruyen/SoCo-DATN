-- Voucher System SQL Migration
-- Run this manually if Prisma migration fails

-- Create Voucher Type Enum
CREATE TYPE "VoucherType" AS ENUM ('FIXED_AMOUNT', 'PERCENTAGE', 'FREE_SHIPPING');

-- Create Voucher Status Enum
CREATE TYPE "VoucherStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');

-- Create Voucher Table
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL UNIQUE,
    "type" "VoucherType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "minOrderAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "maxDiscount" DECIMAL(10,2),
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "maxUsesPerUser" INTEGER NOT NULL DEFAULT 1,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "applicableCategories" TEXT[],
    "applicableProductIds" TEXT[],
    "applicableSellers" TEXT[],
    "excludedUserIds" TEXT[],
    "startsAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "VoucherStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Voucher_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create VoucherUsage Table
CREATE TABLE "VoucherUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voucherId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VoucherUsage_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VoucherUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VoucherUsage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add unique constraint to prevent duplicate usage
CREATE UNIQUE INDEX "VoucherUsage_voucherId_userId_orderId_key" ON "VoucherUsage"("voucherId", "userId", "orderId");

-- Add indexes for performance
CREATE INDEX "Voucher_code_idx" ON "Voucher"("code");
CREATE INDEX "Voucher_status_expiresAt_idx" ON "Voucher"("status", "expiresAt");
CREATE INDEX "VoucherUsage_voucherId_idx" ON "VoucherUsage"("voucherId");
CREATE INDEX "VoucherUsage_userId_idx" ON "VoucherUsage"("userId");

-- Modify Order Table to add voucher fields
ALTER TABLE "Order" ADD COLUMN "voucherCode" TEXT,
ADD COLUMN "appliedVoucherId" TEXT,
ADD CONSTRAINT "Order_appliedVoucherId_fkey" FOREIGN KEY ("appliedVoucherId") REFERENCES "Voucher" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add relation to User for created vouchers
-- (Prisma will handle this via the createdBy FK)

-- Add voucherUsages relation to User
-- (Prisma will handle via VoucherUsage table)

-- Add indexes for Order queries
CREATE INDEX "Order_voucherCode_idx" ON "Order"("voucherCode");
CREATE INDEX "Order_appliedVoucherId_idx" ON "Order"("appliedVoucherId");
