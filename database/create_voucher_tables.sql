-- Create Voucher Table
CREATE TABLE IF NOT EXISTS "Voucher" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Voucher_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create VoucherUsage Table
CREATE TABLE IF NOT EXISTS "VoucherUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voucherId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VoucherUsage_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VoucherUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VoucherUsage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS "VoucherUsage_voucherId_userId_orderId_key" ON "VoucherUsage"("voucherId", "userId", "orderId");
CREATE INDEX IF NOT EXISTS "Voucher_code_idx" ON "Voucher"("code");
CREATE INDEX IF NOT EXISTS "Voucher_status_expiresAt_idx" ON "Voucher"("status", "expiresAt");
CREATE INDEX IF NOT EXISTS "VoucherUsage_voucherId_idx" ON "VoucherUsage"("voucherId");
CREATE INDEX IF NOT EXISTS "VoucherUsage_userId_idx" ON "VoucherUsage"("userId");

-- Add voucher fields to Order if not exist
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "voucherCode" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "appliedVoucherId" TEXT;
DO $$ 
BEGIN 
    ALTER TABLE "Order" ADD CONSTRAINT "Order_appliedVoucherId_fkey" FOREIGN KEY ("appliedVoucherId") REFERENCES "Voucher" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS "Order_voucherCode_idx" ON "Order"("voucherCode");
CREATE INDEX IF NOT EXISTS "Order_appliedVoucherId_idx" ON "Order"("appliedVoucherId");
