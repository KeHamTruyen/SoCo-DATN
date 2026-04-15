import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
dotenv.config({ path: path.join(__dirname, "..", "..", "backend", ".env") });

const backendClientPath = path.join(
    __dirname,
    "..",
    "..",
    "backend",
    "node_modules",
    "@prisma",
    "client",
);
const { PrismaClient } = require(backendClientPath);
const bcrypt = (await import("bcryptjs")).default;

const prisma = new PrismaClient();

const FIXED_IDS = {
    electronicsCategory: "7ea4f90a-90de-47e9-94b3-694af2247f10",
    fashionCategory: "7ea4f90a-90de-47e9-94b3-694af2247f11",
    accessoriesCategory: "7ea4f90a-90de-47e9-94b3-694af2247f12",
    sellerUser: "7ea4f90a-90de-47e9-94b3-694af2247f20",
    buyerOneUser: "7ea4f90a-90de-47e9-94b3-694af2247f21",
    buyerTwoUser: "7ea4f90a-90de-47e9-94b3-694af2247f22",
    productWirelessEarbuds: "7ea4f90a-90de-47e9-94b3-694af2247f30",
    productPhoneCase: "7ea4f90a-90de-47e9-94b3-694af2247f31",
    productCottonShirt: "7ea4f90a-90de-47e9-94b3-694af2247f32",
    orderOne: "7ea4f90a-90de-47e9-94b3-694af2247f40",
    orderTwo: "7ea4f90a-90de-47e9-94b3-694af2247f41",
    orderItemOne: "7ea4f90a-90de-47e9-94b3-694af2247f50",
    orderItemTwo: "7ea4f90a-90de-47e9-94b3-694af2247f51",
    orderItemThree: "7ea4f90a-90de-47e9-94b3-694af2247f52",
};

