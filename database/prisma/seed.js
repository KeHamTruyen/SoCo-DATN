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
                productId: products.wirelessEarbuds.id,
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
                productId: products.wirelessEarbuds.id,
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
                productId: products.cottonShirt.id,
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
                productId: products.cottonShirt.id,
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
            productId: products.phoneCase.id,
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
            productId: products.phoneCase.id,
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
            where: { id: FIXED_IDS.savedItemPost },
            update: {
                userId: users.buyerOne.id,
                itemType: "POST",
                targetId: posts.postOne.id,
            },
            create: {
                id: FIXED_IDS.savedItemPost,
                userId: users.buyerOne.id,
                itemType: "POST",
                targetId: posts.postOne.id,
            },
        });
        await tx.savedItem.upsert({
            where: { id: FIXED_IDS.savedItemProduct },
            update: {
                userId: users.buyerTwo.id,
                itemType: "PRODUCT",
                targetId: products.wirelessEarbuds.id,
            },
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
                id: FIXED_IDS.sellerStatsToday,
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

    console.log(
        "Seeded full QA/UAT dataset: admin, verification, categories, users, products, carts, orders, reviews, follows, posts, scheduled posts, groups, chat, notifications, saved items, AI history, analytics, reports.",
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
