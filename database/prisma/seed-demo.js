/**
 * Demo marketplace that looks lived-in (Vietnamese social commerce).
 * Idempotent. Does not touch QA emails/slugs used by CI.
 * Password is the same hash as QA users (SEED_QA_USER_PASSWORD).
 */
const PHOTO = (id, w = 800) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

function daysAgo(days, hour = 19, minute = 8) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(hour, minute, 0, 0);
    return d;
}

async function upsertUser(prisma, data) {
    const { email, ...rest } = data;
    return prisma.user.upsert({
        where: { email },
        update: rest,
        create: { email, ...rest },
    });
}

async function upsertProduct(prisma, { slug, categoryIds, images, variants, ...fields }) {
    const product = await prisma.product.upsert({
        where: { slug },
        update: {
            ...fields,
            categories: { set: categoryIds.map((id) => ({ id })) },
        },
        create: {
            slug,
            ...fields,
            categories: { connect: categoryIds.map((id) => ({ id })) },
        },
    });

    for (const [index, image] of images.entries()) {
        const id = `demo-img-${slug}-${index}`;
        await prisma.productImage.upsert({
            where: { id },
            update: {
                productId: product.id,
                imageUrl: image.url,
                altText: image.alt,
                displayOrder: index,
                isPrimary: index === 0,
            },
            create: {
                id,
                productId: product.id,
                imageUrl: image.url,
                altText: image.alt,
                displayOrder: index,
                isPrimary: index === 0,
            },
        });
    }

    for (const [index, variant] of (variants || []).entries()) {
        const id = `demo-var-${slug}-${index}`;
        await prisma.productVariant.upsert({
            where: { id },
            update: { productId: product.id, ...variant },
            create: { id, productId: product.id, ...variant },
        });
    }

    return product;
}

