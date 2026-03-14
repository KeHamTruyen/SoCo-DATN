import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const IMG = {
  shirt: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200',
  sneaker: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200',
  watch: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1200',
  backpack: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200',
  earbuds: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1200',
  laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200',
  avatar1: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
  avatar2: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  avatar3: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  avatar4: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
};

function money(n) {
  return Number(n.toFixed(2));
}

function timelineForStatus(status) {
  const now = new Date();
  const minus = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  if (status === 'PENDING') return { createdAt: minus(2) };
  if (status === 'CONFIRMED') return { createdAt: minus(4), confirmedAt: minus(3) };
  if (status === 'PROCESSING') return { createdAt: minus(5), confirmedAt: minus(4) };
  if (status === 'SHIPPING') return { createdAt: minus(6), confirmedAt: minus(5), shippedAt: minus(2) };
  if (status === 'DELIVERED') {
    return { createdAt: minus(8), confirmedAt: minus(7), shippedAt: minus(5), deliveredAt: minus(1) };
  }
  if (status === 'COMPLETED') {
    return { createdAt: minus(12), confirmedAt: minus(11), shippedAt: minus(9), deliveredAt: minus(7) };
  }
  if (status === 'CANCELLED') {
    return { createdAt: minus(3), confirmedAt: minus(2), cancelledAt: minus(1) };
  }
  if (status === 'REFUNDED') {
    return { createdAt: minus(16), confirmedAt: minus(15), shippedAt: minus(13), deliveredAt: minus(11) };
  }
  return { createdAt: minus(1) };
}

async function upsertCategory({ name, slug, displayOrder }) {
  return prisma.category.upsert({
    where: { slug },
    update: { name, displayOrder, isActive: true },
    create: { name, slug, displayOrder, isActive: true }
  });
}

async function upsertUser(data) {
  return prisma.user.upsert({
    where: { email: data.email },
    update: {
      username: data.username,
      fullName: data.fullName,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      role: data.role,
      isVerified: true,
      isActive: true,
      bio: data.bio,
      address: data.address
    },
    create: {
      email: data.email,
      username: data.username,
      passwordHash: data.passwordHash,
      fullName: data.fullName,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      role: data.role,
      isVerified: true,
      isActive: true,
      bio: data.bio,
      address: data.address
    }
  });
}

async function upsertProduct({ sellerId, categoryId, title, slug, price, stockQuantity, imageUrl, options }) {
  const existed = await prisma.product.findUnique({ where: { slug } });

  const baseData = {
    sellerId,
    categoryId,
    title,
    slug,
    description: `${title} - dữ liệu seed cho Module 3`,
    price,
    compareAtPrice: money(price * 1.15),
    sku: `SKU-${slug.toUpperCase()}`,
    stockQuantity,
    lowStockThreshold: 5,
    trackInventory: true,
    status: 'ACTIVE',
    metaKeywords: ['module3', 'seed', title.toLowerCase()],
    salesCount: Math.floor(Math.random() * 200),
    likesCount: Math.floor(Math.random() * 800),
    commentsCount: Math.floor(Math.random() * 200)
  };

  if (!existed) {
    return prisma.product.create({
      data: {
        ...baseData,
        publishedAt: new Date(),
        images: {
          create: [
            { imageUrl, altText: title, displayOrder: 0, isPrimary: true }
          ]
        },
        variants: {
          create: [
            {
              variantName: 'Mau sac',
              sku: `VAR-${slug.toUpperCase()}-1`,
              stockQuantity: Math.max(5, Math.floor(stockQuantity / 2)),
              options: options || { option1: 'Den', option2: 'Trang' }
            }
          ]
        }
      },
      include: { images: true, variants: true }
    });
  }

  await prisma.product.update({
    where: { id: existed.id },
    data: {
      ...baseData,
      publishedAt: existed.publishedAt || new Date(),
      images: { deleteMany: {} },
      variants: { deleteMany: {} }
    }
  });

  return prisma.product.update({
    where: { id: existed.id },
    data: {
      images: {
        create: [{ imageUrl, altText: title, displayOrder: 0, isPrimary: true }]
      },
      variants: {
        create: [
          {
            variantName: 'Mau sac',
            sku: `VAR-${slug.toUpperCase()}-1`,
            stockQuantity: Math.max(5, Math.floor(stockQuantity / 2)),
            options: options || { option1: 'Den', option2: 'Trang' }
          }
        ]
      }
    },
    include: { images: true, variants: true }
  });
}