async function main() {
    const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.SEED_ADMIN_PASSWORD;
    const username = process.env.SEED_ADMIN_USERNAME?.trim();
    const fullName =
        process.env.SEED_ADMIN_FULL_NAME?.trim() || "Administrator";

    if (!email || !password || !username) {
        throw new Error(
            "Seed requires SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, and SEED_ADMIN_USERNAME in backend/.env (see backend/.env.example).",
        );
    }

    const userConflict = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
    });
    if (userConflict) {
        throw new Error(
            `Cannot seed admin: ${email} or ${username} is already used by a buyer/seller account.`,
        );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.admin.upsert({
        where: { email },
        update: {
            username,
            fullName,
            passwordHash,
            isActive: true,
        },
        data: {
            email,
            username,
            passwordHash,
            fullName,
            isActive: true,
        },
    });
    console.log(`Seeded platform admin: ${email} (${username})`);

    const qaUserPasswordHash = await bcrypt.hash(
        process.env.SEED_QA_USER_PASSWORD || "QaUser@123",
        12,
    );

    const categories = await prisma.$transaction(async (tx) => {
        const electronics = await tx.category.upsert({
            where: { slug: "electronics" },
            update: {
                name: "Electronics",
                description: "Devices and gadgets",
                isActive: true,
                parentId: null,
            },
            create: {
                id: FIXED_IDS.electronicsCategory,
                name: "Electronics",
                slug: "electronics",
                description: "Devices and gadgets",
                isActive: true,
                displayOrder: 1,
            },
        });
        const fashion = await tx.category.upsert({
            where: { slug: "fashion" },
            update: {
                name: "Fashion",
                description: "Clothing and accessories",
                isActive: true,
                parentId: null,
            },
            create: {
                id: FIXED_IDS.fashionCategory,
                name: "Fashion",
                slug: "fashion",
                description: "Clothing and accessories",
                isActive: true,
                displayOrder: 2,
            },
        });
        const accessories = await tx.category.upsert({
            where: { slug: "phone-accessories" },
            update: {
                name: "Phone Accessories",
                parentId: electronics.id,
                isActive: true,
            },
            create: {
                id: FIXED_IDS.accessoriesCategory,
                name: "Phone Accessories",
                slug: "phone-accessories",
                description: "Cases and accessories for mobile devices",
                isActive: true,
                parentId: electronics.id,
                displayOrder: 1,
            },
        });
        return { electronics, fashion, accessories };
    });

    const users = await prisma.$transaction(async (tx) => {
        const seller = await tx.user.upsert({
            where: { email: "seller.qa@soco.local" },
            update: {
                username: "seller_qa",
                fullName: "QA Seller",
                role: "SELLER",
                isVerified: true,
                isActive: true,
                passwordHash: qaUserPasswordHash,
                shopInformation: {
                    shopName: "QA Electronics Store",
                    description: "Seeded seller account for QA/UAT",
                },
            },
            create: {
                id: FIXED_IDS.sellerUser,
                email: "seller.qa@soco.local",
                username: "seller_qa",
                fullName: "QA Seller",
                passwordHash: qaUserPasswordHash,
                role: "SELLER",
                isVerified: true,
                isActive: true,
                shopInformation: {
                    shopName: "QA Electronics Store",
                    description: "Seeded seller account for QA/UAT",
                },
            },
        });
        const buyerOne = await tx.user.upsert({
            where: { email: "buyer1.qa@soco.local" },
            update: {
                username: "buyer_qa_1",
                fullName: "QA Buyer One",
                role: "BUYER",
                isVerified: true,
                isActive: true,
                passwordHash: qaUserPasswordHash,
            },
            create: {
                id: FIXED_IDS.buyerOneUser,
                email: "buyer1.qa@soco.local",
                username: "buyer_qa_1",
                fullName: "QA Buyer One",
                passwordHash: qaUserPasswordHash,
                role: "BUYER",
                isVerified: true,
                isActive: true,
            },
        });
        const buyerTwo = await tx.user.upsert({
            where: { email: "buyer2.qa@soco.local" },
            update: {
                username: "buyer_qa_2",
                fullName: "QA Buyer Two",
                role: "BUYER",
                isVerified: true,
                isActive: true,
                passwordHash: qaUserPasswordHash,
            },
            create: {
                id: FIXED_IDS.buyerTwoUser,
                email: "buyer2.qa@soco.local",
                username: "buyer_qa_2",
                fullName: "QA Buyer Two",
                passwordHash: qaUserPasswordHash,
                role: "BUYER",
                isVerified: true,
                isActive: true,
            },
        });
        return { seller, buyerOne, buyerTwo };
    });

    const products = await prisma.$transaction(async (tx) => {
        const wirelessEarbuds = await tx.product.upsert({
            where: { slug: "qa-wireless-earbuds" },
            update: {
                title: "QA Wireless Earbuds",
                description: "Seeded earbuds product for QA checkout and review flow",
                price: "799000",
                stockQuantity: 120,
                status: "ACTIVE",
                sellerId: users.seller.id,
                publishedAt: new Date(),
                categories: {
                    set: [
                        { id: categories.electronics.id },
                        { id: categories.accessories.id },
                    ],
                },
            },
            create: {
                id: FIXED_IDS.productWirelessEarbuds,
                slug: "qa-wireless-earbuds",
                title: "QA Wireless Earbuds",
                description: "Seeded earbuds product for QA checkout and review flow",
                price: "799000",
                stockQuantity: 120,
                status: "ACTIVE",
                sellerId: users.seller.id,
                publishedAt: new Date(),
                categories: {
                    connect: [
                        { id: categories.electronics.id },
                        { id: categories.accessories.id },
                    ],
                },
            },
        });
        const phoneCase = await tx.product.upsert({
            where: { slug: "qa-phone-case" },
            update: {
                title: "QA Shockproof Phone Case",
                description: "Seeded phone case for accessories testing",
                price: "149000",
                stockQuantity: 250,
                status: "ACTIVE",
                sellerId: users.seller.id,
                publishedAt: new Date(),
                categories: {
                    set: [{ id: categories.accessories.id }],
                },
            },
            create: {
                id: FIXED_IDS.productPhoneCase,
                slug: "qa-phone-case",
                title: "QA Shockproof Phone Case",
                description: "Seeded phone case for accessories testing",
                price: "149000",
                stockQuantity: 250,
                status: "ACTIVE",
                sellerId: users.seller.id,
                publishedAt: new Date(),
                categories: {
                    connect: [{ id: categories.accessories.id }],
                },
            },
        });
        const cottonShirt = await tx.product.upsert({
            where: { slug: "qa-cotton-shirt" },
            update: {
                title: "QA Cotton Shirt",
                description: "Seeded fashion product for catalog coverage",
                price: "329000",
                stockQuantity: 90,
                status: "ACTIVE",
                sellerId: users.seller.id,
                publishedAt: new Date(),
                categories: {
                    set: [{ id: categories.fashion.id }],
                },
            },
            create: {
                id: FIXED_IDS.productCottonShirt,
                slug: "qa-cotton-shirt",
                title: "QA Cotton Shirt",
                description: "Seeded fashion product for catalog coverage",
                price: "329000",
                stockQuantity: 90,
                status: "ACTIVE",
                sellerId: users.seller.id,
                publishedAt: new Date(),
                categories: {
                    connect: [{ id: categories.fashion.id }],
                },
            },
        });

        const upsertPrimaryImage = async (productId, imageUrl) => {
            const existing = await tx.productImage.findFirst({
                where: { productId, isPrimary: true },
            });
            if (existing) {
                await tx.productImage.update({
                    where: { id: existing.id },
                    data: { imageUrl },
                });
                return;
            }
            await tx.productImage.create({
                data: {
                    productId,
                    imageUrl,
                    altText: "QA product image",
                    displayOrder: 0,
                    isPrimary: true,
                },
            });
        };

        await upsertPrimaryImage(
            wirelessEarbuds.id,
            "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
        );
        await upsertPrimaryImage(
            phoneCase.id,
            "https://images.unsplash.com/photo-1603314585442-ee3b3c16fbcf?w=800",
        );
        await upsertPrimaryImage(
            cottonShirt.id,
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
        );

        return { wirelessEarbuds, phoneCase, cottonShirt };
    });

    const orders = await prisma.$transaction(async (tx) => {
        const orderOne = await tx.order.upsert({
            where: { orderNumber: "QA-ORDER-0001" },
            update: {
                buyerId: users.buyerOne.id,
                subtotal: "948000",
                total: "968000",
                shippingFee: "20000",
                paymentMethod: "COD",
                paymentStatus: "PAID",
                status: "DELIVERED",
                shippingName: "QA Buyer One",
                shippingPhone: "0900000001",
                shippingAddress: "123 QA Street, District 1",
                shippingCity: "Ho Chi Minh",
                deliveredAt: new Date(),
            },
            create: {
                id: FIXED_IDS.orderOne,
                orderNumber: "QA-ORDER-0001",
                buyerId: users.buyerOne.id,
                subtotal: "948000",
                total: "968000",
                shippingFee: "20000",
                paymentMethod: "COD",
                paymentStatus: "PAID",
                status: "DELIVERED",
                shippingName: "QA Buyer One",
                shippingPhone: "0900000001",
                shippingAddress: "123 QA Street, District 1",
                shippingCity: "Ho Chi Minh",
                deliveredAt: new Date(),
            },
        });
        const orderTwo = await tx.order.upsert({
            where: { orderNumber: "QA-ORDER-0002" },
            update: {
                buyerId: users.buyerTwo.id,
                subtotal: "329000",
                total: "349000",
                shippingFee: "20000",
                paymentMethod: "COD",
                paymentStatus: "PAID",
                status: "COMPLETED",
                shippingName: "QA Buyer Two",
                shippingPhone: "0900000002",
                shippingAddress: "456 QA Street, District 7",
                shippingCity: "Ho Chi Minh",
                deliveredAt: new Date(),
            },
            create: {
                id: FIXED_IDS.orderTwo,
                orderNumber: "QA-ORDER-0002",
                buyerId: users.buyerTwo.id,
                subtotal: "329000",
                total: "349000",
                shippingFee: "20000",
                paymentMethod: "COD",
                paymentStatus: "PAID",
                status: "COMPLETED",
                shippingName: "QA Buyer Two",
                shippingPhone: "0900000002",
                shippingAddress: "456 QA Street, District 7",
                shippingCity: "Ho Chi Minh",
                deliveredAt: new Date(),
            },
        });
        return { orderOne, orderTwo };
    });

    const orderItems = await prisma.$transaction(async (tx) => {
        const orderItemOne = await tx.orderItem.upsert({
            where: { id: FIXED_IDS.orderItemOne },
            update: {
                orderId: orders.orderOne.id,
                productId: products.wirelessEarbuds.id,
                sellerId: users.seller.id,
                productName: products.wirelessEarbuds.title,
                quantity: 1,
                unitPrice: "799000",
                totalPrice: "799000",
                status: "delivered",
            },
            create: {
                id: FIXED_IDS.orderItemOne,
                orderId: orders.orderOne.id,
                productId: products.wirelessEarbuds.id,
                sellerId: users.seller.id,
                productName: products.wirelessEarbuds.title,
                productImageUrl:
                    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
                quantity: 1,
                unitPrice: "799000",
                totalPrice: "799000",
                status: "delivered",
            },
        });
        const orderItemTwo = await tx.orderItem.upsert({
            where: { id: FIXED_IDS.orderItemTwo },
            update: {
                orderId: orders.orderOne.id,
                productId: products.phoneCase.id,
                sellerId: users.seller.id,
                productName: products.phoneCase.title,
                quantity: 1,
                unitPrice: "149000",
                totalPrice: "149000",
                status: "delivered",
            },
            create: {
                id: FIXED_IDS.orderItemTwo,
                orderId: orders.orderOne.id,
                productId: products.phoneCase.id,
                sellerId: users.seller.id,
                productName: products.phoneCase.title,
                productImageUrl:
                    "https://images.unsplash.com/photo-1603314585442-ee3b3c16fbcf?w=800",
                quantity: 1,
                unitPrice: "149000",
                totalPrice: "149000",
                status: "delivered",
            },
        });
        const orderItemThree = await tx.orderItem.upsert({
            where: { id: FIXED_IDS.orderItemThree },
            update: {
                orderId: orders.orderTwo.id,
                productId: products.cottonShirt.id,
                sellerId: users.seller.id,
                productName: products.cottonShirt.title,
                quantity: 1,
                unitPrice: "329000",
                totalPrice: "329000",
                status: "completed",
            },
            create: {
                id: FIXED_IDS.orderItemThree,
                orderId: orders.orderTwo.id,
                productId: products.cottonShirt.id,
                sellerId: users.seller.id,
                productName: products.cottonShirt.title,
                productImageUrl:
                    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
                quantity: 1,
                unitPrice: "329000",
                totalPrice: "329000",
                status: "completed",
            },
        });
        return { orderItemOne, orderItemTwo, orderItemThree };
    });

    await prisma.$transaction(async (tx) => {
        await tx.review.upsert({
            where: { orderItemId: orderItems.orderItemOne.id },
            update: {
                productId: products.wirelessEarbuds.id,
                userId: users.buyerOne.id,
                rating: 5,
                title: "Excellent sound quality",
                content: "Battery life and sound are both great for daily use.",
                images: [
                    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
                ],
                sellerResponse: "Thank you for your review!",
                sellerResponseAt: new Date(),
                isPublished: true,
                isVerifiedPurchase: true,
            },
            create: {
                productId: products.wirelessEarbuds.id,
                orderItemId: orderItems.orderItemOne.id,
                userId: users.buyerOne.id,
                rating: 5,
                title: "Excellent sound quality",
                content: "Battery life and sound are both great for daily use.",
                images: [
                    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
                ],
                sellerResponse: "Thank you for your review!",
                sellerResponseAt: new Date(),
                isPublished: true,
                isVerifiedPurchase: true,
            },
        });

        await tx.review.upsert({
            where: { orderItemId: orderItems.orderItemThree.id },
            update: {
                productId: products.cottonShirt.id,
                userId: users.buyerTwo.id,
                rating: 4,
                title: "Comfortable shirt",
                content: "Good fit and material, suitable for daily wear.",
                images: [],
                isPublished: true,
                isVerifiedPurchase: true,
            },
            create: {
                productId: products.cottonShirt.id,
                orderItemId: orderItems.orderItemThree.id,
                userId: users.buyerTwo.id,
                rating: 4,
                title: "Comfortable shirt",
                content: "Good fit and material, suitable for daily wear.",
                images: [],
                isPublished: true,
                isVerifiedPurchase: true,
            },
        });
    });

    console.log("Seeded QA/UAT data: categories, users, products, orders, order items, reviews.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
