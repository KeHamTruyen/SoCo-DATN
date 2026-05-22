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
    cartBuyerOne: "7ea4f90a-90de-47e9-94b3-694af2247f60",
    cartBuyerTwo: "7ea4f90a-90de-47e9-94b3-694af2247f61",
    cartItemOne: "7ea4f90a-90de-47e9-94b3-694af2247f62",
    cartItemTwo: "7ea4f90a-90de-47e9-94b3-694af2247f63",
    groupTechDeals: "7ea4f90a-90de-47e9-94b3-694af2247f70",
    groupDailyStyle: "7ea4f90a-90de-47e9-94b3-694af2247f71",
    groupInviteTech: "7ea4f90a-90de-47e9-94b3-694af2247f72",
    groupJoinRequestBuyerTwo: "7ea4f90a-90de-47e9-94b3-694af2247f73",
    postOne: "7ea4f90a-90de-47e9-94b3-694af2247f80",
    postTwo: "7ea4f90a-90de-47e9-94b3-694af2247f81",
    postThree: "7ea4f90a-90de-47e9-94b3-694af2247f82",
    postCommentOne: "7ea4f90a-90de-47e9-94b3-694af2247f83",
    postCommentTwo: "7ea4f90a-90de-47e9-94b3-694af2247f84",
    postLikeOne: "7ea4f90a-90de-47e9-94b3-694af2247f85",
    postLikeTwo: "7ea4f90a-90de-47e9-94b3-694af2247f86",
    scheduledPostOne: "7ea4f90a-90de-47e9-94b3-694af2247f90",
    directConversation: "7ea4f90a-90de-47e9-94b3-694af2247fa0",
    groupConversation: "7ea4f90a-90de-47e9-94b3-694af2247fa1",
    messageOne: "7ea4f90a-90de-47e9-94b3-694af2247fa2",
    messageTwo: "7ea4f90a-90de-47e9-94b3-694af2247fa3",
    messageThree: "7ea4f90a-90de-47e9-94b3-694af2247fa4",
    messageFour: "7ea4f90a-90de-47e9-94b3-694af2247fa5",
    notificationOne: "7ea4f90a-90de-47e9-94b3-694af2247fb0",
    notificationTwo: "7ea4f90a-90de-47e9-94b3-694af2247fb1",
    notificationThree: "7ea4f90a-90de-47e9-94b3-694af2247fb2",
    notificationFour: "7ea4f90a-90de-47e9-94b3-694af2247fb3",
    aiContentOne: "7ea4f90a-90de-47e9-94b3-694af2247fc0",
    aiContentTwo: "7ea4f90a-90de-47e9-94b3-694af2247fc1",
    productViewOne: "7ea4f90a-90de-47e9-94b3-694af2247fd0",
    productViewTwo: "7ea4f90a-90de-47e9-94b3-694af2247fd1",
    searchEventOne: "7ea4f90a-90de-47e9-94b3-694af2247fe0",
    searchEventTwo: "7ea4f90a-90de-47e9-94b3-694af2247fe1",
    sellerStatsToday: "7ea4f90a-90de-47e9-94b3-694af2247ff0",
    reportOne: "7ea4f90a-90de-47e9-94b3-694af2247ff1",
    reportTwo: "7ea4f90a-90de-47e9-94b3-694af2247ff2",
    savedItemPost: "7ea4f90a-90de-47e9-94b3-694af2247ff3",
    savedItemProduct: "7ea4f90a-90de-47e9-94b3-694af2247ff4",
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
    const admin = await prisma.admin.upsert({
        where: { email },
        update: {
            username,
            fullName,
            passwordHash,
            isActive: true,
        },
        create: {
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

    const sellerVerification = await prisma.sellerVerification.upsert({
        where: { userId: users.seller.id },
        update: {
            step1Completed: true,
            step2Completed: true,
            step3Completed: true,
            businessName: "QA Electronics Store",
            businessType: "COMPANY",
            taxCode: "0312345678",
            bankName: "Vietcombank",
            bankAccountName: "QA SELLER",
            status: "APPROVED",
            verifiedBy: admin.id,
            verifiedAt: new Date(),
        },
        create: {
            userId: users.seller.id,
            step1Completed: true,
            step2Completed: true,
            step3Completed: true,
            address: "123 QA Street, District 1",
            businessName: "QA Electronics Store",
            businessType: "COMPANY",
            businessLicenseNumber: "BLN-2026-QA",
            taxCode: "0312345678",
            bankName: "Vietcombank",
            bankAccountName: "QA SELLER",
            status: "APPROVED",
            verifiedBy: admin.id,
            verifiedAt: new Date(),
        },
    });

    await prisma.$transaction(async (tx) => {
        await tx.follow.upsert({
            where: {
                followerId_followingId: {
                    followerId: users.buyerOne.id,
                    followingId: users.seller.id,
                },
            },
            update: {},
            create: {
                followerId: users.buyerOne.id,
                followingId: users.seller.id,
            },
        });
        await tx.follow.upsert({
            where: {
                followerId_followingId: {
                    followerId: users.buyerTwo.id,
                    followingId: users.seller.id,
                },
            },
            update: {},
            create: {
                followerId: users.buyerTwo.id,
                followingId: users.seller.id,
            },
        });
    });

    const groups = await prisma.$transaction(async (tx) => {
        const techDeals = await tx.group.upsert({
            where: { slug: "qa-tech-deals" },
            update: {
                name: "QA Tech Deals",
                description: "Group for discussing electronics deals and accessories",
                privacy: "PUBLIC",
                membersCount: 3,
                postsCount: 1,
                createdBy: users.seller.id,
            },
            create: {
                id: FIXED_IDS.groupTechDeals,
                name: "QA Tech Deals",
                slug: "qa-tech-deals",
                description: "Group for discussing electronics deals and accessories",
                privacy: "PUBLIC",
                membersCount: 3,
                postsCount: 1,
                createdBy: users.seller.id,
            },
        });

        const dailyStyle = await tx.group.upsert({
            where: { slug: "qa-daily-style" },
            update: {
                name: "QA Daily Style",
                description: "Community for fashion reviews and outfit ideas",
                privacy: "PRIVATE",
                membersCount: 2,
                postsCount: 1,
                createdBy: users.buyerOne.id,
            },
            create: {
                id: FIXED_IDS.groupDailyStyle,
                name: "QA Daily Style",
                slug: "qa-daily-style",
                description: "Community for fashion reviews and outfit ideas",
                privacy: "PRIVATE",
                membersCount: 2,
                postsCount: 1,
                createdBy: users.buyerOne.id,
            },
        });

        return { techDeals, dailyStyle };
    });

    await prisma.$transaction(async (tx) => {
        await tx.groupMember.upsert({
            where: {
                groupId_userId: {
                    groupId: groups.techDeals.id,
                    userId: users.seller.id,
                },
            },
            update: { role: "ADMIN" },
            create: {
                groupId: groups.techDeals.id,
                userId: users.seller.id,
                role: "ADMIN",
            },
        });
        await tx.groupMember.upsert({
            where: {
                groupId_userId: {
                    groupId: groups.techDeals.id,
                    userId: users.buyerOne.id,
                },
            },
            update: { role: "MODERATOR" },
            create: {
                groupId: groups.techDeals.id,
                userId: users.buyerOne.id,
                role: "MODERATOR",
            },
        });
        await tx.groupMember.upsert({
            where: {
                groupId_userId: {
                    groupId: groups.techDeals.id,
                    userId: users.buyerTwo.id,
                },
            },
            update: { role: "MEMBER" },
            create: {
                groupId: groups.techDeals.id,
                userId: users.buyerTwo.id,
                role: "MEMBER",
            },
        });
        await tx.groupMember.upsert({
            where: {
                groupId_userId: {
                    groupId: groups.dailyStyle.id,
                    userId: users.buyerOne.id,
                },
            },
            update: { role: "ADMIN" },
            create: {
                groupId: groups.dailyStyle.id,
                userId: users.buyerOne.id,
                role: "ADMIN",
            },
        });
        await tx.groupMember.upsert({
            where: {
                groupId_userId: {
                    groupId: groups.dailyStyle.id,
                    userId: users.seller.id,
                },
            },
            update: { role: "MEMBER" },
            create: {
                groupId: groups.dailyStyle.id,
                userId: users.seller.id,
                role: "MEMBER",
            },
        });

        await tx.groupJoinRequest.upsert({
            where: {
                groupId_userId: {
                    groupId: groups.dailyStyle.id,
                    userId: users.buyerTwo.id,
                },
            },
            update: {
                status: "PENDING",
                reviewedBy: null,
                reviewedAt: null,
            },
            create: {
                id: FIXED_IDS.groupJoinRequestBuyerTwo,
                groupId: groups.dailyStyle.id,
                userId: users.buyerTwo.id,
                status: "PENDING",
            },
        });

        await tx.groupInvite.upsert({
            where: { code: "QA-TECH-INVITE" },
            update: {
                groupId: groups.techDeals.id,
                createdBy: users.seller.id,
                usedBy: users.buyerTwo.id,
                usedCount: 1,
                maxUses: 5,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
                isActive: true,
            },
            create: {
                id: FIXED_IDS.groupInviteTech,
                groupId: groups.techDeals.id,
                code: "QA-TECH-INVITE",
                createdBy: users.seller.id,
                usedBy: users.buyerTwo.id,
                usedCount: 1,
                maxUses: 5,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
                isActive: true,
            },
        });
    });

    const posts = await prisma.$transaction(async (tx) => {
        const postOne = await tx.post.upsert({
            where: { id: FIXED_IDS.postOne },
            update: {
                authorId: users.seller.id,
                content: "Deal hôm nay: QA Wireless Earbuds giảm giá cho hội viên.",
                mediaUrls: [
                    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1000",
                ],
                mediaType: "IMAGE",
                taggedUserIds: [users.buyerOne.id],
                status: "PUBLISHED",
                visibility: "PUBLIC",
                likesCount: 2,
                commentsCount: 1,
                sharesCount: 1,
                viewsCount: 32,
                publishedAt: new Date(),
            },
            create: {
                id: FIXED_IDS.postOne,
                authorId: users.seller.id,
                content: "Deal hôm nay: QA Wireless Earbuds giảm giá cho hội viên.",
                mediaUrls: [
                    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1000",
                ],
                mediaType: "IMAGE",
                taggedUserIds: [users.buyerOne.id],
                status: "PUBLISHED",
                visibility: "PUBLIC",
                likesCount: 2,
                commentsCount: 1,
                sharesCount: 1,
                viewsCount: 32,
                publishedAt: new Date(),
            },
        });

        const postTwo = await tx.post.upsert({
            where: { id: FIXED_IDS.postTwo },
            update: {
                authorId: users.buyerOne.id,
                groupId: groups.dailyStyle.id,
                content: "Áo cotton QA mặc khá thoải mái, ai đã thử chưa?",
                mediaUrls: [
                    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1000",
                ],
                mediaType: "IMAGE",
                status: "PUBLISHED",
                visibility: "FOLLOWERS",
                likesCount: 1,
                commentsCount: 1,
                viewsCount: 16,
                publishedAt: new Date(),
            },
            create: {
                id: FIXED_IDS.postTwo,
                authorId: users.buyerOne.id,
                groupId: groups.dailyStyle.id,
                content: "Áo cotton QA mặc khá thoải mái, ai đã thử chưa?",
                mediaUrls: [
                    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1000",
                ],
                mediaType: "IMAGE",
                status: "PUBLISHED",
                visibility: "FOLLOWERS",
                likesCount: 1,
                commentsCount: 1,
                viewsCount: 16,
                publishedAt: new Date(),
            },
        });

        const postThree = await tx.post.upsert({
            where: { id: FIXED_IDS.postThree },
            update: {
                authorId: users.seller.id,
                groupId: groups.techDeals.id,
                content: "Tuần sau sẽ có combo phụ kiện mới, mọi người chờ nhé.",
                mediaUrls: [],
                status: "PUBLISHED",
                visibility: "PUBLIC",
                likesCount: 0,
                commentsCount: 0,
                viewsCount: 5,
                publishedAt: new Date(),
            },
            create: {
                id: FIXED_IDS.postThree,
                authorId: users.seller.id,
                groupId: groups.techDeals.id,
                content: "Tuần sau sẽ có combo phụ kiện mới, mọi người chờ nhé.",
                mediaUrls: [],
                status: "PUBLISHED",
                visibility: "PUBLIC",
                likesCount: 0,
                commentsCount: 0,
                viewsCount: 5,
                publishedAt: new Date(),
            },
        });

        await tx.postProductTag.deleteMany({
            where: { postId: { in: [postOne.id, postTwo.id] } },
        });
        await tx.postProductTag.createMany({
            data: [
                {
                    postId: postOne.id,
                    productId: products.wirelessEarbuds.id,
                    anchorType: "MEDIA_HOTSPOT",
                    positionX: 45,
                    positionY: 48,
                    sortOrder: 0,
                },
                {
                    postId: postOne.id,
                    productId: products.phoneCase.id,
                    anchorType: "MEDIA_HOTSPOT",
                    positionX: 66,
                    positionY: 56,
                    sortOrder: 1,
                },
                {
                    postId: postTwo.id,
                    productId: products.cottonShirt.id,
                    anchorType: "INLINE_TEXT",
                    startOffset: 0,
                    endOffset: 12,
                    sortOrder: 0,
                },
            ],
        });

        return { postOne, postTwo, postThree };
    });

    await prisma.$transaction(async (tx) => {
        await tx.postLike.upsert({
            where: { id: FIXED_IDS.postLikeOne },
            update: {
                postId: posts.postOne.id,
                userId: users.buyerOne.id,
            },
            create: {
                id: FIXED_IDS.postLikeOne,
                postId: posts.postOne.id,
                userId: users.buyerOne.id,
            },
        });
        await tx.postLike.upsert({
            where: { id: FIXED_IDS.postLikeTwo },
            update: {
                postId: posts.postOne.id,
                userId: users.buyerTwo.id,
            },
            create: {
                id: FIXED_IDS.postLikeTwo,
                postId: posts.postOne.id,
                userId: users.buyerTwo.id,
            },
        });

        await tx.postComment.upsert({
            where: { id: FIXED_IDS.postCommentOne },
            update: {
                postId: posts.postOne.id,
                userId: users.buyerOne.id,
                content: "Giá này ổn quá, shop còn màu đen không?",
            },
            create: {
                id: FIXED_IDS.postCommentOne,
                postId: posts.postOne.id,
                userId: users.buyerOne.id,
                content: "Giá này ổn quá, shop còn màu đen không?",
            },
        });
        await tx.postComment.upsert({
            where: { id: FIXED_IDS.postCommentTwo },
            update: {
                postId: posts.postTwo.id,
                userId: users.seller.id,
                content: "Form áo regular fit, dễ phối đồ lắm nhé.",
                parentId: null,
            },
            create: {
                id: FIXED_IDS.postCommentTwo,
                postId: posts.postTwo.id,
                userId: users.seller.id,
                content: "Form áo regular fit, dễ phối đồ lắm nhé.",
                parentId: null,
            },
        });
    });

    const scheduledTime = new Date(Date.now() + 1000 * 60 * 60 * 8);
    await prisma.scheduledPost.upsert({
        where: { id: FIXED_IDS.scheduledPostOne },
        update: {
            userId: users.seller.id,
            content: "Bài hẹn giờ: giới thiệu ốp lưng chống sốc bản mới.",
            mediaUrls: [
                "https://images.unsplash.com/photo-1603314585442-ee3b3c16fbcf?w=1000",
            ],
            mediaType: "IMAGE",
            visibility: "PUBLIC",
            timezone: "Asia/Ho_Chi_Minh",
            scheduledTime,
            status: "scheduled",
            errorMessage: null,
        },
        create: {
            id: FIXED_IDS.scheduledPostOne,
            userId: users.seller.id,
            content: "Bài hẹn giờ: giới thiệu ốp lưng chống sốc bản mới.",
            mediaUrls: [
                "https://images.unsplash.com/photo-1603314585442-ee3b3c16fbcf?w=1000",
            ],
            mediaType: "IMAGE",
            visibility: "PUBLIC",
            timezone: "Asia/Ho_Chi_Minh",
            scheduledTime,
            status: "scheduled",
        },
    });
    await prisma.scheduledPostProductTag.deleteMany({
        where: { scheduledPostId: FIXED_IDS.scheduledPostOne },
    });
    await prisma.scheduledPostProductTag.create({
        data: {
            scheduledPostId: FIXED_IDS.scheduledPostOne,
            productId: products.phoneCase.id,
            anchorType: "MEDIA_HOTSPOT",
            positionX: 50,
            positionY: 50,
            sortOrder: 0,
        },
    });

    await prisma.$transaction(async (tx) => {
        await tx.cart.upsert({
            where: { id: FIXED_IDS.cartBuyerOne },
            update: { userId: users.buyerOne.id },
            create: {
                id: FIXED_IDS.cartBuyerOne,
                userId: users.buyerOne.id,
            },
        });
        await tx.cart.upsert({
            where: { id: FIXED_IDS.cartBuyerTwo },
            update: { userId: users.buyerTwo.id },
            create: {
                id: FIXED_IDS.cartBuyerTwo,
                userId: users.buyerTwo.id,
            },
        });

        await tx.cartItem.upsert({
            where: { id: FIXED_IDS.cartItemOne },
            update: {
                cartId: FIXED_IDS.cartBuyerOne,
                productId: products.phoneCase.id,
                quantity: 2,
                price: "149000",
            },
            create: {
                id: FIXED_IDS.cartItemOne,
                cartId: FIXED_IDS.cartBuyerOne,
                productId: products.phoneCase.id,
                quantity: 2,
                price: "149000",
            },
        });
        await tx.cartItem.upsert({
            where: { id: FIXED_IDS.cartItemTwo },
            update: {
                cartId: FIXED_IDS.cartBuyerTwo,
                productId: products.cottonShirt.id,
                quantity: 1,
                price: "329000",
            },
            create: {
                id: FIXED_IDS.cartItemTwo,
                cartId: FIXED_IDS.cartBuyerTwo,
                productId: products.cottonShirt.id,
                quantity: 1,
                price: "329000",
            },
        });
    });

    await prisma.$transaction(async (tx) => {
        const directConversation = await tx.conversation.upsert({
            where: { id: FIXED_IDS.directConversation },
            update: {
                type: "DIRECT",
                createdBy: users.buyerOne.id,
                name: null,
            },
            create: {
                id: FIXED_IDS.directConversation,
                type: "DIRECT",
                createdBy: users.buyerOne.id,
            },
        });

        const groupConversation = await tx.conversation.upsert({
            where: { id: FIXED_IDS.groupConversation },
            update: {
                type: "GROUP",
                name: "QA Marketplace Support",
                createdBy: users.seller.id,
            },
            create: {
                id: FIXED_IDS.groupConversation,
                type: "GROUP",
                name: "QA Marketplace Support",
                createdBy: users.seller.id,
            },
        });

        await tx.conversationParticipant.upsert({
            where: {
                conversationId_userId: {
                    conversationId: directConversation.id,
                    userId: users.buyerOne.id,
                },
            },
            update: { role: "member" },
            create: {
                conversationId: directConversation.id,
                userId: users.buyerOne.id,
                role: "member",
            },
        });
        await tx.conversationParticipant.upsert({
            where: {
                conversationId_userId: {
                    conversationId: directConversation.id,
                    userId: users.seller.id,
                },
            },
            update: { role: "member" },
            create: {
                conversationId: directConversation.id,
                userId: users.seller.id,
                role: "member",
            },
        });
        await tx.conversationParticipant.upsert({
            where: {
                conversationId_userId: {
                    conversationId: groupConversation.id,
                    userId: users.seller.id,
                },
            },
            update: { role: "owner" },
            create: {
                conversationId: groupConversation.id,
                userId: users.seller.id,
                role: "owner",
            },
        });
        await tx.conversationParticipant.upsert({
            where: {
                conversationId_userId: {
                    conversationId: groupConversation.id,
                    userId: users.buyerOne.id,
                },
            },
            update: { role: "member" },
            create: {
                conversationId: groupConversation.id,
                userId: users.buyerOne.id,
                role: "member",
            },
        });
        await tx.conversationParticipant.upsert({
            where: {
                conversationId_userId: {
                    conversationId: groupConversation.id,
                    userId: users.buyerTwo.id,
                },
            },
            update: { role: "member" },
            create: {
                conversationId: groupConversation.id,
                userId: users.buyerTwo.id,
                role: "member",
            },
        });

        await tx.message.upsert({
            where: { id: FIXED_IDS.messageOne },
            update: {
                conversationId: directConversation.id,
                senderId: users.buyerOne.id,
                messageType: "TEXT",
                content: "Shop ơi, tai nghe còn hàng giao trong hôm nay không?",
                isRead: true,
                isDeleted: false,
            },
            create: {
                id: FIXED_IDS.messageOne,
                conversationId: directConversation.id,
                senderId: users.buyerOne.id,
                messageType: "TEXT",
                content: "Shop ơi, tai nghe còn hàng giao trong hôm nay không?",
                isRead: true,
                isDeleted: false,
            },
        });
        await tx.message.upsert({
            where: { id: FIXED_IDS.messageTwo },
            update: {
                conversationId: directConversation.id,
                senderId: users.seller.id,
                messageType: "PRODUCT",
                content: "Mình gửi link sản phẩm để bạn đặt nhanh nhé.",
                productId: products.wirelessEarbuds.id,
                isRead: false,
                isDeleted: false,
            },
            create: {
                id: FIXED_IDS.messageTwo,
                conversationId: directConversation.id,
                senderId: users.seller.id,
                messageType: "PRODUCT",
                content: "Mình gửi link sản phẩm để bạn đặt nhanh nhé.",
                productId: products.wirelessEarbuds.id,
                isRead: false,
                isDeleted: false,
            },
        });
        await tx.message.upsert({
            where: { id: FIXED_IDS.messageThree },
            update: {
                conversationId: groupConversation.id,
                senderId: users.seller.id,
                messageType: "TEXT",
                content: "Nhóm có mã giảm giá mới cho cuối tuần.",
                isRead: false,
                isDeleted: false,
            },
            create: {
                id: FIXED_IDS.messageThree,
                conversationId: groupConversation.id,
                senderId: users.seller.id,
                messageType: "TEXT",
                content: "Nhóm có mã giảm giá mới cho cuối tuần.",
                isRead: false,
                isDeleted: false,
            },
        });
        await tx.message.upsert({
            where: { id: FIXED_IDS.messageFour },
            update: {
                conversationId: groupConversation.id,
                senderId: users.buyerTwo.id,
                messageType: "ORDER",
                content: "Đơn QA-ORDER-0002 đã nhận được hàng rồi.",
                orderId: orders.orderTwo.id,
                isRead: false,
                isDeleted: false,
            },
            create: {
                id: FIXED_IDS.messageFour,
                conversationId: groupConversation.id,
                senderId: users.buyerTwo.id,
                messageType: "ORDER",
                content: "Đơn QA-ORDER-0002 đã nhận được hàng rồi.",
                orderId: orders.orderTwo.id,
                isRead: false,
                isDeleted: false,
            },
        });
    });

    await prisma.$transaction(async (tx) => {
        await tx.notification.upsert({
            where: { id: FIXED_IDS.notificationOne },
            update: {
                userId: users.seller.id,
                type: "ORDER_CREATED",
                title: "Đơn hàng mới",
                message: "Bạn có đơn hàng QA-ORDER-0002 cần xử lý.",
                relatedUserId: users.buyerTwo.id,
                relatedOrderId: orders.orderTwo.id,
                actionUrl: "/seller/dashboard?tab=orders",
                isRead: false,
                readAt: null,
            },
            create: {
                id: FIXED_IDS.notificationOne,
                userId: users.seller.id,
                type: "ORDER_CREATED",
                title: "Đơn hàng mới",
                message: "Bạn có đơn hàng QA-ORDER-0002 cần xử lý.",
                relatedUserId: users.buyerTwo.id,
                relatedOrderId: orders.orderTwo.id,
                actionUrl: "/seller/dashboard?tab=orders",
            },
        });
        await tx.notification.upsert({
            where: { id: FIXED_IDS.notificationTwo },
            update: {
                userId: users.buyerOne.id,
                type: "NEW_MESSAGE",
                title: "Tin nhắn mới từ shop",
                message: "Shop đã phản hồi trong cuộc trò chuyện.",
                relatedUserId: users.seller.id,
                actionUrl: "/messages",
                isRead: false,
                readAt: null,
            },
            create: {
                id: FIXED_IDS.notificationTwo,
                userId: users.buyerOne.id,
                type: "NEW_MESSAGE",
                title: "Tin nhắn mới từ shop",
                message: "Shop đã phản hồi trong cuộc trò chuyện.",
                relatedUserId: users.seller.id,
                actionUrl: "/messages",
            },
        });
        await tx.notification.upsert({
            where: { id: FIXED_IDS.notificationThree },
            update: {
                userId: users.buyerTwo.id,
                type: "NEW_POST",
                title: "Bài viết mới trong nhóm",
                message: "QA Tech Deals vừa có bài mới.",
                relatedUserId: users.seller.id,
                relatedPostId: posts.postThree.id,
                actionUrl: "/groups/qa-tech-deals",
                isRead: true,
                readAt: new Date(),
            },
            create: {
                id: FIXED_IDS.notificationThree,
                userId: users.buyerTwo.id,
                type: "NEW_POST",
                title: "Bài viết mới trong nhóm",
                message: "QA Tech Deals vừa có bài mới.",
                relatedUserId: users.seller.id,
                relatedPostId: posts.postThree.id,
                actionUrl: "/groups/qa-tech-deals",
                isRead: true,
                readAt: new Date(),
            },
        });
        await tx.notification.upsert({
            where: { id: FIXED_IDS.notificationFour },
            update: {
                userId: users.buyerOne.id,
                type: "REVIEW_APPROVED",
                title: "Đánh giá đã hiển thị",
                message: "Đánh giá của bạn cho QA Wireless Earbuds đã được hiển thị.",
                relatedProductId: products.wirelessEarbuds.id,
                actionUrl: "/products/qa-wireless-earbuds",
                isRead: false,
                readAt: null,
            },
            create: {
                id: FIXED_IDS.notificationFour,
                userId: users.buyerOne.id,
                type: "REVIEW_APPROVED",
                title: "Đánh giá đã hiển thị",
                message: "Đánh giá của bạn cho QA Wireless Earbuds đã được hiển thị.",
                relatedProductId: products.wirelessEarbuds.id,
                actionUrl: "/products/qa-wireless-earbuds",
            },
        });
    });

    await prisma.$transaction(async (tx) => {
        await tx.savedItem.upsert({
            where: {
                userId_itemType_targetId: {
                    userId: users.buyerOne.id,
                    itemType: "POST",
                    targetId: posts.postOne.id,
                },
            },
            update: {},
            create: {
                id: FIXED_IDS.savedItemPost,
                userId: users.buyerOne.id,
                itemType: "POST",
                targetId: posts.postOne.id,
            },
        });
        await tx.savedItem.upsert({
            where: {
                userId_itemType_targetId: {
                    userId: users.buyerTwo.id,
                    itemType: "PRODUCT",
                    targetId: products.wirelessEarbuds.id,
                },
            },
            update: {},
            create: {
                id: FIXED_IDS.savedItemProduct,
                userId: users.buyerTwo.id,
                itemType: "PRODUCT",
                targetId: products.wirelessEarbuds.id,
            },
        });
    });

    await prisma.$transaction(async (tx) => {
        await tx.aiContentHistory.upsert({
            where: { id: FIXED_IDS.aiContentOne },
            update: {
                userId: users.seller.id,
                prompt: "Viết caption bán tai nghe không quá 120 ký tự",
                contentType: "POST_CAPTION",
                generatedContent: "Tai nghe pin trâu, âm rõ, giảm giá hôm nay duy nhất.",
                sourceIdea: "Đẩy campaign phụ kiện cuối tuần",
                linkedProductId: products.wirelessEarbuds.id,
                productTitle: products.wirelessEarbuds.title,
                productImageUrl:
                    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1000",
                usedForId: posts.postOne.id,
                usedForType: "POST",
            },
            create: {
                id: FIXED_IDS.aiContentOne,
                userId: users.seller.id,
                prompt: "Viết caption bán tai nghe không quá 120 ký tự",
                contentType: "POST_CAPTION",
                generatedContent: "Tai nghe pin trâu, âm rõ, giảm giá hôm nay duy nhất.",
                sourceIdea: "Đẩy campaign phụ kiện cuối tuần",
                linkedProductId: products.wirelessEarbuds.id,
                productTitle: products.wirelessEarbuds.title,
                productImageUrl:
                    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1000",
                usedForId: posts.postOne.id,
                usedForType: "POST",
            },
        });

        await tx.aiContentHistory.upsert({
            where: { id: FIXED_IDS.aiContentTwo },
            update: {
                userId: users.buyerOne.id,
                prompt: "Gợi ý tiêu đề review ngắn cho áo cotton",
                contentType: "REVIEW_TITLE",
                generatedContent: "Áo mặc mát, form đẹp, đáng mua",
                sourceIdea: "Review sau khi nhận hàng",
                linkedProductId: products.cottonShirt.id,
                productTitle: products.cottonShirt.title,
                usedForType: "REVIEW",
            },
            create: {
                id: FIXED_IDS.aiContentTwo,
                userId: users.buyerOne.id,
                prompt: "Gợi ý tiêu đề review ngắn cho áo cotton",
                contentType: "REVIEW_TITLE",
                generatedContent: "Áo mặc mát, form đẹp, đáng mua",
                sourceIdea: "Review sau khi nhận hàng",
                linkedProductId: products.cottonShirt.id,
                productTitle: products.cottonShirt.title,
                usedForType: "REVIEW",
            },
        });
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.$transaction(async (tx) => {
        await tx.productView.upsert({
            where: { id: FIXED_IDS.productViewOne },
            update: {
                productId: products.wirelessEarbuds.id,
                viewedFromProductId: products.phoneCase.id,
                userId: users.buyerOne.id,
                sessionId: "qa-session-001",
                ipAddress: "127.0.0.1",
                userAgent: "SeedScript/1.0",
            },
            create: {
                id: FIXED_IDS.productViewOne,
                productId: products.wirelessEarbuds.id,
                viewedFromProductId: products.phoneCase.id,
                userId: users.buyerOne.id,
                sessionId: "qa-session-001",
                ipAddress: "127.0.0.1",
                userAgent: "SeedScript/1.0",
            },
        });
        await tx.productView.upsert({
            where: { id: FIXED_IDS.productViewTwo },
            update: {
                productId: products.cottonShirt.id,
                userId: users.buyerTwo.id,
                sessionId: "qa-session-002",
                ipAddress: "127.0.0.1",
                userAgent: "SeedScript/1.0",
            },
            create: {
                id: FIXED_IDS.productViewTwo,
                productId: products.cottonShirt.id,
                userId: users.buyerTwo.id,
                sessionId: "qa-session-002",
                ipAddress: "127.0.0.1",
                userAgent: "SeedScript/1.0",
            },
        });

        await tx.userSearchEvent.upsert({
            where: { id: FIXED_IDS.searchEventOne },
            update: {
                userId: users.buyerOne.id,
                query: "tai nghe bluetooth",
                normalizedQuery: "tai nghe bluetooth",
                sessionId: "qa-session-001",
            },
            create: {
                id: FIXED_IDS.searchEventOne,
                userId: users.buyerOne.id,
                query: "tai nghe bluetooth",
                normalizedQuery: "tai nghe bluetooth",
                sessionId: "qa-session-001",
            },
        });
        await tx.userSearchEvent.upsert({
            where: { id: FIXED_IDS.searchEventTwo },
            update: {
                userId: users.buyerTwo.id,
                query: "ao cotton",
                normalizedQuery: "ao cotton",
                sessionId: "qa-session-002",
            },
            create: {
                id: FIXED_IDS.searchEventTwo,
                userId: users.buyerTwo.id,
                query: "ao cotton",
                normalizedQuery: "ao cotton",
                sessionId: "qa-session-002",
            },
        });

        await tx.productCoView.upsert({
            where: {
                sourceProductId_targetProductId: {
                    sourceProductId: products.wirelessEarbuds.id,
                    targetProductId: products.phoneCase.id,
                },
            },
            update: {
                score: 6.5,
                lastViewedAt: new Date(),
            },
            create: {
                sourceProductId: products.wirelessEarbuds.id,
                targetProductId: products.phoneCase.id,
                score: 6.5,
                lastViewedAt: new Date(),
            },
        });

        await tx.sellerStats.upsert({
            where: {
                sellerId_date: {
                    sellerId: users.seller.id,
                    date: today,
                },
            },
            update: {
                totalSales: "1317000",
                totalOrders: 2,
                totalRevenue: "1317000",
                totalProfit: "410000",
                totalProducts: 3,
                totalViews: 48,
                newFollowers: 2,
                totalLikes: 3,
                totalComments: 2,
            },
            create: {
                sellerId: users.seller.id,
                date: today,
                totalSales: "1317000",
                totalOrders: 2,
                totalRevenue: "1317000",
                totalProfit: "410000",
                totalProducts: 3,
                totalViews: 48,
                newFollowers: 2,
                totalLikes: 3,
                totalComments: 2,
            },
        });
    });

    await prisma.$transaction(async (tx) => {
        await tx.report.upsert({
            where: { id: FIXED_IDS.reportOne },
            update: {
                reporterId: users.buyerOne.id,
                targetType: "POST",
                targetId: posts.postThree.id,
                reason: "spam",
                description: "Nội dung lặp lại quá nhiều lần trong nhóm",
                status: "resolved",
                resolvedBy: admin.id,
                resolvedAt: new Date(),
                resolution: "dismissed",
            },
            create: {
                id: FIXED_IDS.reportOne,
                reporterId: users.buyerOne.id,
                targetType: "POST",
                targetId: posts.postThree.id,
                reason: "spam",
                description: "Nội dung lặp lại quá nhiều lần trong nhóm",
                status: "resolved",
                resolvedBy: admin.id,
                resolvedAt: new Date(),
                resolution: "dismissed",
            },
        });

        await tx.report.upsert({
            where: { id: FIXED_IDS.reportTwo },
            update: {
                reporterId: users.buyerTwo.id,
                targetType: "product",
                targetId: products.phoneCase.id,
                reason: "misleading",
                description: "Mô tả cần bổ sung thông tin tương thích dòng máy",
                status: "pending",
                resolvedBy: null,
                resolvedAt: null,
                resolution: null,
            },
            create: {
                id: FIXED_IDS.reportTwo,
                reporterId: users.buyerTwo.id,
                targetType: "product",
                targetId: products.phoneCase.id,
                reason: "misleading",
                description: "Mô tả cần bổ sung thông tin tương thích dòng máy",
                status: "pending",
            },
        });
    });

    if ((await prisma.admin.count()) < 5) {
        const extraAdminConfigs = [
            { email: "moderator1@socialcommerce.vn", username: "moderator1", fullName: "Moderator One" },
            { email: "moderator2@socialcommerce.vn", username: "moderator2", fullName: "Moderator Two" },
            { email: "ops1@socialcommerce.vn", username: "ops1", fullName: "Operations One" },
            { email: "ops2@socialcommerce.vn", username: "ops2", fullName: "Operations Two" },
        ];
        await Promise.all(
            extraAdminConfigs.map((adminConfig) =>
                prisma.admin.upsert({
                    where: { email: adminConfig.email },
                    update: {
                        username: adminConfig.username,
                        fullName: adminConfig.fullName,
                        passwordHash,
                        isActive: true,
                    },
                    create: {
                        email: adminConfig.email,
                        username: adminConfig.username,
                        fullName: adminConfig.fullName,
                        passwordHash,
                        isActive: true,
                    },
                }),
            ),
        );

        const extraUsers = await prisma.$transaction(async (tx) => {
            const sellerConfigs = [
                { email: "seller2.qa@soco.local", username: "seller_qa_2", fullName: "QA Seller Two", shopName: "QA Home Store", description: "Seeded seller account 2" },
                { email: "seller3.qa@soco.local", username: "seller_qa_3", fullName: "QA Seller Three", shopName: "QA Beauty Store", description: "Seeded seller account 3" },
                { email: "seller4.qa@soco.local", username: "seller_qa_4", fullName: "QA Seller Four", shopName: "QA Home Living", description: "Seeded seller account 4" },
                { email: "seller5.qa@soco.local", username: "seller_qa_5", fullName: "QA Seller Five", shopName: "QA Accessories", description: "Seeded seller account 5" },
            ];
            const buyerConfigs = [
                { email: "buyer3.qa@soco.local", username: "buyer_qa_3", fullName: "QA Buyer Three" },
                { email: "buyer4.qa@soco.local", username: "buyer_qa_4", fullName: "QA Buyer Four" },
                { email: "buyer5.qa@soco.local", username: "buyer_qa_5", fullName: "QA Buyer Five" },
            ];

            const sellers = [];
            for (const cfg of sellerConfigs) {
                sellers.push(await tx.user.upsert({
                    where: { email: cfg.email },
                    update: {
                        username: cfg.username,
                        fullName: cfg.fullName,
                        role: "SELLER",
                        isVerified: true,
                        isActive: true,
                        passwordHash: qaUserPasswordHash,
                        shopInformation: { shopName: cfg.shopName, description: cfg.description },
                    },
                    create: {
                        email: cfg.email,
                        username: cfg.username,
                        fullName: cfg.fullName,
                        passwordHash: qaUserPasswordHash,
                        role: "SELLER",
                        isVerified: true,
                        isActive: true,
                        shopInformation: { shopName: cfg.shopName, description: cfg.description },
                    },
                }));
            }

            const buyers = [];
            for (const cfg of buyerConfigs) {
                buyers.push(await tx.user.upsert({
                    where: { email: cfg.email },
                    update: {
                        username: cfg.username,
                        fullName: cfg.fullName,
                        role: "BUYER",
                        isVerified: true,
                        isActive: true,
                        passwordHash: qaUserPasswordHash,
                    },
                    create: {
                        email: cfg.email,
                        username: cfg.username,
                        fullName: cfg.fullName,
                        passwordHash: qaUserPasswordHash,
                        role: "BUYER",
                        isVerified: true,
                        isActive: true,
                    },
                }));
            }

            return { sellers, buyers };
        });

        const extraCategories = await prisma.$transaction(async (tx) => {
            const home = await tx.category.upsert({
                where: { slug: "home-living" },
                update: { name: "Home & Living", description: "Home goods and living products", isActive: true },
                create: { name: "Home & Living", slug: "home-living", description: "Home goods and living products", isActive: true, displayOrder: 3 },
            });
            const beauty = await tx.category.upsert({
                where: { slug: "beauty-care" },
                update: { name: "Beauty & Care", description: "Beauty and personal care products", isActive: true },
                create: { name: "Beauty & Care", slug: "beauty-care", description: "Beauty and personal care products", isActive: true, displayOrder: 4 },
            });
            return { home, beauty };
        });

        const extraProducts = await prisma.$transaction(async (tx) => {
            const productFour = await tx.product.upsert({
                where: { slug: "qa-aroma-diffuser" },
                update: { title: "QA Aroma Diffuser", description: "Seeded home product for QA coverage", price: "459000", stockQuantity: 70, status: "ACTIVE", sellerId: extraUsers.sellers[0].id, publishedAt: new Date(), categories: { set: [{ id: extraCategories.home.id }] } },
                create: { slug: "qa-aroma-diffuser", title: "QA Aroma Diffuser", description: "Seeded home product for QA coverage", price: "459000", stockQuantity: 70, status: "ACTIVE", sellerId: extraUsers.sellers[0].id, publishedAt: new Date(), categories: { connect: [{ id: extraCategories.home.id }] } },
            });
            const productFive = await tx.product.upsert({
                where: { slug: "qa-face-serum" },
                update: { title: "QA Face Serum", description: "Seeded beauty product for QA coverage", price: "299000", stockQuantity: 95, status: "ACTIVE", sellerId: extraUsers.sellers[1].id, publishedAt: new Date(), categories: { set: [{ id: extraCategories.beauty.id }] } },
                create: { slug: "qa-face-serum", title: "QA Face Serum", description: "Seeded beauty product for QA coverage", price: "299000", stockQuantity: 95, status: "ACTIVE", sellerId: extraUsers.sellers[1].id, publishedAt: new Date(), categories: { connect: [{ id: extraCategories.beauty.id }] } },
            });
            return { productFour, productFive };
        });

        for (const seller of extraUsers.sellers) {
            await prisma.sellerVerification.upsert({
                where: { userId: seller.id },
                update: {
                    step1Completed: true,
                    step2Completed: true,
                    step3Completed: true,
                    businessName: seller.shopInformation?.shopName || "QA Store",
                    businessType: "INDIVIDUAL",
                    taxCode: `TAX-${seller.username}`,
                    bankName: "Vietcombank",
                    bankAccountName: seller.fullName,
                    status: "APPROVED",
                    verifiedBy: admin.id,
                    verifiedAt: new Date(),
                },
                create: {
                    userId: seller.id,
                    step1Completed: true,
                    step2Completed: true,
                    step3Completed: true,
                    businessName: seller.shopInformation?.shopName || "QA Store",
                    businessType: "INDIVIDUAL",
                    taxCode: `TAX-${seller.username}`,
                    bankName: "Vietcombank",
                    bankAccountName: seller.fullName,
                    status: "APPROVED",
                    verifiedBy: admin.id,
                    verifiedAt: new Date(),
                },
            });
        }

        const allBuyers = [users.buyerOne, users.buyerTwo, ...extraUsers.buyers];
        const allSellers = [users.seller, ...extraUsers.sellers];
        const allProducts = [products.wirelessEarbuds, products.phoneCase, products.cottonShirt, extraProducts.productFour, extraProducts.productFive];

        for (const buyer of allBuyers) {
            const cart = await prisma.cart.findFirst({ where: { userId: buyer.id } });
            if (!cart) {
                await prisma.cart.create({ data: { userId: buyer.id } });
            }
        }

        const buyerCarts = await prisma.cart.findMany({ where: { userId: { in: allBuyers.map((u) => u.id) } } });
        const cartMap = new Map(buyerCarts.map((cart) => [cart.userId, cart]));

        for (const [index, buyer] of allBuyers.entries()) {
            const cart = cartMap.get(buyer.id);
            const product = allProducts[index];
            if (!cart || !product) continue;
            const existingItem = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId: product.id, variantId: null } });
            if (!existingItem) {
                await prisma.cartItem.create({ data: { cartId: cart.id, productId: product.id, quantity: 1, price: product.price } });
            }
        }

        const extraOrderSpecs = [
            { buyer: allBuyers[2], seller: allSellers[1], product: allProducts[2], paymentMethod: "BANK_TRANSFER", paymentStatus: "PENDING", status: "CONFIRMED" },
            { buyer: allBuyers[3], seller: allSellers[2], product: allProducts[3], paymentMethod: "MOMO", paymentStatus: "PENDING", status: "SHIPPING" },
            { buyer: allBuyers[4], seller: allSellers[3], product: allProducts[4], paymentMethod: "COD", paymentStatus: "PAID", status: "COMPLETED" },
        ];

        const extraOrders = [];
        const extraOrderItems = [];
        for (const [index, spec] of extraOrderSpecs.entries()) {
            const order = await prisma.order.upsert({
                where: { orderNumber: `QA-ORDER-EXTRA-${index + 1}` },
                update: {
                    buyerId: spec.buyer.id,
                    subtotal: spec.product.price,
                    shippingFee: "20000",
                    total: Number(spec.product.price) + 20000,
                    shippingName: spec.buyer.fullName,
                    shippingPhone: `09000000${index + 3}`,
                    shippingAddress: `${index + 1} QA Extra Street`,
                    shippingCity: "Ho Chi Minh",
                    paymentMethod: spec.paymentMethod,
                    paymentStatus: spec.paymentStatus,
                    status: spec.status,
                },
                create: {
                    orderNumber: `QA-ORDER-EXTRA-${index + 1}`,
                    buyerId: spec.buyer.id,
                    subtotal: spec.product.price,
                    shippingFee: "20000",
                    total: Number(spec.product.price) + 20000,
                    shippingName: spec.buyer.fullName,
                    shippingPhone: `09000000${index + 3}`,
                    shippingAddress: `${index + 1} QA Extra Street`,
                    shippingCity: "Ho Chi Minh",
                    paymentMethod: spec.paymentMethod,
                    paymentStatus: spec.paymentStatus,
                    status: spec.status,
                },
            });
            extraOrders.push(order);
            const orderItem = await prisma.orderItem.upsert({
                where: { id: `seed-order-item-extra-${index + 1}` },
                update: {
                    orderId: order.id,
                    productId: spec.product.id,
                    sellerId: spec.seller.id,
                    productName: spec.product.title,
                    quantity: 1,
                    unitPrice: spec.product.price,
                    totalPrice: spec.product.price,
                    status: spec.status === "COMPLETED" ? "completed" : "pending",
                },
                create: {
                    id: `seed-order-item-extra-${index + 1}`,
                    orderId: order.id,
                    productId: spec.product.id,
                    sellerId: spec.seller.id,
                    productName: spec.product.title,
                    quantity: 1,
                    unitPrice: spec.product.price,
                    totalPrice: spec.product.price,
                    status: spec.status === "COMPLETED" ? "completed" : "pending",
                },
            });
            extraOrderItems.push(orderItem);
        }

        for (const [index, orderItem] of extraOrderItems.entries()) {
            await prisma.review.upsert({
                where: { orderItemId: orderItem.id },
                update: {
                    productId: allProducts[index + 2].id,
                    userId: allBuyers[index + 2].id,
                    rating: index === 1 ? 4 : 5,
                    title: index === 0 ? "Great product" : index === 1 ? "Useful item" : "Excellent",
                    content: index === 0 ? "Very useful and good quality." : index === 1 ? "Matches description and works well." : "Good quality and fast delivery.",
                    images: [],
                    isPublished: true,
                    isVerifiedPurchase: true,
                },
                create: {
                    productId: allProducts[index + 2].id,
                    orderItemId: orderItem.id,
                    userId: allBuyers[index + 2].id,
                    rating: index === 1 ? 4 : 5,
                    title: index === 0 ? "Great product" : index === 1 ? "Useful item" : "Excellent",
                    content: index === 0 ? "Very useful and good quality." : index === 1 ? "Matches description and works well." : "Good quality and fast delivery.",
                    images: [],
                    isPublished: true,
                    isVerifiedPurchase: true,
                },
            });
        }

        for (const [index, seller] of allSellers.entries()) {
            await prisma.sellerStats.upsert({
                where: { sellerId_date: { sellerId: seller.id, date: today } },
                update: {
                    totalSales: String(1000000 + index * 250000),
                    totalOrders: 1 + index,
                    totalRevenue: String(1000000 + index * 250000),
                    totalProfit: String(250000 + index * 50000),
                    totalProducts: 1 + index,
                    totalViews: 10 + index * 5,
                    newFollowers: index,
                    totalLikes: 1 + index,
                    totalComments: 1 + index,
                },
                create: {
                    sellerId: seller.id,
                    date: today,
                    totalSales: String(1000000 + index * 250000),
                    totalOrders: 1 + index,
                    totalRevenue: String(1000000 + index * 250000),
                    totalProfit: String(250000 + index * 50000),
                    totalProducts: 1 + index,
                    totalViews: 10 + index * 5,
                    newFollowers: index,
                    totalLikes: 1 + index,
                    totalComments: 1 + index,
                },
            });
        }

        const groupSeeds = [
            { name: "QA Home Deals", slug: "qa-home-deals", description: "Home product deals", privacy: "PUBLIC", createdBy: allSellers[0].id },
            { name: "QA Beauty Tips", slug: "qa-beauty-tips", description: "Beauty discussion group", privacy: "PRIVATE", createdBy: allSellers[1].id },
            { name: "QA Daily Shopping", slug: "qa-daily-shopping", description: "Daily shopping chat", privacy: "PUBLIC", createdBy: allBuyers[0].id },
        ];
        const extraGroups = [];
        for (const seed of groupSeeds) {
            extraGroups.push(await prisma.group.upsert({
                where: { slug: seed.slug },
                update: { name: seed.name, description: seed.description, privacy: seed.privacy, createdBy: seed.createdBy },
                create: { name: seed.name, slug: seed.slug, description: seed.description, privacy: seed.privacy, createdBy: seed.createdBy },
            }));
        }

        for (const [index, group] of extraGroups.entries()) {
            const memberIds = [allSellers[index].id, allBuyers[index].id];
            for (const userId of memberIds) {
                await prisma.groupMember.upsert({
                    where: { groupId_userId: { groupId: group.id, userId } },
                    update: { role: index === 0 ? "ADMIN" : "MEMBER" },
                    create: { groupId: group.id, userId, role: index === 0 ? "ADMIN" : "MEMBER" },
                });
            }
            if (group.privacy === "PRIVATE") {
                await prisma.groupJoinRequest.upsert({
                    where: { groupId_userId: { groupId: group.id, userId: allBuyers[(index + 1) % allBuyers.length].id } },
                    update: { status: "PENDING" },
                    create: { groupId: group.id, userId: allBuyers[(index + 1) % allBuyers.length].id, status: "PENDING" },
                });
            }
            await prisma.groupInvite.upsert({
                where: { code: `QA-GROUP-${index + 1}` },
                update: { groupId: group.id, createdBy: group.createdBy, isActive: true },
                create: { groupId: group.id, code: `QA-GROUP-${index + 1}`, createdBy: group.createdBy, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) },
            });
        }

        const extraPosts = [];
        extraPosts.push(await prisma.post.create({ data: { authorId: allSellers[0].id, content: "New home product is available now.", mediaUrls: ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1000"], mediaType: "IMAGE", status: "PUBLISHED", visibility: "PUBLIC", publishedAt: new Date() } }));
        extraPosts.push(await prisma.post.create({ data: { authorId: allBuyers[0].id, content: "Beauty product review incoming.", mediaUrls: ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000"], mediaType: "IMAGE", status: "PUBLISHED", visibility: "FOLLOWERS", publishedAt: new Date() } }));
        await prisma.postProductTag.createMany({
            data: [
                {
                    postId: extraPosts[0].id,
                    productId: allProducts[3].id,
                    anchorType: "MEDIA_HOTSPOT",
                    positionX: 52,
                    positionY: 50,
                    sortOrder: 0,
                },
                {
                    postId: extraPosts[1].id,
                    productId: allProducts[4].id,
                    anchorType: "CONTENT_BLOCK",
                    blockId: "body-main",
                    sortOrder: 0,
                },
            ],
        });

        await prisma.postLike.upsert({ where: { postId_userId: { postId: extraPosts[0].id, userId: allBuyers[1].id } }, update: {}, create: { postId: extraPosts[0].id, userId: allBuyers[1].id } });
        await prisma.postLike.upsert({ where: { postId_userId: { postId: extraPosts[0].id, userId: allBuyers[2].id } }, update: {}, create: { postId: extraPosts[0].id, userId: allBuyers[2].id } });
        await prisma.postLike.upsert({ where: { postId_userId: { postId: extraPosts[1].id, userId: allBuyers[3].id } }, update: {}, create: { postId: extraPosts[1].id, userId: allBuyers[3].id } });

        await prisma.postComment.create({ data: { postId: extraPosts[0].id, userId: allBuyers[0].id, content: "Looks good." } });
        await prisma.postComment.create({ data: { postId: extraPosts[1].id, userId: allSellers[0].id, content: "Great review." } });
        await prisma.postComment.create({ data: { postId: extraPosts[1].id, userId: allBuyers[4].id, content: "Thanks for sharing." } });

        for (let i = 0; i < 4; i += 1) {
            await prisma.scheduledPost.upsert({
                where: { id: `seed-scheduled-post-extra-${i + 1}` },
                update: { userId: allSellers[i % allSellers.length].id, content: `Scheduled promo post ${i + 1}`, mediaUrls: [], visibility: "PUBLIC", timezone: "Asia/Ho_Chi_Minh", scheduledTime: new Date(Date.now() + (i + 1) * 60 * 60 * 1000), status: "scheduled" },
                create: { id: `seed-scheduled-post-extra-${i + 1}`, userId: allSellers[i % allSellers.length].id, content: `Scheduled promo post ${i + 1}`, mediaUrls: [], visibility: "PUBLIC", timezone: "Asia/Ho_Chi_Minh", scheduledTime: new Date(Date.now() + (i + 1) * 60 * 60 * 1000), status: "scheduled" },
            });
            await prisma.scheduledPostProductTag.deleteMany({
                where: { scheduledPostId: `seed-scheduled-post-extra-${i + 1}` },
            });
            await prisma.scheduledPostProductTag.create({
                data: {
                    scheduledPostId: `seed-scheduled-post-extra-${i + 1}`,
                    productId: allProducts[i % allProducts.length].id,
                    anchorType: "MEDIA_HOTSPOT",
                    positionX: 50,
                    positionY: 50,
                    sortOrder: 0,
                },
            });
        }

        const conversationSeeds = [
            { id: "seed-conversation-1", type: "DIRECT", name: null, createdBy: allBuyers[0].id, participants: [allBuyers[0].id, allSellers[0].id], messages: [{ senderId: allBuyers[0].id, content: "Is this item available?" }, { senderId: allSellers[0].id, content: "Yes, it is available." }] },
            { id: "seed-conversation-2", type: "DIRECT", name: null, createdBy: allBuyers[1].id, participants: [allBuyers[1].id, allSellers[1].id], messages: [{ senderId: allBuyers[1].id, content: "Can you ship today?" }, { senderId: allSellers[1].id, content: "We can ship today." }] },
            { id: "seed-conversation-3", type: "GROUP", name: "QA Group Support", createdBy: allSellers[2].id, participants: [allSellers[2].id, allBuyers[2].id, allBuyers[3].id], messages: [{ senderId: allSellers[2].id, content: "Welcome to the group chat." }] },
        ];
        for (const seed of conversationSeeds) {
            const conversation = await prisma.conversation.upsert({
                where: { id: seed.id },
                update: { type: seed.type, name: seed.name, createdBy: seed.createdBy },
                create: { id: seed.id, type: seed.type, name: seed.name, createdBy: seed.createdBy },
            });
            for (const participantId of seed.participants) {
                await prisma.conversationParticipant.upsert({
                    where: { conversationId_userId: { conversationId: conversation.id, userId: participantId } },
                    update: { role: participantId === seed.createdBy ? "owner" : "member" },
                    create: { conversationId: conversation.id, userId: participantId, role: participantId === seed.createdBy ? "owner" : "member" },
                });
            }
            for (const messageSeed of seed.messages) {
                await prisma.message.create({ data: { conversationId: conversation.id, senderId: messageSeed.senderId, content: messageSeed.content, messageType: "TEXT" } });
            }
        }

        const notificationSeeds = [
            { userId: allBuyers[0].id, type: "ORDER_CREATED", title: "New order", message: "Your order has been created." },
            { userId: allSellers[0].id, type: "NEW_MESSAGE", title: "New message", message: "You have a new buyer message." },
            { userId: allBuyers[1].id, type: "NEW_POST", title: "New post", message: "A new post is available." },
            { userId: allBuyers[2].id, type: "REVIEW_APPROVED", title: "Review published", message: "Your review is now live." },
            { userId: allSellers[1].id, type: "GROUP_INVITE", title: "Group invite", message: "You have a new group invite." },
        ];
        for (const seed of notificationSeeds) {
            await prisma.notification.create({ data: seed });
        }

        await prisma.savedItem.upsert({ where: { userId_itemType_targetId: { userId: allBuyers[0].id, itemType: "POST", targetId: extraPosts[0].id } }, update: {}, create: { userId: allBuyers[0].id, itemType: "POST", targetId: extraPosts[0].id } });
        await prisma.savedItem.upsert({ where: { userId_itemType_targetId: { userId: allBuyers[1].id, itemType: "PRODUCT", targetId: allProducts[3].id } }, update: {}, create: { userId: allBuyers[1].id, itemType: "PRODUCT", targetId: allProducts[3].id } });
        await prisma.savedItem.upsert({ where: { userId_itemType_targetId: { userId: allBuyers[2].id, itemType: "PRODUCT", targetId: allProducts[4].id } }, update: {}, create: { userId: allBuyers[2].id, itemType: "PRODUCT", targetId: allProducts[4].id } });

        await prisma.aiContentHistory.create({ data: { userId: allSellers[0].id, prompt: "Create a sale caption", contentType: "POST_CAPTION", generatedContent: "Sale now live." } });

        const productViewSeeds = [
            { productId: allProducts[0].id, userId: allBuyers[0].id, sessionId: "seed-session-1" },
            { productId: allProducts[1].id, userId: allBuyers[1].id, sessionId: "seed-session-2" },
            { productId: allProducts[2].id, userId: allBuyers[2].id, sessionId: "seed-session-3" },
            { productId: allProducts[3].id, userId: allBuyers[3].id, sessionId: "seed-session-4" },
            { productId: allProducts[4].id, userId: allBuyers[4].id, sessionId: "seed-session-5" },
        ];
        for (const seed of productViewSeeds) {
            await prisma.productView.create({ data: { ...seed, ipAddress: "127.0.0.1", userAgent: "SeedScript/2.0" } });
        }

        const searchSeeds = [
            { userId: allBuyers[0].id, query: "tai nghe bluetooth" },
            { userId: allBuyers[1].id, query: "op lung dien thoai" },
            { userId: allBuyers[2].id, query: "ao cotton" },
            { userId: allBuyers[3].id, query: "diffuser" },
            { userId: allBuyers[4].id, query: "face serum" },
        ];
        for (const seed of searchSeeds) {
            await prisma.userSearchEvent.create({ data: { userId: seed.userId, query: seed.query, normalizedQuery: seed.query, sessionId: `session-${seed.userId.slice(0, 8)}` } });
        }

        const coViewSeeds = [
            { sourceProductId: allProducts[0].id, targetProductId: allProducts[1].id, score: 6.1 },
            { sourceProductId: allProducts[1].id, targetProductId: allProducts[2].id, score: 5.9 },
            { sourceProductId: allProducts[2].id, targetProductId: allProducts[3].id, score: 5.2 },
            { sourceProductId: allProducts[3].id, targetProductId: allProducts[4].id, score: 4.8 },
            { sourceProductId: allProducts[4].id, targetProductId: allProducts[0].id, score: 4.6 },
        ];
        for (const seed of coViewSeeds) {
            await prisma.productCoView.upsert({ where: { sourceProductId_targetProductId: { sourceProductId: seed.sourceProductId, targetProductId: seed.targetProductId } }, update: { score: seed.score, lastViewedAt: new Date() }, create: { ...seed, lastViewedAt: new Date() } });
        }

        for (const [index, seller] of allSellers.entries()) {
            await prisma.sellerStats.upsert({
                where: { sellerId_date: { sellerId: seller.id, date: today } },
                update: { totalSales: String(1000000 + index * 250000), totalOrders: 1 + index, totalRevenue: String(1000000 + index * 250000), totalProfit: String(250000 + index * 50000), totalProducts: 1 + index, totalViews: 10 + index * 5, newFollowers: index, totalLikes: 1 + index, totalComments: 1 + index },
                create: { sellerId: seller.id, date: today, totalSales: String(1000000 + index * 250000), totalOrders: 1 + index, totalRevenue: String(1000000 + index * 250000), totalProfit: String(250000 + index * 50000), totalProducts: 1 + index, totalViews: 10 + index * 5, newFollowers: index, totalLikes: 1 + index, totalComments: 1 + index },
            });
        }

        const reportSeeds = [
            { reporterId: allBuyers[0].id, targetType: "POST", targetId: extraPosts[0].id, reason: "spam", description: "Repeated promotional content" },
            { reporterId: allBuyers[1].id, targetType: "product", targetId: allProducts[3].id, reason: "misleading", description: "Need more product details" },
            { reporterId: allBuyers[2].id, targetType: "user", targetId: allSellers[1].id, reason: "abuse", description: "Suspicious messages" },
            { reporterId: allBuyers[3].id, targetType: "group", targetId: extraGroups[0].id, reason: "spam", description: "Group posts are too repetitive" },
            { reporterId: allBuyers[4].id, targetType: "post", targetId: extraPosts[1].id, reason: "other", description: "Check content quality" },
        ];
        for (const [index, seed] of reportSeeds.entries()) {
            await prisma.report.upsert({
                where: { id: `seed-report-${index + 1}` },
                update: { ...seed, status: index % 2 === 0 ? "pending" : "resolved", resolvedBy: index % 2 === 0 ? null : admin.id, resolvedAt: index % 2 === 0 ? null : new Date(), resolution: index % 2 === 0 ? null : "dismissed" },
                create: { id: `seed-report-${index + 1}`, ...seed, status: index % 2 === 0 ? "pending" : "resolved", resolvedBy: index % 2 === 0 ? null : admin.id, resolvedAt: index % 2 === 0 ? null : new Date(), resolution: index % 2 === 0 ? null : "dismissed" },
            });
        }
    }

    if (
        (await prisma.follow.count()) < 5 ||
        (await prisma.productImage.count()) < 5 ||
        (await prisma.groupJoinRequest.count()) < 5 ||
        (await prisma.groupInvite.count()) < 5
    ) {
        const sellerTwo = await prisma.user.findUnique({ where: { email: "seller2.qa@soco.local" } });
        const sellerThree = await prisma.user.findUnique({ where: { email: "seller3.qa@soco.local" } });
        const sellerFour = await prisma.user.findUnique({ where: { email: "seller4.qa@soco.local" } });
        const sellerFive = await prisma.user.findUnique({ where: { email: "seller5.qa@soco.local" } });
        const buyerThree = await prisma.user.findUnique({ where: { email: "buyer3.qa@soco.local" } });
        const buyerFour = await prisma.user.findUnique({ where: { email: "buyer4.qa@soco.local" } });
        const buyerFive = await prisma.user.findUnique({ where: { email: "buyer5.qa@soco.local" } });
        const aroma = await prisma.product.findUnique({ where: { slug: "qa-aroma-diffuser" } });
        const serum = await prisma.product.findUnique({ where: { slug: "qa-face-serum" } });
        const dailyStyle = await prisma.group.findUnique({ where: { slug: "qa-daily-style" } });
        const beautyTips = await prisma.group.findUnique({ where: { slug: "qa-beauty-tips" } });
        const homeDeals = await prisma.group.findUnique({ where: { slug: "qa-home-deals" } });
        const dailyShopping = await prisma.group.findUnique({ where: { slug: "qa-daily-shopping" } });

        if (aroma && serum) {
            await prisma.productImage.upsert({
                where: { id: "seed-product-image-4" },
                update: { productId: aroma.id, imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800", altText: "QA aroma diffuser image", displayOrder: 0, isPrimary: true },
                create: { id: "seed-product-image-4", productId: aroma.id, imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800", altText: "QA aroma diffuser image", displayOrder: 0, isPrimary: true },
            });
            await prisma.productImage.upsert({
                where: { id: "seed-product-image-5" },
                update: { productId: serum.id, imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800", altText: "QA face serum image", displayOrder: 0, isPrimary: true },
                create: { id: "seed-product-image-5", productId: serum.id, imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800", altText: "QA face serum image", displayOrder: 0, isPrimary: true },
            });
        }

        const followSeeds = [
            sellerTwo && sellerThree ? { followerId: buyerThree.id, followingId: sellerTwo.id } : null,
            sellerThree ? { followerId: buyerFour.id, followingId: sellerThree.id } : null,
            sellerFour ? { followerId: buyerFive.id, followingId: sellerFour.id } : null,
        ].filter(Boolean);
        for (const seed of followSeeds) {
            await prisma.follow.upsert({
                where: { followerId_followingId: { followerId: seed.followerId, followingId: seed.followingId } },
                update: {},
                create: seed,
            });
        }

        if (dailyStyle && beautyTips && homeDeals && dailyShopping && buyerThree && buyerFour && buyerFive) {
            const joinSeeds = [
                { groupId: dailyStyle.id, userId: buyerThree.id },
                { groupId: beautyTips.id, userId: buyerFour.id },
                { groupId: homeDeals.id, userId: buyerFive.id },
            ];
            for (const seed of joinSeeds) {
                await prisma.groupJoinRequest.upsert({
                    where: { groupId_userId: { groupId: seed.groupId, userId: seed.userId } },
                    update: { status: "PENDING" },
                    create: { groupId: seed.groupId, userId: seed.userId, status: "PENDING" },
                });
            }

            await prisma.groupInvite.upsert({
                where: { code: "QA-GROUP-EXTRA" },
                update: { groupId: dailyShopping.id, createdBy: buyerThree.id, isActive: true },
                create: { groupId: dailyShopping.id, code: "QA-GROUP-EXTRA", createdBy: buyerThree.id, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) },
            });
        }
    }

    console.log(
        "Seeded full QA/UAT dataset plus supplemental pack: all major tables are expanded to at least five records where the schema allows.",
    );
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