async function upsertOrder({ orderNumber, buyerId, status, paymentStatus = 'PAID', itemInputs }) {
  const existed = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true }
  });

  const subtotal = itemInputs.reduce((s, i) => s + i.totalPrice, 0);
  const shippingFee = 30000;
  const total = subtotal + shippingFee;
  const timeline = timelineForStatus(status);

  const baseData = {
    buyerId,
    subtotal: money(subtotal),
    shippingFee: money(shippingFee),
    tax: 0,
    discount: 0,
    total: money(total),
    shippingName: 'Nguyen Van Buyer',
    shippingPhone: '0901234567',
    shippingAddress: '123 Nguyen Trai',
    shippingCity: 'Ha Noi',
    shippingDistrict: 'Thanh Xuan',
    shippingWard: 'Thuong Dinh',
    shippingNote: 'Goi truoc khi giao',
    paymentMethod: 'COD',
    paymentStatus,
    paidAt: paymentStatus === 'PAID' ? new Date() : null,
    status,
    trackingNumber: ['SHIPPING', 'DELIVERED', 'COMPLETED', 'REFUNDED'].includes(status)
      ? `TRACK-${orderNumber}`
      : null,
    carrier: ['SHIPPING', 'DELIVERED', 'COMPLETED', 'REFUNDED'].includes(status)
      ? 'GHN'
      : null,
    confirmedAt: timeline.confirmedAt || null,
    shippedAt: timeline.shippedAt || null,
    deliveredAt: timeline.deliveredAt || null,
    cancelledAt: timeline.cancelledAt || null,
    cancellationReason: status === 'CANCELLED' ? 'Buyer changed mind' : null,
    createdAt: timeline.createdAt
  };

  let order;
  if (!existed) {
    order = await prisma.order.create({
      data: {
        orderNumber,
        ...baseData,
        items: {
          create: itemInputs.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            sellerId: item.sellerId,
            productName: item.productName,
            productImageUrl: item.productImageUrl,
            variantInfo: item.variantInfo || null,
            quantity: item.quantity,
            unitPrice: money(item.unitPrice),
            totalPrice: money(item.totalPrice),
            status
          }))
        }
      },
      include: { items: true }
    });
  } else {
    await prisma.orderItem.deleteMany({ where: { orderId: existed.id } });
    order = await prisma.order.update({
      where: { id: existed.id },
      data: {
        ...baseData,
        items: {
          create: itemInputs.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            sellerId: item.sellerId,
            productName: item.productName,
            productImageUrl: item.productImageUrl,
            variantInfo: item.variantInfo || null,
            quantity: item.quantity,
            unitPrice: money(item.unitPrice),
            totalPrice: money(item.totalPrice),
            status
          }))
        }
      },
      include: { items: true }
    });
  }

  return order;
}

async function upsertReview({ productId, orderItemId, userId, rating, title, content, sellerResponse }) {
  if (!orderItemId) {
    const existed = await prisma.review.findFirst({ where: { productId, userId } });
    if (existed) {
      return prisma.review.update({
        where: { id: existed.id },
        data: {
          rating,
          title,
          content,
          images: [],
          isVerifiedPurchase: false,
          sellerResponse: sellerResponse || null,
          sellerResponseAt: sellerResponse ? new Date() : null
        }
      });
    }
  }

  if (orderItemId) {
    const existedByOrderItem = await prisma.review.findUnique({ where: { orderItemId } });
    if (existedByOrderItem) {
      return prisma.review.update({
        where: { id: existedByOrderItem.id },
        data: {
          rating,
          title,
          content,
          images: [],
          isVerifiedPurchase: true,
          sellerResponse: sellerResponse || null,
          sellerResponseAt: sellerResponse ? new Date() : null
        }
      });
    }
  }

  return prisma.review.create({
    data: {
      productId,
      orderItemId: orderItemId || null,
      userId,
      rating,
      title,
      content,
      images: [],
      isVerifiedPurchase: Boolean(orderItemId),
      sellerResponse: sellerResponse || null,
      sellerResponseAt: sellerResponse ? new Date() : null
    }
  });
}

