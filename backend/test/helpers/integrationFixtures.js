import bcrypt from "bcryptjs";
import prisma from "../../src/config/database.js";

const BUYER_EMAIL =
    process.env.INTEGRATION_BUYER_EMAIL?.trim() ||
    "integration-e2e@soco.test";
const BUYER_PASSWORD =
    process.env.INTEGRATION_BUYER_PASSWORD || "IntegrationTest@123";

/**
 * Ensures a verified BUYER exists for API login (works without prisma seed).
 */
export async function ensureIntegrationBuyer() {
    const passwordHash = await bcrypt.hash(BUYER_PASSWORD, 12);
    const existing = await prisma.user.findUnique({
        where: { email: BUYER_EMAIL },
    });
    if (existing) {
        await prisma.user.update({
            where: { id: existing.id },
            data: {
                isVerified: true,
                isActive: true,
                passwordHash,
            },
        });
    } else {
        await prisma.user.create({
            data: {
                email: BUYER_EMAIL,
                username: `it_${Date.now().toString(36)}`.slice(0, 20),
                passwordHash,
                fullName: "Integration E2E Buyer",
                role: "BUYER",
                isVerified: true,
                isActive: true,
            },
        });
    }
    return { email: BUYER_EMAIL, password: BUYER_PASSWORD };
}

/**
 * Returns any ACTIVE product id, or creates a minimal seller + product when the DB is empty.
 */
export async function getOrCreateActiveProductId() {
    const found = await prisma.product.findFirst({
        where: {
            status: "ACTIVE",
            deletionState: "ACTIVE",
        },
        select: { id: true },
        orderBy: { createdAt: "asc" },
    });
    if (found) {
        return found.id;
    }

    const passwordHash = await bcrypt.hash("IntegrationSellerUnused@1", 12);
    const seller = await prisma.user.create({
        data: {
            email: `it-seller-${Date.now()}@soco.test`,
            username: `sel_${Date.now().toString(36)}`.slice(0, 18),
            passwordHash,
            fullName: "Integration Seller",
            role: "SELLER",
            isVerified: true,
            isActive: true,
        },
    });

    const product = await prisma.product.create({
        data: {
            sellerId: seller.id,
            title: "Integration Test Product",
            slug: `it-prod-${Date.now().toString(36)}`,
            price: 100000,
            stockQuantity: 50,
            status: "ACTIVE",
            publishedAt: new Date(),
        },
        select: { id: true },
    });

    return product.id;
}