export async function seedDemoMarketplace(prisma, { adminId, passwordHash }) {
    if (process.env.SEED_DEMO === "0") {
        console.log("Skipped demo marketplace (SEED_DEMO=0)");
        return;
    }

    const categories = await prisma.$transaction(async (tx) => {
        const kitchen = await tx.category.upsert({
            where: { slug: "nha-bep" },
            update: {
                name: "Nhà bếp",
                description: "Dụng cụ nấu nướng, chảo, máy xay",
                isActive: true,
            },
            create: {
                name: "Nhà bếp",
                slug: "nha-bep",
                description: "Dụng cụ nấu nướng, chảo, máy xay",
                isActive: true,
                displayOrder: 5,
            },
        });
        const skincare = await tx.category.upsert({
            where: { slug: "cham-soc-da" },
            update: {
                name: "Chăm sóc da",
                description: "Serum, kem chống nắng, toner",
                isActive: true,
            },
            create: {
                name: "Chăm sóc da",
                slug: "cham-soc-da",
                description: "Serum, kem chống nắng, toner",
                isActive: true,
                displayOrder: 6,
            },
        });
        const streetwear = await tx.category.upsert({
            where: { slug: "streetwear" },
            update: {
                name: "Streetwear",
                description: "Áo thun, quần cargo, phụ kiện đường phố",
                isActive: true,
            },
            create: {
                name: "Streetwear",
                slug: "streetwear",
                description: "Áo thun, quần cargo, phụ kiện đường phố",
                isActive: true,
                displayOrder: 7,
            },
        });
        return { kitchen, skincare, streetwear };
    });

    const electronics = await prisma.category.findUnique({ where: { slug: "electronics" } });
    const fashion = await prisma.category.findUnique({ where: { slug: "fashion" } });
    const accessories = await prisma.category.findUnique({ where: { slug: "phone-accessories" } });
    const home = await prisma.category.findUnique({ where: { slug: "home-living" } });
    const beauty = await prisma.category.findUnique({ where: { slug: "beauty-care" } });

    const sellerSpecs = [
        {
            email: "linh.nha@soco.vn",
            username: "linhnha",
            fullName: "Nguyễn Minh Linh",
            phone: "0903124871",
            bio: "Decor căn hộ nhỏ, thích đồ gốm và ánh sáng ấm. Ship nội thành Hà Nội trong ngày.",
            address: "27 Nguyễn Thái Học, Ba Đình, Hà Nội",
            avatarUrl: PHOTO("1544005313-94ddf0286df2", 256),
            coverImage: PHOTO("1616486338812-3dadae4b4ace", 1200),
            lastLogin: daysAgo(0, 21, 14),
            createdAt: daysAgo(86, 9, 0),
            shopInformation: {
                shopName: "Nhà Linh Decor",
                shopCategory: "Nhà cửa",
                shopDescription: "Đèn, thảm, bình gốm cho căn hộ 1-2 phòng ngủ.",
                shopAddress: "27 Nguyễn Thái Học, Ba Đình, Hà Nội",
                contactPhone: "0903124871",
            },
            verification: {
                businessName: "Nhà Linh Decor",
                businessType: "INDIVIDUAL",
                taxCode: "0109876543",
                bankName: "Vietcombank",
                bankAccountName: "NGUYEN MINH LINH",
                bankBranch: "Ba Đình",
                address: "27 Nguyễn Thái Học, Ba Đình, Hà Nội",
            },
        },
        {
            email: "minh.gadget@soco.vn",
            username: "minhgadget",
            fullName: "Trần Đức Minh",
            phone: "0918456720",
            bio: "Review tai nghe và sạc nhanh. Hàng chính hãng, bảo hành 12 tháng.",
            address: "88 Nguyễn Trãi, Quận 5, TP.HCM",
            avatarUrl: PHOTO("1507003211169-0a1dd7228f2d", 256),
            coverImage: PHOTO("1510557883873-ea2f7ac4971d", 1200),
            lastLogin: daysAgo(0, 22, 3),
            createdAt: daysAgo(120, 10, 0),
            shopInformation: {
                shopName: "Minh Gadget",
                shopCategory: "Điện tử",
                shopDescription: "Tai nghe, sạc GaN, ốp MagSafe. Đổi trả 7 ngày.",
                shopAddress: "88 Nguyễn Trãi, Quận 5, TP.HCM",
                contactPhone: "0918456720",
            },
            verification: {
                businessName: "Minh Gadget",
                businessType: "INDIVIDUAL",
                taxCode: "0314567890",
                bankName: "Techcombank",
                bankAccountName: "TRAN DUC MINH",
                bankBranch: "Quận 5",
                address: "88 Nguyễn Trãi, Quận 5, TP.HCM",
            },
        },
        {
            email: "ngoc.skin@soco.vn",
            username: "ngocskin",
            fullName: "Phạm Thị Ngọc",
            phone: "0987665123",
            bio: "Skincare routine da dầu mụn. Chỉ bán hàng mình dùng thật.",
            address: "15 Trần Phú, Hải Châu, Đà Nẵng",
            avatarUrl: PHOTO("1534528741775-53994a69daeb", 256),
            coverImage: PHOTO("1570172619644-dfd03ed5d881", 1200),
            lastLogin: daysAgo(1, 8, 40),
            createdAt: daysAgo(64, 14, 0),
            shopInformation: {
                shopName: "Ngọc Beauty Lab",
                shopCategory: "Làm đẹp",
                shopDescription: "Serum, chống nắng, toner cho khí hậu nóng ẩm.",
                shopAddress: "15 Trần Phú, Hải Châu, Đà Nẵng",
                contactPhone: "0987665123",
            },
            verification: {
                businessName: "Ngọc Beauty Lab",
                businessType: "INDIVIDUAL",
                taxCode: "0401234567",
                bankName: "MB Bank",
                bankAccountName: "PHAM THI NGOC",
                bankBranch: "Hải Châu",
                address: "15 Trần Phú, Hải Châu, Đà Nẵng",
            },
        },
        {
            email: "hung.street@soco.vn",
            username: "hungstreet",
            fullName: "Lê Quang Hùng",
            phone: "0935120988",
            bio: "Boxy tee, cargo, form rộng. Drop cuối tuần, số lượng có hạn.",
            address: "12 Lê Lợi, Quận 1, TP.HCM",
            avatarUrl: PHOTO("1500648767791-00dcc994a43e", 256),
            coverImage: PHOTO("1483985988355-763728e1935b", 1200),
            lastLogin: daysAgo(0, 18, 55),
            createdAt: daysAgo(45, 16, 0),
            shopInformation: {
                shopName: "Hùng Streetwear",
                shopCategory: "Thời trang",
                shopDescription: "Streetwear Việt, vải dày, form boxy.",
                shopAddress: "12 Lê Lợi, Quận 1, TP.HCM",
                contactPhone: "0935120988",
            },
            verification: {
                businessName: "Hùng Streetwear",
                businessType: "INDIVIDUAL",
                taxCode: "0319988776",
                bankName: "VPBank",
                bankAccountName: "LE QUANG HUNG",
                bankBranch: "Quận 1",
                address: "12 Lê Lợi, Quận 1, TP.HCM",
            },
        },
        {
            email: "mai.bep@soco.vn",
            username: "maibep",
            fullName: "Đặng Thu Mai",
            phone: "0972334455",
            bio: "Nấu ăn cho gia đình 4 người. Chảo, máy xay, mẹo bếp nhỏ.",
            address: "56 Hoàng Diệu, Hải Châu, Đà Nẵng",
            avatarUrl: PHOTO("1438761681033-6461ffad8d80", 256),
            coverImage: PHOTO("1556909114-f6e7ad7d3136", 1200),
            lastLogin: daysAgo(2, 7, 12),
            createdAt: daysAgo(38, 11, 0),
            shopInformation: {
                shopName: "Mai Kitchen",
                shopCategory: "Nhà bếp",
                shopDescription: "Dụng cụ bếp bền, phù hợp căn hộ.",
                shopAddress: "56 Hoàng Diệu, Hải Châu, Đà Nẵng",
                contactPhone: "0972334455",
            },
            verification: {
                businessName: "Mai Kitchen",
                businessType: "INDIVIDUAL",
                taxCode: "0405566778",
                bankName: "ACB",
                bankAccountName: "DANG THU MAI",
                bankBranch: "Hải Châu",
                address: "56 Hoàng Diệu, Hải Châu, Đà Nẵng",
            },
        },
    ];

    const buyerSpecs = [
        {
            email: "an.pham@soco.vn",
            username: "anpham",
            fullName: "Phạm Hoàng An",
            phone: "0901882736",
            bio: "Hay săn deal tai nghe. Ở Q.Bình Thạnh.",
            address: "21 Bùi Hữu Nghĩa, Bình Thạnh, TP.HCM",
            avatarUrl: PHOTO("1539571696357-5b2c638e1f0c", 256),
            lastLogin: daysAgo(0, 20, 11),
            createdAt: daysAgo(70, 12, 0),
        },
        {
            email: "thu.vo@soco.vn",
            username: "thuvo",
            fullName: "Võ Ngọc Thư",
            phone: "0912773648",
            bio: "Da hỗn hợp thiên dầu. Review skincare không hoa mỹ.",
            address: "9 Tôn Đức Thắng, Đống Đa, Hà Nội",
            avatarUrl: PHOTO("1524504388940-b1c1722653e1", 256),
            lastLogin: daysAgo(0, 23, 2),
            createdAt: daysAgo(55, 9, 30),
        },
        {
            email: "khoa.nguyen@soco.vn",
            username: "khoanguyen",
            fullName: "Nguyễn Đăng Khoa",
            phone: "0988112233",
            bio: "Setup góc làm việc. Thích đèn ấm và bàn sạch.",
            address: "44 Cầu Giấy, Quận Cầu Giấy, Hà Nội",
            avatarUrl: PHOTO("1506794778202-cad84cf45f1d", 256),
            lastLogin: daysAgo(1, 19, 44),
            createdAt: daysAgo(41, 15, 0),
        },
        {
            email: "ha.tran@soco.vn",
            username: "hatran",
            fullName: "Trần Thanh Hà",
            phone: "0934667788",
            bio: "Mẹ 2 con, nấu ăn tối chủ nhật. Ship Đà Nẵng.",
            address: "102 Lê Duẩn, Hải Châu, Đà Nẵng",
            avatarUrl: PHOTO("1487412720507-e7ab37603c6f", 256),
            lastLogin: daysAgo(3, 6, 50),
            createdAt: daysAgo(33, 8, 0),
        },
        {
            email: "nam.le@soco.vn",
            username: "namle",
            fullName: "Lê Phương Nam",
            phone: "0965123789",
            bio: "Form rộng, giày tối màu. Hay hỏi size trước khi mua.",
            address: "7 Nguyễn Huệ, Quận 1, TP.HCM",
            avatarUrl: PHOTO("1492562080023-ab3db95bfbce", 256),
            lastLogin: daysAgo(0, 17, 28),
            createdAt: daysAgo(22, 13, 0),
        },
        {
            email: "my.bui@soco.vn",
            username: "mybui",
            fullName: "Bùi Hà My",
            phone: "0909556677",
            bio: "Sưu tầm bình gốm nhỏ. Ban công 3m2 cũng phải xinh.",
            address: "18 Hàng Bài, Hoàn Kiếm, Hà Nội",
            avatarUrl: PHOTO("1548142813-c348350df52b", 256),
            lastLogin: daysAgo(4, 21, 5),
            createdAt: daysAgo(18, 10, 20),
        },
        {
            email: "tuan.do@soco.vn",
            username: "tuando",
            fullName: "Đỗ Anh Tuấn",
            phone: "0913001122",
            bio: "Dev, sạc 65W là đạo cụ sinh tồn.",
            address: "63 Võ Văn Tần, Quận 3, TP.HCM",
            avatarUrl: PHOTO("1472099645785-5658abf4ff4e", 256),
            lastLogin: daysAgo(1, 12, 16),
            createdAt: daysAgo(14, 18, 0),
        },
        {
            email: "quynh.ho@soco.vn",
            username: "quynhho",
            fullName: "Hồ Nhật Quỳnh",
            phone: "0977008899",
            bio: "Chống nắng mọi ngày. Không tin review 5 sao toàn bộ.",
            address: "31 Pasteur, Hải Châu, Đà Nẵng",
            avatarUrl: PHOTO("1489424739324-401b90bc3e3d", 256),
            lastLogin: daysAgo(2, 9, 33),
            createdAt: daysAgo(9, 7, 45),
        },
    ];

    const sellers = {};
    for (const spec of sellerSpecs) {
        const { verification, createdAt, ...user } = spec;
        const row = await upsertUser(prisma, {
            ...user,
            passwordHash,
            role: "SELLER",
            isVerified: true,
            isActive: true,
        });
        if (createdAt) {
            await prisma.user.update({
                where: { id: row.id },
                data: { createdAt },
            });
        }
        await prisma.sellerVerification.upsert({
            where: { userId: row.id },
            update: {
                ...verification,
                step1Completed: true,
                step2Completed: true,
                step3Completed: true,
                status: "APPROVED",
                verifiedBy: adminId,
                verifiedAt: daysAgo(20),
            },
            create: {
                userId: row.id,
                ...verification,
                step1Completed: true,
                step2Completed: true,
                step3Completed: true,
                status: "APPROVED",
                verifiedBy: adminId,
                verifiedAt: daysAgo(20),
            },
        });
        sellers[spec.username] = row;
    }

    const buyers = {};
    for (const spec of buyerSpecs) {
        const { createdAt, ...user } = spec;
        const row = await upsertUser(prisma, {
            ...user,
            passwordHash,
            role: "BUYER",
            isVerified: true,
            isActive: true,
        });
        if (createdAt) {
            await prisma.user.update({
                where: { id: row.id },
                data: { createdAt },
            });
        }
        buyers[spec.username] = row;
    }

    const cat = {
        electronics: electronics?.id,
        fashion: fashion?.id,
        accessories: accessories?.id,
        home: home?.id,
        beauty: beauty?.id,
        kitchen: categories.kitchen.id,
        skincare: categories.skincare.id,
        streetwear: categories.streetwear.id,
    };

    const products = {};
    const productDefs = [
        {
            slug: "den-ban-gom-su-vintage",
            seller: "linhnha",
            categoryIds: [cat.home].filter(Boolean),
            title: "Đèn bàn gốm sứ vintage 40cm",
            description:
                "Đế gốm sứ men mờ, chao vải linen. Ánh sáng ấm 2700K, phù hợp góc đọc và bàn làm việc. Dây vải bọc, công tắc trên dây. Bóng LED 6W đi kèm.",
            price: "420000",
            compareAtPrice: "520000",
            sku: "NL-DEN-40",
            stockQuantity: 28,
            salesCount: 64,
            viewsCount: 890,
            publishedAt: daysAgo(40, 10),
            images: [
                { url: PHOTO("1507473885765-e6cff1f5fcfb"), alt: "Đèn bàn gốm sứ trên bàn gỗ" },
                { url: PHOTO("1513506003901-1e6a229e2d15"), alt: "Đèn bàn bật ánh sáng ấm" },
            ],
            variants: [
                { variantName: "Men mờ trắng", sku: "NL-DEN-40-W", price: "420000", stockQuantity: 16, options: { color: "Trắng" }, isActive: true },
                { variantName: "Men đất sét", sku: "NL-DEN-40-C", price: "445000", stockQuantity: 12, options: { color: "Nâu đất" }, isActive: true },
            ],
        },
        {
            slug: "tham-canvas-phong-khach-160x230",
            seller: "linhnha",
            categoryIds: [cat.home].filter(Boolean),
            title: "Thảm canvas phòng khách 160x230",
            description:
                "Thảm dệt canvas, đế chống trượt. Họa tiết trung tính, giặt tay hoặc giặt máy túi lưới. Phù hợp phòng khách căn hộ.",
            price: "890000",
            compareAtPrice: "1090000",
            sku: "NL-THAM-160",
            stockQuantity: 14,
            salesCount: 31,
            viewsCount: 540,
            publishedAt: daysAgo(28, 11),
            images: [
                { url: PHOTO("1555041469-a586c61ea9bc"), alt: "Thảm canvas trải phòng khách" },
            ],
        },
        {
            slug: "binh-gom-cam-hoa-cung",
            seller: "linhnha",
            categoryIds: [cat.home].filter(Boolean),
            title: "Bình gốm cắm hoa cổ lọ 22cm",
            description:
                "Bình gốm thủ công, men rạn nhẹ. Cắm được hoa tươi hoặc hoa giả cành dài. Không thấm nước ra đế.",
            price: "245000",
            sku: "NL-BINH-22",
            stockQuantity: 41,
            salesCount: 88,
            viewsCount: 720,
            publishedAt: daysAgo(21, 16),
            images: [
                { url: PHOTO("1493106641515-6b5631de4bb9"), alt: "Bình gốm cắm hoa trên kệ" },
            ],
        },
        {
            slug: "tai-nghe-true-wireless-pulse-pro",
            seller: "minhgadget",
            categoryIds: [cat.electronics, cat.accessories].filter(Boolean),
            title: "Tai nghe True Wireless Pulse Pro",
            description:
                "Driver 10mm, chống ồn chủ động 3 mức, hộp sạc USB-C. Nghe nhạc 7 giờ/lần sạc, tổng 28 giờ. App EQ sẵn. Phù hợp họp online và xe bus.",
            price: "1290000",
            compareAtPrice: "1590000",
            sku: "MG-PULSE-PRO",
            stockQuantity: 73,
            salesCount: 214,
            viewsCount: 3120,
            publishedAt: daysAgo(55, 9),
            images: [
                { url: PHOTO("1590658268037-6bf12165a8df"), alt: "Tai nghe Pulse Pro trong hộp sạc" },
                { url: PHOTO("1484704849700-f032a568e944"), alt: "Tai nghe đeo ngoài trời" },
            ],
            variants: [
                { variantName: "Đen graphit", sku: "MG-PULSE-BK", price: "1290000", stockQuantity: 40, options: { color: "Đen" }, isActive: true },
                { variantName: "Trắng sữa", sku: "MG-PULSE-WH", price: "1290000", stockQuantity: 33, options: { color: "Trắng" }, isActive: true },
            ],
        },
        {
            slug: "sac-nhanh-gan-65w",
            seller: "minhgadget",
            categoryIds: [cat.electronics].filter(Boolean),
            title: "Củ sạc nhanh GaN 65W 2 cổng",
            description:
                "1 USB-C + 1 USB-A, sạc laptop mỏng và điện thoại cùng lúc. Nóng ít hơn củ thường. Kèm cáp C-to-C 1m.",
            price: "349000",
            compareAtPrice: "429000",
            sku: "MG-GAN-65",
            stockQuantity: 110,
            salesCount: 301,
            viewsCount: 1980,
            publishedAt: daysAgo(33, 12),
            images: [
                { url: PHOTO("1583863788434-e58a256e6a1d"), alt: "Củ sạc GaN 65W trên bàn" },
            ],
        },
        {
            slug: "op-lungs-magsafe-trong-suot",
            seller: "minhgadget",
            categoryIds: [cat.accessories].filter(Boolean),
            title: "Ốp lưng MagSafe trong suốt",
            description:
                "TPU dẻo, ốp viền nhám chống vân. Nam châm xếp sạc MagSafe. Có bản iPhone 13/14/15.",
            price: "189000",
            sku: "MG-CASE-MS",
            stockQuantity: 160,
            salesCount: 402,
            viewsCount: 2210,
            publishedAt: daysAgo(18, 15),
            images: [
                { url: PHOTO("1603314585442-ee3b3c16fbcf"), alt: "Ốp lưng trong suốt trên điện thoại" },
            ],
            variants: [
                { variantName: "iPhone 14", sku: "MG-CASE-14", price: "189000", stockQuantity: 70, options: { model: "iPhone 14" }, isActive: true },
                { variantName: "iPhone 15", sku: "MG-CASE-15", price: "199000", stockQuantity: 90, options: { model: "iPhone 15" }, isActive: true },
            ],
        },
        {
            slug: "serum-niacinamide-10-30ml",
            seller: "ngocskin",
            categoryIds: [cat.beauty, cat.skincare].filter(Boolean),
            title: "Serum Niacinamide 10% 30ml",
            description:
                "Kiềm dầu, mờ thâm sau mụn. Texture lỏng, thấm nhanh. Dùng tối sau toner, trước kem dưỡng. Không dùng chung vitamin C buổi sáng.",
            price: "259000",
            compareAtPrice: "320000",
            sku: "NB-NIA-30",
            stockQuantity: 86,
            salesCount: 177,
            viewsCount: 1640,
            publishedAt: daysAgo(36, 8),
            images: [
                { url: PHOTO("1556228720-195a672e8a03"), alt: "Chai serum niacinamide trên khăn trắng" },
            ],
        },
        {
            slug: "kem-chong-nang-spf50",
            seller: "ngocskin",
            categoryIds: [cat.beauty, cat.skincare].filter(Boolean),
            title: "Kem chống nắng SPF50+ kiềm dầu",
            description:
                "Finish tự nhiên, không trắng bệt. Thấm 1 phút trước makeup. Thoa lại sau 2-3 giờ nếu ra ngoài nắng Đà Nẵng.",
            price: "315000",
            sku: "NB-SUN-50",
            stockQuantity: 64,
            salesCount: 209,
            viewsCount: 1888,
            publishedAt: daysAgo(24, 9),
            images: [
                { url: PHOTO("1556228578-8d5894dbd8bf"), alt: "Tuýp kem chống nắng SPF50" },
            ],
        },
        {
            slug: "toner-rau-ma-200ml",
            seller: "ngocskin",
            categoryIds: [cat.skincare].filter(Boolean),
            title: "Toner rau má 200ml",
            description:
                "Dịu da sau mụn viêm. Không cồn, mùi rau má nhẹ. Có thể đắp cotton 5 phút như mask giấy.",
            price: "189000",
            sku: "NB-TON-200",
            stockQuantity: 92,
            salesCount: 143,
            viewsCount: 970,
            publishedAt: daysAgo(12, 14),
            images: [
                { url: PHOTO("1571781926291-c77da61d1c2c"), alt: "Chai toner rau má" },
            ],
        },
        {
            slug: "ao-thun-boxy-wash-xam",
            seller: "hungstreet",
            categoryIds: [cat.fashion, cat.streetwear].filter(Boolean),
            title: "Áo thun boxy wash xám",
            description:
                "Cotton 280gsm, wash mòn nhẹ. Form boxy, dài tới hông. Nên +1 size nếu thích rộng. Giặt lộn trái, không sấy nhiệt cao.",
            price: "299000",
            compareAtPrice: "379000",
            sku: "HS-TEE-GX",
            stockQuantity: 47,
            salesCount: 126,
            viewsCount: 1430,
            publishedAt: daysAgo(19, 17),
            images: [
                { url: PHOTO("1521572163474-6864f9cf17ab"), alt: "Áo thun boxy xám trên móc" },
                { url: PHOTO("1489987707025-941c4a4d6cd0"), alt: "Áo thun boxy mặc overlay" },
            ],
            variants: [
                { variantName: "M", sku: "HS-TEE-GX-M", price: "299000", stockQuantity: 18, options: { size: "M" }, isActive: true },
                { variantName: "L", sku: "HS-TEE-GX-L", price: "299000", stockQuantity: 16, options: { size: "L" }, isActive: true },
                { variantName: "XL", sku: "HS-TEE-GX-XL", price: "299000", stockQuantity: 13, options: { size: "XL" }, isActive: true },
            ],
        },
        {
            slug: "quan-cargo-kaki-ong-rong",
            seller: "hungstreet",
            categoryIds: [cat.streetwear].filter(Boolean),
            title: "Quần cargo kaki ống rộng",
            description:
                "Kaki dày, túi hộp 2 bên. Lưng thun + dây rút. Dài chạm giày, không cần gấp gấu.",
            price: "449000",
            sku: "HS-CARGO-01",
            stockQuantity: 35,
            salesCount: 79,
            viewsCount: 860,
            publishedAt: daysAgo(11, 18),
            images: [
                { url: PHOTO("1506629082955-511b1aa562c8"), alt: "Quần cargo kaki ống rộng" },
            ],
            variants: [
                { variantName: "M / Be", sku: "HS-CARGO-M-BE", price: "449000", stockQuantity: 20, options: { size: "M", color: "Be" }, isActive: true },
                { variantName: "L / Rêu", sku: "HS-CARGO-L-GR", price: "449000", stockQuantity: 15, options: { size: "L", color: "Rêu" }, isActive: true },
            ],
        },
        {
            slug: "non-bucket-canvas",
            seller: "hungstreet",
            categoryIds: [cat.streetwear].filter(Boolean),
            title: "Nón bucket canvas trơn",
            description:
                "Canvas 12oz, vành vừa đủ che nắng. Freesize, có dây rút bên trong.",
            price: "189000",
            sku: "HS-BUCKET",
            stockQuantity: 58,
            salesCount: 95,
            viewsCount: 640,
            publishedAt: daysAgo(8, 13),
            images: [
                { url: PHOTO("1521369909029-2afed882baee"), alt: "Nón bucket canvas" },
            ],
        },
        {
            slug: "chao-chong-dinh-28cm",
            seller: "maibep",
            categoryIds: [cat.kitchen, cat.home].filter(Boolean),
            title: "Chảo chống dính 28cm đáy từ",
            description:
                "Đáy từ dùng bếp từ và bếp gas. Tay cầm bakelite, không nóng. Rửa mềm, không kim loại. Chiên trứng không cần nhiều dầu.",
            price: "459000",
            compareAtPrice: "560000",
            sku: "MK-CHAO-28",
            stockQuantity: 39,
            salesCount: 118,
            viewsCount: 1020,
            publishedAt: daysAgo(26, 7),
            images: [
                { url: PHOTO("1556910103-1c02745aae4d"), alt: "Chảo chống dính 28cm trên bếp" },
            ],
        },
        {
            slug: "may-xay-sinh-to-mini",
            seller: "maibep",
            categoryIds: [cat.kitchen].filter(Boolean),
            title: "Máy xay sinh tố mini 600ml",
            description:
                "Xay đá viên nhỏ, smoothie, sốt. Cối thủy tinh, lưỡi inox. Ồn vừa, phù hợp căn hộ.",
            price: "529000",
            sku: "MK-XAY-600",
            stockQuantity: 22,
            salesCount: 54,
            viewsCount: 710,
            publishedAt: daysAgo(15, 10),
            images: [
                { url: PHOTO("1570222094114-d058a4482660"), alt: "Máy xay sinh tố mini trên kệ bếp" },
            ],
        },
    ];

    for (const def of productDefs) {
        const { seller, ...rest } = def;
        products[def.slug] = await upsertProduct(prisma, {
            ...rest,
            sellerId: sellers[seller].id,
            status: "ACTIVE",
            lowStockThreshold: 8,
        });
    }

    const followPairs = [
        ["anpham", "minhgadget"],
        ["anpham", "hungstreet"],
        ["thuvo", "ngocskin"],
        ["thuvo", "linhnha"],
        ["khoanguyen", "linhnha"],
        ["khoanguyen", "minhgadget"],
        ["hatran", "maibep"],
        ["hatran", "ngocskin"],
        ["namle", "hungstreet"],
        ["namle", "minhgadget"],
        ["mybui", "linhnha"],
        ["mybui", "ngocskin"],
        ["tuando", "minhgadget"],
        ["tuando", "maibep"],
        ["quynhho", "ngocskin"],
        ["quynhho", "hungstreet"],
        ["linhnha", "ngocskin"],
        ["minhgadget", "hungstreet"],
        ["anpham", "thuvo"],
        ["khoanguyen", "mybui"],
    ];
    for (const [follower, following] of followPairs) {
        const followerId = (buyers[follower] || sellers[follower]).id;
        const followingId = (buyers[following] || sellers[following]).id;
        await prisma.follow.upsert({
            where: { followerId_followingId: { followerId, followingId } },
            update: {},
            create: { followerId, followingId },
        });
    }

    const groupDefs = [
        {
            slug: "goc-nha-nho-ha-noi",
            name: "Góc nhà nhỏ Hà Nội",
            description: "Decor căn hộ 20-40m2, đèn ấm, cây cảnh, chợ đồ cũ cuối tuần.",
            privacy: "PUBLIC",
            owner: "linhnha",
            coverImageUrl: PHOTO("1616486338812-3dadae4b4ace", 1200),
            avatarUrl: PHOTO("1493106641515-6b5631de4bb9", 256),
            members: ["khoanguyen", "mybui", "thuvo", "hatran"],
        },
        {
            slug: "skincare-review-that",
            name: "Skincare review thật",
            description: "Review sau 2 tuần dùng. Cấm spam link shopee không nguồn.",
            privacy: "PUBLIC",
            owner: "ngocskin",
            coverImageUrl: PHOTO("1570172619644-dfd03ed5d881", 1200),
            avatarUrl: PHOTO("1556228720-195a672e8a03", 256),
            members: ["thuvo", "quynhho", "hatran", "mybui"],
        },
        {
            slug: "deal-cong-nghe-cuoi-tuan",
            name: "Deal công nghệ cuối tuần",
            description: "Săn sạc, tai nghe, ốp. Check giá trước khi share.",
            privacy: "PUBLIC",
            owner: "minhgadget",
            coverImageUrl: PHOTO("1510557883873-ea2f7ac4971d", 1200),
            avatarUrl: PHOTO("1590658268037-6bf12165a8df", 256),
            members: ["anpham", "tuando", "namle", "khoanguyen"],
        },
        {
            slug: "streetwear-viet-drop",
            name: "Streetwear Việt drop",
            description: "Drop local brand, hỏi size, phối đồ. Duyệt bài trước khi hiện.",
            privacy: "PRIVATE",
            owner: "hungstreet",
            coverImageUrl: PHOTO("1483985988355-763728e1935b", 1200),
            avatarUrl: PHOTO("1521572163474-6864f9cf17ab", 256),
            members: ["namle", "anpham"],
            pending: ["tuando"],
        },
    ];

    const groups = {};
    for (const g of groupDefs) {
        const ownerId = sellers[g.owner].id;
        const group = await prisma.group.upsert({
            where: { slug: g.slug },
            update: {
                name: g.name,
                description: g.description,
                privacy: g.privacy,
                createdBy: ownerId,
                coverImageUrl: g.coverImageUrl,
                avatarUrl: g.avatarUrl,
                membersCount: 1 + g.members.length,
                postsCount: 0,
            },
            create: {
                slug: g.slug,
                name: g.name,
                description: g.description,
                privacy: g.privacy,
                createdBy: ownerId,
                coverImageUrl: g.coverImageUrl,
                avatarUrl: g.avatarUrl,
                membersCount: 1 + g.members.length,
            },
        });
        groups[g.slug] = group;
        await prisma.groupMember.upsert({
            where: { groupId_userId: { groupId: group.id, userId: ownerId } },
            update: { role: "ADMIN" },
            create: { groupId: group.id, userId: ownerId, role: "ADMIN" },
        });
        for (const username of g.members) {
            const userId = (buyers[username] || sellers[username]).id;
            await prisma.groupMember.upsert({
                where: { groupId_userId: { groupId: group.id, userId } },
                update: { role: "MEMBER" },
                create: { groupId: group.id, userId, role: "MEMBER" },
            });
        }
        for (const username of g.pending || []) {
            const userId = buyers[username].id;
            await prisma.groupJoinRequest.upsert({
                where: { groupId_userId: { groupId: group.id, userId } },
                update: { status: "PENDING" },
                create: { groupId: group.id, userId, status: "PENDING" },
            });
        }
        await prisma.groupInvite.upsert({
            where: { code: `SOCO-${g.slug.slice(0, 12).toUpperCase()}` },
            update: {
                groupId: group.id,
                createdBy: ownerId,
                isActive: true,
                maxUses: 20,
                expiresAt: daysAgo(-30),
            },
            create: {
                groupId: group.id,
                code: `SOCO-${g.slug.slice(0, 12).toUpperCase()}`,
                createdBy: ownerId,
                maxUses: 20,
                expiresAt: daysAgo(-30),
            },
        });
    }

    const postDefs = [
        {
            id: "demo-post-01",
            author: "minhgadget",
            days: 2,
            hour: 20,
            feeling: "hào hứng",
            location: "Quận 5, TP.HCM",
            content:
                "Pulse Pro về thêm bản trắng sữa. Đeo họp Zoom 3 tiếng không đau tai, ANC cắt được quạt trần phòng trọ. Ai đang dùng bản đen cho mình xin review bass với.",
            mediaUrls: [PHOTO("1590658268037-6bf12165a8df", 1200)],
            product: "tai-nghe-true-wireless-pulse-pro",
            likes: ["anpham", "tuando", "namle", "khoanguyen"],
            comments: [
                { user: "anpham", text: "Bản đen bass hơi nhiều với nhạc ballad, bật EQ Vocal là ổn." },
                { user: "tuando", text: "Sạc đầy hộp mất bao lâu bác?" },
            ],
        },
        {
            id: "demo-post-02",
            author: "linhnha",
            days: 3,
            hour: 21,
            location: "Ba Đình, Hà Nội",
            feeling: "thư giãn",
            content:
                "Góc đọc 2m2 tối qua. Đèn gốm 40cm + bình hoa mini là đủ ấm, không cần đèn trần. Căn hộ cũ hay bị vàng ánh sáng nên chọn chao linen.",
            mediaUrls: [PHOTO("1513506003901-1e6a229e2d15", 1200), PHOTO("1493106641515-6b5631de4bb9", 1200)],
            product: "den-ban-gom-su-vintage",
            group: "goc-nha-nho-ha-noi",
            likes: ["khoanguyen", "mybui", "thuvo"],
            comments: [
                { user: "khoanguyen", text: "Chị ơi bóng LED 6W đọc sách có đủ không, em đang sợ tối." },
                { user: "mybui", text: "Bình hoa mix với đèn đẹp quá, em lưu liền." },
            ],
        },
        {
            id: "demo-post-03",
            author: "ngocskin",
            days: 4,
            hour: 7,
            location: "Hải Châu, Đà Nẵng",
            feeling: "tỉnh táo",
            content:
                "Routine sáng da dầu mùa nắng: toner rau má → niacinamide tối hôm trước → chống nắng SPF50. Ra ngoài 9h phải thoa lại. Không tin hũ nào 'không bóng dầu cả ngày' ở Đà Nẵng.",
            mediaUrls: [PHOTO("1556228578-8d5894dbd8bf", 1200)],
            product: "kem-chong-nang-spf50",
            group: "skincare-review-that",
            likes: ["thuvo", "quynhho", "hatran", "mybui"],
            comments: [
                { user: "thuvo", text: "Em da hỗn hợp, niacinamide 10% em đang dùng cách ngày, chưa châm." },
                { user: "quynhho", text: "Chị ơi finish có trắng bệt không khi quay video ngoài trời?" },
            ],
        },
        {
            id: "demo-post-04",
            author: "hungstreet",
            days: 1,
            hour: 18,
            location: "Quận 1, TP.HCM",
            feeling: "tự hào",
            content:
                "Drop boxy wash xám 280gsm. Form rộng, mặc 1 mình hoặc khoác sơ mi. Size L của mình 1m76 68kg vừa boxy, không bị cánh dơi.",
            mediaUrls: [PHOTO("1521572163474-6864f9cf17ab", 1200)],
            product: "ao-thun-boxy-wash-xam",
            group: "streetwear-viet-drop",
            likes: ["namle", "anpham"],
            comments: [{ user: "namle", text: "1m82 75kg anh lấy XL hay L?" }],
        },
        {
            id: "demo-post-05",
            author: "maibep",
            days: 5,
            hour: 19,
            location: "Hải Châu, Đà Nẵng",
            content:
                "Tối nay chiên cá không dính, dầu chỉ 1 thìa. Chảo 28cm đáy từ, nhà em bếp từ mini vẫn đều lửa. Rửa xong nhớ lau khô kẻo ố quai.",
            mediaUrls: [PHOTO("1556910103-1c02745aae4d", 1200)],
            product: "chao-chong-dinh-28cm",
            likes: ["hatran", "tuando", "thuvo"],
            comments: [{ user: "hatran", text: "Chị ơi chiên trứng ốp la có cần xịt dầu không?" }],
        },
        {
            id: "demo-post-06",
            author: "anpham",
            days: 6,
            hour: 22,
            content:
                "Đeo Pulse Pro đi Grab 40 phút, ANC cắt được ống xả khá ổn. Bass hơi nhiều, gạt EQ là nghe podcast rõ. Đóng hộp gọn bỏ túi jean.",
            mediaUrls: [PHOTO("1484704849700-f032a568e944", 1200)],
            product: "tai-nghe-true-wireless-pulse-pro",
            likes: ["tuando", "minhgadget", "namle"],
            comments: [{ user: "minhgadget", text: "Cảm ơn An, tối mình note vào bài review shop." }],
        },
        {
            id: "demo-post-07",
            author: "thuvo",
            days: 7,
            hour: 21,
            group: "skincare-review-that",
            content:
                "Tuần 2 niacinamide: lỗ chân lông mũi đỡ bóng lúc 3h chiều. Có ngày châm nhẹ nên giờ cách 1 tối. Toner rau má thì dịu, không stinging.",
            mediaUrls: [PHOTO("1556228720-195a672e8a03", 1200)],
            product: "serum-niacinamide-10-30ml",
            likes: ["ngocskin", "quynhho", "hatran"],
            comments: [{ user: "ngocskin", text: "Cách ngày là hợp da em. Cảm ơn review trung thực." }],
        },
        {
            id: "demo-post-08",
            author: "khoanguyen",
            days: 8,
            hour: 20,
            group: "goc-nha-nho-ha-noi",
            location: "Cầu Giấy, Hà Nội",
            content:
                "Bàn 1m2 hết chỗ để cây. Chuyển sang đèn gốm + thảm canvas, góc làm việc trông bớt 'ký túc xá'. Ai Cầu Giấy ship trong ngày không?",
            mediaUrls: [PHOTO("1555041469-a586c61ea9bc", 1200)],
            product: "tham-canvas-phong-khach-160x230",
            likes: ["linhnha", "mybui"],
            comments: [{ user: "linhnha", text: "Nội thành Hà Nội trước 14h là giao tối đó Khoa nhé." }],
        },
        {
            id: "demo-post-09",
            author: "tuando",
            days: 9,
            hour: 13,
            group: "deal-cong-nghe-cuoi-tuan",
            content:
                "Củ GaN 65W sạc Mac 13\" + điện thoại. Để túi laptop không chiếm chỗ. Nóng vừa khi full 65W, để thoáng ra.",
            mediaUrls: [PHOTO("1583863788434-e58a256e6a1d", 1200)],
            product: "sac-nhanh-gan-65w",
            likes: ["anpham", "minhgadget", "khoanguyen"],
            comments: [],
        },
        {
            id: "demo-post-10",
            author: "mybui",
            days: 10,
            hour: 16,
            feeling: "vui",
            content:
                "Ban công 3m2: một bình gốm, hai chậu lá. Không cần nhiều. Nhà Linh gói cẩn, gốm không mẻ.",
            mediaUrls: [PHOTO("1493106641515-6b5631de4bb9", 1200)],
            product: "binh-gom-cam-hoa-cung",
            likes: ["linhnha", "thuvo", "khoanguyen"],
            comments: [{ user: "linhnha", text: "Ảnh ban công xinh quá My ơi." }],
        },
        {
            id: "demo-post-11",
            author: "namle",
            days: 3,
            hour: 19,
            content:
                "Cargo kaki mặc với boxy xám. Ống rộng không vướng giày. Túi hộp đựng vừa AirPods + card.",
            mediaUrls: [PHOTO("1506629082955-511b1aa562c8", 1200)],
            product: "quan-cargo-kaki-ong-rong",
            likes: ["hungstreet", "anpham"],
            comments: [],
        },
        {
            id: "demo-post-12",
            author: "hatran",
            days: 11,
            hour: 18,
            content:
                "Xay sinh tố chuối + sữa đặc cho hai đứa. Cối 600ml vừa một lần, không phải chia mẻ. Ồn chấp nhận được lúc 6h sáng.",
            mediaUrls: [PHOTO("1570222094114-d058a4482660", 1200)],
            product: "may-xay-sinh-to-mini",
            likes: ["maibep", "tuando"],
            comments: [{ user: "maibep", text: "Cám ơn chị Hà, em sẽ gắn ảnh này lên shop." }],
        },
        {
            id: "demo-post-13",
            author: "quynhho",
            days: 2,
            hour: 8,
            group: "skincare-review-that",
            content:
                "Chống nắng thoa lại lần 2 lúc 10h, selfie ngoài trời không flashback. Da hỗn hợp vẫn bóng nhẹ vùng T, đúng quảng cáo 'tự nhiên' chứ không phải kiềm dầu phép thuật.",
            mediaUrls: [PHOTO("1570172619644-dfd03ed5d881", 1200)],
            product: "kem-chong-nang-spf50",
            likes: ["ngocskin", "thuvo"],
            comments: [],
        },
        {
            id: "demo-post-14",
            author: "hungstreet",
            days: 12,
            hour: 17,
            content:
                "Bucket canvas trơn, vành không quá 'câu cá'. Đi nắng Q.1 buổi trưa đỡ cháy tai. Freesize, đầu 58cm vẫn ổn.",
            mediaUrls: [PHOTO("1521369909029-2afed882baee", 1200)],
            product: "non-bucket-canvas",
            likes: ["namle", "anpham", "quynhho"],
            comments: [],
        },
        {
            id: "demo-post-15",
            author: "minhgadget",
            days: 14,
            hour: 11,
            group: "deal-cong-nghe-cuoi-tuan",
            content:
                "Ốp MagSafe trong suốt về thêm iPhone 15. Viền nhám, mặt lưng dễ lau. Không ố vàng sau 3 tháng bản 14 mình đang đeo test.",
            mediaUrls: [PHOTO("1603314585442-ee3b3c16fbcf", 1200)],
            product: "op-lungs-magsafe-trong-suot",
            likes: ["anpham", "tuando"],
            comments: [{ user: "tuando", text: "Bản 15 MagSafe dính ví Apple không bác?" }],
        },
        {
            id: "demo-post-16",
            author: "linhnha",
            days: 16,
            hour: 15,
            content:
                "Thảm 160x230 phủ vừa phòng khách 18m2. Canvas không xù sau 2 tuần. Lót chống trượt, bé nhà người quen lê xe gỗ không dồn thảm.",
            mediaUrls: [PHOTO("1555041469-a586c61ea9bc", 1200)],
            product: "tham-canvas-phong-khach-160x230",
            likes: ["khoanguyen", "mybui", "hatran"],
            comments: [],
        },
    ];

    const posts = {};
    for (const p of postDefs) {
        const authorId = (sellers[p.author] || buyers[p.author]).id;
        const publishedAt = daysAgo(p.days, p.hour, 12);
        const groupId = p.group ? groups[p.group].id : undefined;
        const likeUsers = p.likes || [];
        const commentList = p.comments || [];
        const post = await prisma.post.upsert({
            where: { id: p.id },
            update: {
                authorId,
                content: p.content,
                mediaUrls: p.mediaUrls || [],
                mediaType: p.mediaUrls?.length ? "IMAGE" : null,
                groupId,
                location: p.location || null,
                feeling: p.feeling || null,
                status: "PUBLISHED",
                visibility: "PUBLIC",
                likesCount: likeUsers.length,
                commentsCount: commentList.length,
                viewsCount: 40 + p.days * 17 + likeUsers.length * 8,
                sharesCount: Math.min(likeUsers.length, 3),
                publishedAt,
            },
            create: {
                id: p.id,
                authorId,
                content: p.content,
                mediaUrls: p.mediaUrls || [],
                mediaType: p.mediaUrls?.length ? "IMAGE" : null,
                groupId,
                location: p.location || null,
                feeling: p.feeling || null,
                status: "PUBLISHED",
                visibility: "PUBLIC",
                likesCount: likeUsers.length,
                commentsCount: commentList.length,
                viewsCount: 40 + p.days * 17 + likeUsers.length * 8,
                sharesCount: Math.min(likeUsers.length, 3),
                publishedAt,
            },
        });
        posts[p.id] = post;

        if (p.product && products[p.product]) {
            await prisma.postProductTag.deleteMany({ where: { postId: post.id } });
            await prisma.postProductTag.create({
                data: {
                    postId: post.id,
                    productId: products[p.product].id,
                    anchorType: "MEDIA_HOTSPOT",
                    positionX: 48,
                    positionY: 52,
                    sortOrder: 0,
                },
            });
        }

        for (const username of likeUsers) {
            const userId = (buyers[username] || sellers[username]).id;
            await prisma.postLike.upsert({
                where: { postId_userId: { postId: post.id, userId } },
                update: {},
                create: { postId: post.id, userId },
            });
        }

        for (const [index, comment] of commentList.entries()) {
            const userId = (buyers[comment.user] || sellers[comment.user]).id;
            const commentId = `${p.id}-c${index}`;
            await prisma.postComment.upsert({
                where: { id: commentId },
                update: { postId: post.id, userId, content: comment.text },
                create: { id: commentId, postId: post.id, userId, content: comment.text },
            });
        }
    }

    const orderDefs = [
        {
            number: "SOCO-240812-1001",
            buyer: "anpham",
            product: "tai-nghe-true-wireless-pulse-pro",
            qty: 1,
            status: "COMPLETED",
            paymentStatus: "PAID",
            paymentMethod: "MOMO",
            days: 18,
            deliveredDays: 14,
            city: "TP.HCM",
            district: "Bình Thạnh",
            ward: "Phường 1",
            address: "21 Bùi Hữu Nghĩa",
            shippingFee: "22000",
            note: "Gọi trước 15 phút, giờ hành chính",
            trackingNumber: "SPXVN0428811001",
            carrier: "SPX Express",
            review: {
                rating: 5,
                title: "Đeo họp lâu không đau",
                content: "Bass hơi nhiều lúc đầu, chỉnh EQ xong nghe podcast rõ. Hộp sạc bỏ túi được. Giao 2 ngày.",
            },
        },
        {
            number: "SOCO-240901-1002",
            buyer: "thuvo",
            product: "serum-niacinamide-10-30ml",
            qty: 1,
            status: "DELIVERED",
            paymentStatus: "PAID",
            paymentMethod: "COD",
            days: 12,
            deliveredDays: 8,
            city: "Hà Nội",
            district: "Đống Đa",
            ward: "Cát Linh",
            address: "9 Tôn Đức Thắng",
            shippingFee: "25000",
            trackingNumber: "GHN44129002",
            carrier: "Giao Hàng Nhanh",
            review: {
                rating: 4,
                title: "Hợp da nhưng nên cách ngày",
                content: "Kiềm dầu rõ sau tuần 2. Đêm nào cũng dùng thì hơi châm. Shop đóng hộp có chống sốc.",
            },
        },
        {
            number: "SOCO-240905-1003",
            buyer: "khoanguyen",
            product: "den-ban-gom-su-vintage",
            qty: 1,
            status: "SHIPPING",
            paymentStatus: "PAID",
            paymentMethod: "BANK_TRANSFER",
            days: 4,
            city: "Hà Nội",
            district: "Cầu Giấy",
            ward: "Dịch Vọng",
            address: "44 Cầu Giấy",
            shippingFee: "35000",
            trackingNumber: "VTP8821003",
            carrier: "Viettel Post",
        },
        {
            number: "SOCO-240910-1004",
            buyer: "hatran",
            product: "chao-chong-dinh-28cm",
            qty: 1,
            status: "PROCESSING",
            paymentStatus: "PAID",
            paymentMethod: "COD",
            days: 2,
            city: "Đà Nẵng",
            district: "Hải Châu",
            ward: "Hải Châu I",
            address: "102 Lê Duẩn",
            shippingFee: "20000",
        },
        {
            number: "SOCO-240911-1005",
            buyer: "namle",
            product: "ao-thun-boxy-wash-xam",
            qty: 1,
            status: "CONFIRMED",
            paymentStatus: "PENDING",
            paymentMethod: "BANK_TRANSFER",
            days: 1,
            city: "TP.HCM",
            district: "Quận 1",
            ward: "Bến Nghé",
            address: "7 Nguyễn Huệ",
            shippingFee: "22000",
            note: "Size L, giao giờ nghỉ trưa",
        },
        {
            number: "SOCO-240911-1006",
            buyer: "mybui",
            product: "binh-gom-cam-hoa-cung",
            qty: 2,
            status: "COMPLETED",
            paymentStatus: "PAID",
            paymentMethod: "MOMO",
            days: 20,
            deliveredDays: 16,
            city: "Hà Nội",
            district: "Hoàn Kiếm",
            ward: "Hàng Bài",
            address: "18 Hàng Bài",
            shippingFee: "25000",
            review: {
                rating: 5,
                title: "Gốm đẹp, đóng hàng chắc",
                content: "Hai bình men khác nhau một chút vì handmade. Đúng vibe ban công nhỏ.",
            },
        },
        {
            number: "SOCO-240912-1007",
            buyer: "tuando",
            product: "sac-nhanh-gan-65w",
            qty: 1,
            status: "PENDING",
            paymentStatus: "PENDING",
            paymentMethod: "COD",
            days: 0,
            city: "TP.HCM",
            district: "Quận 3",
            ward: "Võ Thị Sáu",
            address: "63 Võ Văn Tần",
            shippingFee: "22000",
        },
        {
            number: "SOCO-240828-1008",
            buyer: "quynhho",
            product: "kem-chong-nang-spf50",
            qty: 1,
            status: "CANCELLED",
            paymentStatus: "REFUNDED",
            paymentMethod: "MOMO",
            days: 22,
            city: "Đà Nẵng",
            district: "Hải Châu",
            ward: "Thạch Thang",
            address: "31 Pasteur",
            shippingFee: "20000",
            cancelReason: "Đặt nhầm dung tích, đã báo shop hoàn.",
        },
        {
            number: "SOCO-240906-1009",
            buyer: "anpham",
            product: "op-lungs-magsafe-trong-suot",
            qty: 1,
            status: "COMPLETED",
            paymentStatus: "PAID",
            paymentMethod: "COD",
            days: 15,
            deliveredDays: 12,
            city: "TP.HCM",
            district: "Bình Thạnh",
            ward: "Phường 1",
            address: "21 Bùi Hữu Nghĩa",
            shippingFee: "18000",
            review: {
                rating: 5,
                title: "Nam châm dính ví chắc",
                content: "Ốp không làm dày máy. Viền nhám cầm đỡ trơn.",
            },
        },
        {
            number: "SOCO-240908-1010",
            buyer: "hatran",
            product: "may-xay-sinh-to-mini",
            qty: 1,
            status: "SHIPPING",
            paymentStatus: "PAID",
            paymentMethod: "BANK_TRANSFER",
            days: 3,
            city: "Đà Nẵng",
            district: "Hải Châu",
            ward: "Hải Châu I",
            address: "102 Lê Duẩn",
            shippingFee: "30000",
            trackingNumber: "JT2409081010",
            carrier: "J&T Express",
        },
    ];

    const itemStatus = {
        PENDING: "pending",
        CONFIRMED: "confirmed",
        PROCESSING: "processing",
        SHIPPING: "shipping",
        DELIVERED: "delivered",
        COMPLETED: "completed",
        CANCELLED: "cancelled",
        REFUNDED: "refunded",
    };

    for (const [index, o] of orderDefs.entries()) {
        const buyer = buyers[o.buyer];
        const product = products[o.product];
        const sellerId = product.sellerId;
        const unit = Number(product.price);
        const subtotal = unit * o.qty;
        const shipping = Number(o.shippingFee);
        const createdAt = daysAgo(o.days, 10, 30 + index);
        const deliveredAt = o.deliveredDays ? daysAgo(o.deliveredDays, 16, 5) : null;
        const order = await prisma.order.upsert({
            where: { orderNumber: o.number },
            update: {
                buyerId: buyer.id,
                subtotal: String(subtotal),
                shippingFee: o.shippingFee,
                total: String(subtotal + shipping),
                shippingName: buyer.fullName,
                shippingPhone: buyer.phone,
                shippingAddress: o.address,
                shippingCity: o.city,
                shippingDistrict: o.district,
                shippingWard: o.ward,
                shippingNote: o.note || null,
                paymentMethod: o.paymentMethod,
                paymentStatus: o.paymentStatus,
                status: o.status,
                trackingNumber: o.trackingNumber || null,
                carrier: o.carrier || null,
                deliveredAt,
                cancelledAt: o.status === "CANCELLED" ? daysAgo(o.days - 1) : null,
                cancellationReason: o.cancelReason || null,
                paidAt: o.paymentStatus === "PAID" ? createdAt : null,
                confirmedAt: ["PENDING", "CANCELLED"].includes(o.status) ? null : daysAgo(o.days, 12),
                shippedAt: ["SHIPPING", "DELIVERED", "COMPLETED"].includes(o.status)
                    ? daysAgo(Math.max(o.days - 1, 0), 9)
                    : null,
            },
            create: {
                orderNumber: o.number,
                buyerId: buyer.id,
                subtotal: String(subtotal),
                shippingFee: o.shippingFee,
                total: String(subtotal + shipping),
                shippingName: buyer.fullName,
                shippingPhone: buyer.phone,
                shippingAddress: o.address,
                shippingCity: o.city,
                shippingDistrict: o.district,
                shippingWard: o.ward,
                shippingNote: o.note || null,
                paymentMethod: o.paymentMethod,
                paymentStatus: o.paymentStatus,
                status: o.status,
                trackingNumber: o.trackingNumber || null,
                carrier: o.carrier || null,
                deliveredAt,
                cancelledAt: o.status === "CANCELLED" ? daysAgo(o.days - 1) : null,
                cancellationReason: o.cancelReason || null,
                paidAt: o.paymentStatus === "PAID" ? createdAt : null,
            },
        });
        await prisma.order.update({ where: { id: order.id }, data: { createdAt } });

        const orderItemId = `demo-oi-${o.number}`;
        const primaryImage = await prisma.productImage.findFirst({
            where: { productId: product.id, isPrimary: true },
        });
        const orderItem = await prisma.orderItem.upsert({
            where: { id: orderItemId },
            update: {
                orderId: order.id,
                productId: product.id,
                sellerId,
                productName: product.title,
                productImageUrl: primaryImage?.imageUrl,
                quantity: o.qty,
                unitPrice: product.price,
                totalPrice: String(subtotal),
                status: itemStatus[o.status] || "pending",
            },
            create: {
                id: orderItemId,
                orderId: order.id,
                productId: product.id,
                sellerId,
                productName: product.title,
                productImageUrl: primaryImage?.imageUrl,
                quantity: o.qty,
                unitPrice: product.price,
                totalPrice: String(subtotal),
                status: itemStatus[o.status] || "pending",
            },
        });

        if (o.review) {
            await prisma.review.upsert({
                where: { orderItemId: orderItem.id },
                update: {
                    productId: product.id,
                    userId: buyer.id,
                    rating: o.review.rating,
                    title: o.review.title,
                    content: o.review.content,
                    isVerifiedPurchase: true,
                    isPublished: true,
                    helpfulCount: 2 + (index % 4),
                    sellerResponse:
                        o.review.rating >= 5
                            ? "Cảm ơn bạn, shop sẽ giữ chất lượng lô sau."
                            : "Cảm ơn góp ý, mình đã ghi vào hướng dẫn dùng.",
                    sellerResponseAt: deliveredAt || createdAt,
                },
                create: {
                    productId: product.id,
                    orderItemId: orderItem.id,
                    userId: buyer.id,
                    rating: o.review.rating,
                    title: o.review.title,
                    content: o.review.content,
                    isVerifiedPurchase: true,
                    isPublished: true,
                    helpfulCount: 2 + (index % 4),
                },
            });
        }
    }

    for (const username of Object.keys(buyers)) {
        let cart = await prisma.cart.findFirst({
            where: { userId: buyers[username].id },
        });
        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId: buyers[username].id },
            });
        }
        const cartId = cart.id;
        const pick = {
            anpham: "sac-nhanh-gan-65w",
            thuvo: "kem-chong-nang-spf50",
            khoanguyen: "tham-canvas-phong-khach-160x230",
            hatran: "toner-rau-ma-200ml",
            namle: "quan-cargo-kaki-ong-rong",
            mybui: "den-ban-gom-su-vintage",
            tuando: "op-lungs-magsafe-trong-suot",
            quynhho: "serum-niacinamide-10-30ml",
        }[username];
        if (!pick) continue;
        const product = products[pick];
        const dup = await prisma.cartItem.findFirst({
            where: { cartId, productId: product.id, variantId: null },
        });
        if (!dup) {
            await prisma.cartItem.create({
                data: { cartId, productId: product.id, quantity: 1, price: product.price },
            });
        }
    }

    const threads = [
        {
            id: "demo-convo-an-minh",
            a: "anpham",
            b: "minhgadget",
            messages: [
                { from: "anpham", text: "Shop ơi Pulse Pro bản trắng còn không? Mình đeo họp nhiều." },
                { from: "minhgadget", text: "Còn 33 hộp. Nội thành HCM giao sáng mai nếu chốt trước 21h." },
                { from: "anpham", text: "Chốt 1 hộp, mình để địa chỉ Bình Thạnh nhé." },
            ],
        },
        {
            id: "demo-convo-thu-ngoc",
            a: "thuvo",
            b: "ngocskin",
            messages: [
                { from: "thuvo", text: "Chị ơi da em châm nhẹ khi dùng niacinamide mỗi tối, giảm còn cách ngày được không?" },
                { from: "ngocskin", text: "Được em. Tối không dùng thì toner rau má + dưỡng. Sáng vẫn chống nắng." },
            ],
        },
        {
            id: "demo-convo-khoa-linh",
            a: "khoanguyen",
            b: "linhnha",
            messages: [
                { from: "khoanguyen", text: "Đèn 40cm đọc sách ban đêm có bị chói không chị?" },
                { from: "linhnha", text: "Chao linen dịu hơn chao nhựa. Khoa để xa mắt khoảng 50cm là ổn." },
            ],
        },
    ];
    for (const thread of threads) {
        const createdBy = buyers[thread.a].id;
        const conversation = await prisma.conversation.upsert({
            where: { id: thread.id },
            update: { type: "DIRECT", createdBy },
            create: { id: thread.id, type: "DIRECT", createdBy },
        });
        for (const username of [thread.a, thread.b]) {
            const userId = (buyers[username] || sellers[username]).id;
            await prisma.conversationParticipant.upsert({
                where: { conversationId_userId: { conversationId: conversation.id, userId } },
                update: {},
                create: {
                    conversationId: conversation.id,
                    userId,
                    role: userId === createdBy ? "owner" : "member",
                },
            });
        }
        for (const [index, msg] of thread.messages.entries()) {
            const senderId = (buyers[msg.from] || sellers[msg.from]).id;
            const id = `${thread.id}-m${index}`;
            await prisma.message.upsert({
                where: { id },
                update: {
                    conversationId: conversation.id,
                    senderId,
                    content: msg.text,
                    messageType: "TEXT",
                    isRead: index < thread.messages.length - 1,
                },
                create: {
                    id,
                    conversationId: conversation.id,
                    senderId,
                    content: msg.text,
                    messageType: "TEXT",
                    isRead: index < thread.messages.length - 1,
                },
            });
        }
    }

    const notifs = [
        {
            id: "demo-n1",
            user: "minhgadget",
            type: "new_order",
            title: "Đơn mới Pulse Pro",
            message: "Phạm Hoàng An vừa đặt Tai nghe True Wireless Pulse Pro.",
            relatedUser: "anpham",
        },
        {
            id: "demo-n2",
            user: "anpham",
            type: "order_status",
            title: "Đơn đã giao",
            message: "Đơn SOCO-240812-1001 đã hoàn tất. Viết đánh giá giúp shop nhé.",
        },
        {
            id: "demo-n3",
            user: "linhnha",
            type: "post_comment",
            title: "Bình luận mới",
            message: "Nguyễn Đăng Khoa hỏi về độ sáng đèn bàn.",
            relatedUser: "khoanguyen",
            relatedPost: "demo-post-02",
        },
        {
            id: "demo-n4",
            user: "thuvo",
            type: "new_follower",
            title: "Người theo dõi mới",
            message: "Phạm Hoàng An đã theo dõi bạn.",
            relatedUser: "anpham",
        },
        {
            id: "demo-n5",
            user: "hungstreet",
            type: "new_message",
            title: "Tin nhắn size áo",
            message: "Lê Phương Nam hỏi size boxy wash xám.",
            relatedUser: "namle",
        },
        {
            id: "demo-n6",
            user: "ngocskin",
            type: "post_like",
            title: "Lượt thích",
            message: "Võ Ngọc Thư thích bài routine sáng của bạn.",
            relatedUser: "thuvo",
            relatedPost: "demo-post-03",
        },
    ];
    for (const n of notifs) {
        await prisma.notification.upsert({
            where: { id: n.id },
            update: {
                userId: (sellers[n.user] || buyers[n.user]).id,
                type: n.type,
                title: n.title,
                message: n.message,
                relatedUserId: n.relatedUser
                    ? (buyers[n.relatedUser] || sellers[n.relatedUser]).id
                    : null,
                relatedPostId: n.relatedPost || null,
                isRead: false,
            },
            create: {
                id: n.id,
                userId: (sellers[n.user] || buyers[n.user]).id,
                type: n.type,
                title: n.title,
                message: n.message,
                relatedUserId: n.relatedUser
                    ? (buyers[n.relatedUser] || sellers[n.relatedUser]).id
                    : null,
                relatedPostId: n.relatedPost || null,
            },
        });
    }

    await prisma.savedItem.upsert({
        where: {
            userId_itemType_targetId: {
                userId: buyers.thuvo.id,
                itemType: "PRODUCT",
                targetId: products["serum-niacinamide-10-30ml"].id,
            },
        },
        update: {},
        create: {
            userId: buyers.thuvo.id,
            itemType: "PRODUCT",
            targetId: products["serum-niacinamide-10-30ml"].id,
        },
    });
    await prisma.savedItem.upsert({
        where: {
            userId_itemType_targetId: {
                userId: buyers.khoanguyen.id,
                itemType: "POST",
                targetId: posts["demo-post-02"].id,
            },
        },
        update: {},
        create: {
            userId: buyers.khoanguyen.id,
            itemType: "POST",
            targetId: posts["demo-post-02"].id,
        },
    });

    const searchQueries = [
        ["anpham", "tai nghe chống ồn"],
        ["thuvo", "niacinamide da dầu"],
        ["khoanguyen", "đèn bàn gốm"],
        ["hatran", "chảo chống dính bếp từ"],
        ["namle", "áo boxy 280gsm"],
        ["mybui", "bình gốm cắm hoa"],
        ["tuando", "sạc gan 65w"],
        ["quynhho", "chống nắng kiềm dầu"],
    ];
    for (const [username, query] of searchQueries) {
        const id = `demo-search-${username}`;
        await prisma.userSearchEvent.upsert({
            where: { id },
            update: {
                userId: buyers[username].id,
                query,
                normalizedQuery: query.toLowerCase(),
            },
            create: {
                id,
                userId: buyers[username].id,
                query,
                normalizedQuery: query.toLowerCase(),
                sessionId: `demo-${username}`,
            },
        });
    }

    const viewPairs = [
        ["anpham", "tai-nghe-true-wireless-pulse-pro"],
        ["anpham", "sac-nhanh-gan-65w"],
        ["thuvo", "serum-niacinamide-10-30ml"],
        ["thuvo", "kem-chong-nang-spf50"],
        ["khoanguyen", "den-ban-gom-su-vintage"],
        ["namle", "ao-thun-boxy-wash-xam"],
        ["hatran", "chao-chong-dinh-28cm"],
        ["tuando", "op-lungs-magsafe-trong-suot"],
    ];
    for (const [username, slug] of viewPairs) {
        const id = `demo-view-${username}-${slug.slice(0, 12)}`;
        await prisma.productView.upsert({
            where: { id },
            update: {
                productId: products[slug].id,
                userId: buyers[username].id,
            },
            create: {
                id,
                productId: products[slug].id,
                userId: buyers[username].id,
                sessionId: `demo-${username}`,
                userAgent: "Mozilla/5.0 SoCoDemo",
            },
        });
    }

    const coViews = [
        ["tai-nghe-true-wireless-pulse-pro", "sac-nhanh-gan-65w", 12.4],
        ["sac-nhanh-gan-65w", "op-lungs-magsafe-trong-suot", 9.1],
        ["serum-niacinamide-10-30ml", "kem-chong-nang-spf50", 14.8],
        ["kem-chong-nang-spf50", "toner-rau-ma-200ml", 8.6],
        ["den-ban-gom-su-vintage", "binh-gom-cam-hoa-cung", 11.2],
        ["ao-thun-boxy-wash-xam", "quan-cargo-kaki-ong-rong", 10.5],
        ["chao-chong-dinh-28cm", "may-xay-sinh-to-mini", 7.3],
    ];
    for (const [source, target, score] of coViews) {
        await prisma.productCoView.upsert({
            where: {
                sourceProductId_targetProductId: {
                    sourceProductId: products[source].id,
                    targetProductId: products[target].id,
                },
            },
            update: { score, lastViewedAt: daysAgo(1) },
            create: {
                sourceProductId: products[source].id,
                targetProductId: products[target].id,
                score,
                lastViewedAt: daysAgo(1),
            },
        });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const stats = {
        linhnha: { sales: "2450000", orders: 6, profit: "680000", views: 2150, followers: 4 },
        minhgadget: { sales: "5120000", orders: 14, profit: "1280000", views: 7310, followers: 5 },
        ngocskin: { sales: "1980000", orders: 9, profit: "720000", views: 4498, followers: 4 },
        hungstreet: { sales: "1670000", orders: 7, profit: "510000", views: 2930, followers: 3 },
        maibep: { sales: "1320000", orders: 5, profit: "390000", views: 1730, followers: 2 },
    };
    for (const [username, s] of Object.entries(stats)) {
        await prisma.sellerStats.upsert({
            where: { sellerId_date: { sellerId: sellers[username].id, date: today } },
            update: {
                totalSales: s.sales,
                totalOrders: s.orders,
                totalRevenue: s.sales,
                totalProfit: s.profit,
                totalProducts: 3,
                totalViews: s.views,
                newFollowers: s.followers,
                totalLikes: 12,
                totalComments: 6,
            },
            create: {
                sellerId: sellers[username].id,
                date: today,
                totalSales: s.sales,
                totalOrders: s.orders,
                totalRevenue: s.sales,
                totalProfit: s.profit,
                totalProducts: 3,
                totalViews: s.views,
                newFollowers: s.followers,
                totalLikes: 12,
                totalComments: 6,
            },
        });
    }

    await prisma.aiContentHistory.upsert({
        where: { id: "demo-ai-1" },
        update: {
            userId: sellers.minhgadget.id,
            prompt: "Caption bán tai nghe chống ồn cho dân văn phòng Sài Gòn",
            contentType: "POST_CAPTION",
            generatedContent:
                "Họp 3 tiếng không đau tai. Pulse Pro ANC cắt quạt trần phòng trọ — test thật, không copy brochure.",
            sourceIdea: "Tai nghe họp online",
            productTitle: products["tai-nghe-true-wireless-pulse-pro"].title,
        },
        create: {
            id: "demo-ai-1",
            userId: sellers.minhgadget.id,
            prompt: "Caption bán tai nghe chống ồn cho dân văn phòng Sài Gòn",
            contentType: "POST_CAPTION",
            generatedContent:
                "Họp 3 tiếng không đau tai. Pulse Pro ANC cắt quạt trần phòng trọ — test thật, không copy brochure.",
            sourceIdea: "Tai nghe họp online",
            productTitle: products["tai-nghe-true-wireless-pulse-pro"].title,
        },
    });

    const productCount = await prisma.product.count({
        where: { slug: { in: productDefs.map((p) => p.slug) } },
    });
    const postCount = await prisma.post.count({
        where: { id: { startsWith: "demo-post-" } },
    });
    if (productCount < 14 || postCount < 16) {
        throw new Error(
            `Demo seed incomplete: products=${productCount} posts=${postCount}`,
        );
    }

    console.log(
        `Seeded demo marketplace: ${Object.keys(sellers).length} shops, ${Object.keys(buyers).length} buyers, ${productCount} products, ${postCount} posts.`,
    );
    console.log(
        "Demo login (password = SEED_QA_USER_PASSWORD, default QaUser@123): linh.nha@soco.vn / minh.gadget@soco.vn / ngoc.skin@soco.vn / an.pham@soco.vn / thu.vo@soco.vn",
    );
}