async function seedModule3() {
  console.log('Start seeding Module 3 data...');

  const passwordHash = await bcrypt.hash('12345678', 10);

  const [catFashion, catTech, catAccessory] = await Promise.all([
    upsertCategory({ name: 'Thoi trang', slug: 'thoi-trang', displayOrder: 1 }),
    upsertCategory({ name: 'Dien tu', slug: 'dien-tu', displayOrder: 2 }),
    upsertCategory({ name: 'Phu kien', slug: 'phu-kien', displayOrder: 3 })
  ]);

  const [sellerA, sellerB, buyerA, buyerB] = await Promise.all([
    upsertUser({
      email: 'seller.alpha@module3.local',
      username: 'seller_alpha',
      fullName: 'Seller Alpha',
      phone: '0900000001',
      avatarUrl: IMG.avatar1,
      role: 'SELLER',
      passwordHash,
      bio: 'Ban do thoi trang chat luong',
      address: 'Ha Noi'
    }),
    upsertUser({
      email: 'seller.beta@module3.local',
      username: 'seller_beta',
      fullName: 'Seller Beta',
      phone: '0900000002',
      avatarUrl: IMG.avatar2,
      role: 'SELLER',
      passwordHash,
      bio: 'Chuyen thiet bi dien tu',
      address: 'TP HCM'
    }),
    upsertUser({
      email: 'buyer.one@module3.local',
      username: 'buyer_one',
      fullName: 'Buyer One',
      phone: '0900000003',
      avatarUrl: IMG.avatar3,
      role: 'BUYER',
      passwordHash,
      bio: 'Nguoi mua thuong xuyen',
      address: 'Da Nang'
    }),
    upsertUser({
      email: 'buyer.two@module3.local',
      username: 'buyer_two',
      fullName: 'Buyer Two',
      phone: '0900000004',
      avatarUrl: IMG.avatar4,
      role: 'BUYER',
      passwordHash,
      bio: 'Yeu thich shopping online',
      address: 'Can Tho'
    })
  ]);

  const [p1, p2, p3, p4, p5, p6] = await Promise.all([
    upsertProduct({
      sellerId: sellerA.id,
      categoryId: catFashion.id,
      title: 'Ao thun unisex premium',
      slug: 'module3-ao-thun-unisex-premium',
      price: 249000,
      stockQuantity: 120,
      imageUrl: IMG.shirt,
      options: { option1: 'Den', option2: 'Trang', option3: 'Xam' }
    }),
    upsertProduct({
      sellerId: sellerA.id,
      categoryId: catAccessory.id,
      title: 'Balo du lich chong nuoc',
      slug: 'module3-balo-du-lich-chong-nuoc',
      price: 590000,
      stockQuantity: 80,
      imageUrl: IMG.backpack,
      options: { option1: '30L', option2: '40L' }
    }),
    upsertProduct({
      sellerId: sellerA.id,
      categoryId: catFashion.id,
      title: 'Giay sneaker sport X',
      slug: 'module3-giay-sneaker-sport-x',
      price: 890000,
      stockQuantity: 60,
      imageUrl: IMG.sneaker,
      options: { option1: '39', option2: '40', option3: '41' }
    }),
    upsertProduct({
      sellerId: sellerB.id,
      categoryId: catTech.id,
      title: 'Tai nghe true wireless S1',
      slug: 'module3-tai-nghe-true-wireless-s1',
      price: 1290000,
      stockQuantity: 45,
      imageUrl: IMG.earbuds,
      options: { option1: 'Den', option2: 'Xanh navy' }
    }),
    upsertProduct({
      sellerId: sellerB.id,
      categoryId: catAccessory.id,
      title: 'Dong ho smart watch V2',
      slug: 'module3-dong-ho-smart-watch-v2',
      price: 2190000,
      stockQuantity: 38,
      imageUrl: IMG.watch,
      options: { option1: '42mm', option2: '46mm' }
    }),
    upsertProduct({
      sellerId: sellerB.id,
      categoryId: catTech.id,
      title: 'Laptop slimbook 14',
      slug: 'module3-laptop-slimbook-14',
      price: 18990000,
      stockQuantity: 20,
      imageUrl: IMG.laptop,
      options: { option1: '8GB/256GB', option2: '16GB/512GB' }
    })
  ]);

  const variantMap = {};
  [p1, p2, p3, p4, p5, p6].forEach((p) => {
    variantMap[p.id] = p.variants[0]?.id || null;
  });

  const orders = [];
  orders.push(
    await upsertOrder({
      orderNumber: 'M3-ORD-0001',
      buyerId: buyerA.id,
      status: 'PENDING',
      itemInputs: [
        {
          productId: p1.id,
          variantId: variantMap[p1.id],
          sellerId: sellerA.id,
          productName: p1.title,
          productImageUrl: p1.images[0]?.imageUrl,
          variantInfo: { size: 'M', color: 'Den' },
          quantity: 2,
          unitPrice: 249000,
          totalPrice: 498000
        }
      ]
    })
  );

  orders.push(
    await upsertOrder({
      orderNumber: 'M3-ORD-0002',
      buyerId: buyerA.id,
      status: 'SHIPPING',
      itemInputs: [
        {
          productId: p4.id,
          variantId: variantMap[p4.id],
          sellerId: sellerB.id,
          productName: p4.title,
          productImageUrl: p4.images[0]?.imageUrl,
          variantInfo: { color: 'Den' },
          quantity: 1,
          unitPrice: 1290000,
          totalPrice: 1290000
        },
        {
          productId: p2.id,
          variantId: variantMap[p2.id],
          sellerId: sellerA.id,
          productName: p2.title,
          productImageUrl: p2.images[0]?.imageUrl,
          variantInfo: { size: '40L' },
          quantity: 1,
          unitPrice: 590000,
          totalPrice: 590000
        }
      ]
    })
  );

  orders.push(
    await upsertOrder({
      orderNumber: 'M3-ORD-0003',
      buyerId: buyerB.id,
      status: 'COMPLETED',
      itemInputs: [
        {
          productId: p3.id,
          variantId: variantMap[p3.id],
          sellerId: sellerA.id,
          productName: p3.title,
          productImageUrl: p3.images[0]?.imageUrl,
          variantInfo: { size: '41' },
          quantity: 1,
          unitPrice: 890000,
          totalPrice: 890000
        },
        {
          productId: p5.id,
          variantId: variantMap[p5.id],
          sellerId: sellerB.id,
          productName: p5.title,
          productImageUrl: p5.images[0]?.imageUrl,
          variantInfo: { size: '46mm' },
          quantity: 1,
          unitPrice: 2190000,
          totalPrice: 2190000
        }
      ]
    })
  );

  orders.push(
    await upsertOrder({
      orderNumber: 'M3-ORD-0004',
      buyerId: buyerB.id,
      status: 'REFUNDED',
      itemInputs: [
        {
          productId: p1.id,
          variantId: variantMap[p1.id],
          sellerId: sellerA.id,
          productName: p1.title,
          productImageUrl: p1.images[0]?.imageUrl,
          variantInfo: { size: 'L', color: 'Trang' },
          quantity: 1,
          unitPrice: 249000,
          totalPrice: 249000
        }
      ]
    })
  );

  orders.push(
    await upsertOrder({
      orderNumber: 'M3-ORD-0005',
      buyerId: buyerA.id,
      status: 'CANCELLED',
      paymentStatus: 'FAILED',
      itemInputs: [
        {
          productId: p6.id,
          variantId: variantMap[p6.id],
          sellerId: sellerB.id,
          productName: p6.title,
          productImageUrl: p6.images[0]?.imageUrl,
          variantInfo: { spec: '8GB/256GB' },
          quantity: 1,
          unitPrice: 18990000,
          totalPrice: 18990000
        }
      ]
    })
  );

  const orderCompleted = orders.find((o) => o.orderNumber === 'M3-ORD-0003');
  const completedItem1 = orderCompleted?.items?.[0];
  const completedItem2 = orderCompleted?.items?.[1];

  if (completedItem1) {
    await upsertReview({
      productId: completedItem1.productId,
      orderItemId: completedItem1.id,
      userId: buyerB.id,
      rating: 5,
      title: 'Rat hai long',
      content: 'Form dep, dung mo ta, giao hang nhanh.',
      sellerResponse: 'Cam on ban da danh gia tich cuc!'
    });
  }

  if (completedItem2) {
    await upsertReview({
      productId: completedItem2.productId,
      orderItemId: completedItem2.id,
      userId: buyerB.id,
      rating: 4,
      title: 'Tot trong tam gia',
      content: 'San pham on, pin dung duoc lau, se ung ho tiep.',
      sellerResponse: null
    });
  }

  const existingCart = await prisma.cart.findFirst({ where: { userId: buyerA.id } });
  const buyerACart = existingCart
    ? existingCart
    : await prisma.cart.create({
        data: {
          userId: buyerA.id
        }
      });

  await prisma.cartItem.deleteMany({ where: { cartId: buyerACart.id } });
  await prisma.cartItem.createMany({
    data: [
      {
        cartId: buyerACart.id,
        productId: p4.id,
        variantId: variantMap[p4.id],
        quantity: 1,
        price: 1290000
      },
      {
        cartId: buyerACart.id,
        productId: p2.id,
        variantId: variantMap[p2.id],
        quantity: 2,
        price: 590000
      }
    ]
  });

  console.log('Module 3 seed completed.');
  console.log('Users for login test:');
  console.log('- seller_alpha / 12345678');
  console.log('- seller_beta / 12345678');
  console.log('- buyer_one / 12345678');
  console.log('- buyer_two / 12345678');
}

seedModule3()
  .catch((error) => {
    console.error('Module 3 seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
