import test from 'node:test';
import assert from 'node:assert/strict';

import prisma from '../src/config/database.js';
import { createOrder, cancelOrder, updateOrderStatus, confirmPayment } from '../src/services/order.service.js';
import { addToCart, getCart, updateCartItem } from '../src/services/cart.service.js';
import messageService from '../src/services/message.service.js';
import productService from '../src/services/product.service.js';
import { createReport, updateReportStatus } from '../src/services/report.service.js';
import userService from '../src/services/user.service.js';

const uniq = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createUser = async ({ role = 'BUYER', isActive = true } = {}) => {
  const token = uniq(role.toLowerCase());
  return prisma.user.create({
    data: {
      email: `${token}@example.com`,
      username: token,
      passwordHash: 'test-hash',
      fullName: `${role} ${token}`,
      role,
      isActive
    }
  });
};

const createOrderFixture = async () => {
  const buyer = await createUser({ role: 'BUYER' });
  const seller = await createUser({ role: 'SELLER' });

  const product = await prisma.product.create({
    data: {
      sellerId: seller.id,
      title: uniq('product-title'),
      slug: uniq('product-slug'),
      description: 'integration product',
      price: 100000,
      stockQuantity: 10,
      trackInventory: true,
      status: 'ACTIVE',
      metaKeywords: []
    }
  });

  const cart = await prisma.cart.create({
    data: {
      userId: buyer.id
    }
  });

  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: product.id,
      quantity: 2,
      price: 100000
    }
  });

  return { buyer, seller, product, cart };
};

const cleanupOrderFixture = async ({ buyerId, sellerId, productId, cartId, orderId = null }) => {
  await prisma.notification.deleteMany({ where: { userId: { in: [buyerId, sellerId] } } });

  if (orderId) {
    await prisma.orderItem.deleteMany({ where: { orderId } });
    await prisma.order.deleteMany({ where: { id: orderId } });
  }

  await prisma.cartItem.deleteMany({ where: { cartId } });
  await prisma.cart.deleteMany({ where: { id: cartId } });
  await prisma.product.deleteMany({ where: { id: productId } });
  await prisma.user.deleteMany({ where: { id: { in: [buyerId, sellerId] } } });
};

test('integration: createOrder triggers new-order notification for seller', async () => {
  const fixture = await createOrderFixture();
  let createdOrderId = null;

  try {
    const order = await createOrder(fixture.buyer.id, {
      shippingName: 'Buyer Integration',
      shippingPhone: '0900000000',
      shippingAddress: '123 Test Street',
      shippingCity: 'HCM',
      shippingDistrict: 'District 1',
      shippingWard: 'Ward 1',
      paymentMethod: 'COD'
    });

    createdOrderId = order.id;
    assert.equal(order.buyerId, fixture.buyer.id);

    const sellerNotif = await prisma.notification.findFirst({
      where: {
        userId: fixture.seller.id,
        type: 'ORDER',
        relatedOrderId: order.id
      },
      orderBy: { createdAt: 'desc' }
    });

    assert.ok(sellerNotif, 'Expected seller notification after createOrder');
    assert.match(sellerNotif.title, /Đơn hàng mới/i);
  } finally {
    await cleanupOrderFixture({
      buyerId: fixture.buyer.id,
      sellerId: fixture.seller.id,
      productId: fixture.product.id,
      cartId: fixture.cart.id,
      orderId: createdOrderId
    });
  }
});

test('integration: cancelOrder triggers cancellation notification for seller', async () => {
  const fixture = await createOrderFixture();
  let createdOrderId = null;

  try {
    const order = await createOrder(fixture.buyer.id, {
      shippingName: 'Buyer Integration',
      shippingPhone: '0900000000',
      shippingAddress: '123 Test Street',
      shippingCity: 'HCM',
      shippingDistrict: 'District 1',
      shippingWard: 'Ward 1',
      paymentMethod: 'COD'
    });

    createdOrderId = order.id;

    const cancelled = await cancelOrder(order.id, fixture.buyer.id, 'Changed mind');
    assert.equal(cancelled.status, 'CANCELLED');

    const sellerNotif = await prisma.notification.findFirst({
      where: {
        userId: fixture.seller.id,
        type: 'ORDER',
        relatedOrderId: order.id
      },
      orderBy: { createdAt: 'desc' }
    });

    assert.ok(sellerNotif, 'Expected seller notification after cancelOrder');
    assert.match(sellerNotif.message, /hủy đơn hàng|bị hủy/i);
  } finally {
    await cleanupOrderFixture({
      buyerId: fixture.buyer.id,
      sellerId: fixture.seller.id,
      productId: fixture.product.id,
      cartId: fixture.cart.id,
      orderId: createdOrderId
    });
  }
});

test('integration: buyer cannot confirm their own order via updateOrderStatus', async () => {
  const fixture = await createOrderFixture();
  let createdOrderId = null;

  try {
    const order = await createOrder(fixture.buyer.id, {
      shippingName: 'Buyer Integration',
      shippingPhone: '0900000000',
      shippingAddress: '123 Test Street',
      shippingCity: 'HCM',
      shippingDistrict: 'District 1',
      shippingWard: 'Ward 1',
      paymentMethod: 'COD'
    });

    createdOrderId = order.id;

    await assert.rejects(
      () => updateOrderStatus(order.id, fixture.buyer.id, 'CONFIRMED'),
      /Only seller can update order status/
    );
  } finally {
    await cleanupOrderFixture({
      buyerId: fixture.buyer.id,
      sellerId: fixture.seller.id,
      productId: fixture.product.id,
      cartId: fixture.cart.id,
      orderId: createdOrderId
    });
  }
});

test('integration: seller cancellation via updateOrderStatus restores stock', async () => {
  const fixture = await createOrderFixture();
  let createdOrderId = null;

  try {
    const order = await createOrder(fixture.buyer.id, {
      shippingName: 'Buyer Integration',
      shippingPhone: '0900000000',
      shippingAddress: '123 Test Street',
      shippingCity: 'HCM',
      shippingDistrict: 'District 1',
      shippingWard: 'Ward 1',
      paymentMethod: 'COD'
    });

    createdOrderId = order.id;

    const afterOrderProduct = await prisma.product.findUnique({
      where: { id: fixture.product.id },
      select: { stockQuantity: true }
    });
    assert.equal(afterOrderProduct.stockQuantity, 8);

    const cancelled = await updateOrderStatus(order.id, fixture.seller.id, 'CANCELLED');
    assert.equal(cancelled.status, 'CANCELLED');

    const restoredProduct = await prisma.product.findUnique({
      where: { id: fixture.product.id },
      select: { stockQuantity: true }
    });
    assert.equal(restoredProduct.stockQuantity, 10);
  } finally {
    await cleanupOrderFixture({
      buyerId: fixture.buyer.id,
      sellerId: fixture.seller.id,
      productId: fixture.product.id,
      cartId: fixture.cart.id,
      orderId: createdOrderId
    });
  }
});

test('integration: createOrder rejects cart with multiple sellers', async () => {
  const buyer = await createUser({ role: 'BUYER' });
  const sellerA = await createUser({ role: 'SELLER' });
  const sellerB = await createUser({ role: 'SELLER' });

  const productA = await prisma.product.create({
    data: {
      sellerId: sellerA.id,
      title: uniq('product-a-title'),
      slug: uniq('product-a-slug'),
      description: 'integration product A',
      price: 100000,
      stockQuantity: 10,
      trackInventory: true,
      status: 'ACTIVE',
      metaKeywords: []
    }
  });

  const productB = await prisma.product.create({
    data: {
      sellerId: sellerB.id,
      title: uniq('product-b-title'),
      slug: uniq('product-b-slug'),
      description: 'integration product B',
      price: 120000,
      stockQuantity: 10,
      trackInventory: true,
      status: 'ACTIVE',
      metaKeywords: []
    }
  });

  const cart = await prisma.cart.create({
    data: {
      userId: buyer.id
    }
  });

  await prisma.cartItem.createMany({
    data: [
      {
        cartId: cart.id,
        productId: productA.id,
        quantity: 1,
        price: 100000
      },
      {
        cartId: cart.id,
        productId: productB.id,
        quantity: 1,
        price: 120000
      }
    ]
  });

  try {
    await assert.rejects(
      () => createOrder(buyer.id, {
        shippingName: 'Buyer Integration',
        shippingPhone: '0900000000',
        shippingAddress: '123 Test Street',
        shippingCity: 'HCM',
        shippingDistrict: 'District 1',
        shippingWard: 'Ward 1',
        paymentMethod: 'COD'
      }),
      /Cart contains products from multiple sellers/
    );
  } finally {
    await prisma.notification.deleteMany({ where: { userId: { in: [buyer.id, sellerA.id, sellerB.id] } } });
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.deleteMany({ where: { id: cart.id } });
    await prisma.product.deleteMany({ where: { id: { in: [productA.id, productB.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [buyer.id, sellerA.id, sellerB.id] } } });
  }
});

test('integration: confirmPayment keeps order pending for seller review', async () => {
  const fixture = await createOrderFixture();
  let createdOrderId = null;

  try {
    const order = await createOrder(fixture.buyer.id, {
      shippingName: 'Buyer Integration',
      shippingPhone: '0900000000',
      shippingAddress: '123 Test Street',
      shippingCity: 'HCM',
      shippingDistrict: 'District 1',
      shippingWard: 'Ward 1',
      paymentMethod: 'VNPAY'
    });

    createdOrderId = order.id;

    const paidOrder = await confirmPayment(order.id);
    assert.equal(paidOrder.paymentStatus, 'PAID');
    assert.equal(paidOrder.status, 'PENDING');
  } finally {
    await cleanupOrderFixture({
      buyerId: fixture.buyer.id,
      sellerId: fixture.seller.id,
      productId: fixture.product.id,
      cartId: fixture.cart.id,
      orderId: createdOrderId
    });
  }
});

test('integration: unverified seller cannot create product', async () => {
  const seller = await createUser({ role: 'SELLER', isActive: true });

  try {
    await assert.rejects(
      () => productService.createProduct(seller.id, {
        title: uniq('unverified-product-title'),
        description: 'should fail',
        price: 100000,
        stockQuantity: 10,
        status: 'DRAFT',
        metaKeywords: []
      }),
      /Seller verification approval is required to create products/
    );
  } finally {
    await prisma.product.deleteMany({ where: { sellerId: seller.id } });
    await prisma.sellerVerification.deleteMany({ where: { userId: seller.id } });
    await prisma.user.deleteMany({ where: { id: seller.id } });
  }
});

test('integration: approved seller can create product', async () => {
  const seller = await createUser({ role: 'SELLER', isActive: true });
  let productId = null;

  try {
    await prisma.user.update({
      where: { id: seller.id },
      data: { isVerified: true }
    });

    await prisma.sellerVerification.create({
      data: {
        userId: seller.id,
        status: 'APPROVED',
        step1Completed: true,
        step2Completed: true,
        step3Completed: true,
        verifiedAt: new Date()
      }
    });

    const product = await productService.createProduct(seller.id, {
      title: uniq('verified-product-title'),
      description: 'should pass',
      price: 150000,
      stockQuantity: 5,
      status: 'DRAFT',
      metaKeywords: []
    });

    productId = product.id;
    assert.equal(product.sellerId, seller.id);
    assert.equal(product.status, 'DRAFT');
  } finally {
    if (productId) {
      await prisma.product.deleteMany({ where: { id: productId } });
    }
    await prisma.sellerVerification.deleteMany({ where: { userId: seller.id } });
    await prisma.user.deleteMany({ where: { id: seller.id } });
  }
});

test('integration: updateProfile ignores role changes from profile payload', async () => {
  const buyer = await createUser({ role: 'BUYER', isActive: true });

  try {
    const updated = await userService.updateProfile(buyer.id, {
      fullName: 'Updated Buyer',
      role: 'SELLER'
    });

    assert.equal(updated.role, 'BUYER');

    const persisted = await prisma.user.findUnique({
      where: { id: buyer.id },
      select: { role: true, fullName: true }
    });

    assert.equal(persisted.role, 'BUYER');
    assert.equal(persisted.fullName, 'Updated Buyer');
  } finally {
    await prisma.user.deleteMany({ where: { id: buyer.id } });
  }
});

test('integration: cart and order keep variant price snapshot and variant stock in sync', async () => {
  const buyer = await createUser({ role: 'BUYER' });
  const seller = await createUser({ role: 'SELLER' });
  let orderId = null;

  const product = await prisma.product.create({
    data: {
      sellerId: seller.id,
      title: uniq('variant-product-title'),
      slug: uniq('variant-product-slug'),
      description: 'variant integration product',
      price: 100000,
      stockQuantity: 10,
      trackInventory: true,
      status: 'ACTIVE',
      metaKeywords: []
    }
  });

  const variant = await prisma.productVariant.create({
    data: {
      productId: product.id,
      variantName: 'Size',
      sku: uniq('variant-sku'),
      price: 150000,
      stockQuantity: 3,
      options: {
        size: 'L'
      }
    }
  });

  try {
    const cartAfterAdd = await addToCart(buyer.id, product.id, 1, { variantId: variant.id });
    assert.equal(cartAfterAdd.subtotal, 150000);
    assert.equal(Number(cartAfterAdd.items[0].price), 150000);

    await assert.rejects(
      () => updateCartItem(buyer.id, cartAfterAdd.items[0].id, 4),
      /Insufficient stock for selected variant/
    );

    await prisma.product.update({
      where: { id: product.id },
      data: { price: 200000 }
    });

    await prisma.productVariant.update({
      where: { id: variant.id },
      data: { price: 250000 }
    });

    const currentCart = await getCart(buyer.id);
    assert.equal(currentCart.subtotal, 150000);
    assert.equal(Number(currentCart.items[0].price), 150000);

    const order = await createOrder(buyer.id, {
      shippingName: 'Buyer Integration',
      shippingPhone: '0900000000',
      shippingAddress: '123 Test Street',
      shippingCity: 'HCM',
      shippingDistrict: 'District 1',
      shippingWard: 'Ward 1',
      paymentMethod: 'COD'
    });

    orderId = order.id;

    assert.equal(Number(order.subtotal), 150000);
    assert.equal(Number(order.items[0].unitPrice), 150000);

    const stockAfterOrder = await prisma.product.findUnique({
      where: { id: product.id },
      select: { stockQuantity: true }
    });
    const variantAfterOrder = await prisma.productVariant.findUnique({
      where: { id: variant.id },
      select: { stockQuantity: true }
    });

    assert.equal(stockAfterOrder.stockQuantity, 9);
    assert.equal(variantAfterOrder.stockQuantity, 2);

    await cancelOrder(order.id, buyer.id, 'Need to cancel variant order');

    const stockAfterCancel = await prisma.product.findUnique({
      where: { id: product.id },
      select: { stockQuantity: true }
    });
    const variantAfterCancel = await prisma.productVariant.findUnique({
      where: { id: variant.id },
      select: { stockQuantity: true }
    });

    assert.equal(stockAfterCancel.stockQuantity, 10);
    assert.equal(variantAfterCancel.stockQuantity, 3);
  } finally {
    await prisma.notification.deleteMany({ where: { userId: { in: [buyer.id, seller.id] } } });
    if (orderId) {
      await prisma.orderItem.deleteMany({ where: { orderId } });
      await prisma.order.deleteMany({ where: { id: orderId } });
    }
    await prisma.cartItem.deleteMany({ where: { productId: product.id } });
    await prisma.cart.deleteMany({ where: { userId: buyer.id } });
    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    await prisma.product.deleteMany({ where: { id: product.id } });
    await prisma.user.deleteMany({ where: { id: { in: [buyer.id, seller.id] } } });
  }
});

test('integration: order status update triggers buyer notification', async () => {
  const buyer = await createUser({ role: 'BUYER' });
  const seller = await createUser({ role: 'SELLER' });

  const order = await prisma.order.create({
    data: {
      orderNumber: uniq('ORD'),
      buyerId: buyer.id,
      subtotal: 100000,
      shippingFee: 30000,
      tax: 0,
      discount: 0,
      total: 130000,
      shippingName: 'Test Buyer',
      shippingPhone: '0900000000',
      shippingAddress: '123 Test Street',
      shippingCity: 'HCM',
      shippingDistrict: 'District 1',
      shippingWard: 'Ward 1',
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      status: 'PENDING'
    }
  });

  await prisma.orderItem.create({
    data: {
      orderId: order.id,
      sellerId: seller.id,
      productName: 'Integration Product',
      quantity: 1,
      unitPrice: 100000,
      totalPrice: 100000,
      status: 'pending'
    }
  });

  try {
    const updated = await updateOrderStatus(order.id, seller.id, 'CONFIRMED');
    assert.equal(updated.status, 'CONFIRMED');

    const notif = await prisma.notification.findFirst({
      where: {
        userId: buyer.id,
        type: 'ORDER',
        relatedOrderId: order.id
      },
      orderBy: { createdAt: 'desc' }
    });

    assert.ok(notif, 'Expected buyer notification after seller updates order status');
    assert.match(notif.message, /xác nhận|Cập nhật|Trạng thái/i);
  } finally {
    await prisma.notification.deleteMany({ where: { userId: { in: [buyer.id, seller.id] } } });
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
    await prisma.order.deleteMany({ where: { id: order.id } });
    await prisma.user.deleteMany({ where: { id: { in: [buyer.id, seller.id] } } });
  }
});

test('integration: sending message triggers recipient notification', async () => {
  const sender = await createUser({ role: 'BUYER' });
  const recipient = await createUser({ role: 'SELLER' });

  const conversation = await prisma.conversation.create({
    data: {
      createdBy: sender.id,
      participants: {
        create: [
          { userId: sender.id },
          { userId: recipient.id }
        ]
      }
    }
  });

  try {
    const message = await messageService.sendMessage(conversation.id, sender.id, 'hello integration', null, 'TEXT');
    assert.equal(message.conversationId, conversation.id);

    const notif = await prisma.notification.findFirst({
      where: {
        userId: recipient.id,
        type: 'MESSAGE',
        relatedUserId: sender.id
      },
      orderBy: { createdAt: 'desc' }
    });

    assert.ok(notif, 'Expected recipient notification when new message arrives');
    assert.match(notif.actionUrl || '', /conversation=/);
  } finally {
    await prisma.notification.deleteMany({ where: { userId: { in: [sender.id, recipient.id] } } });
    await prisma.message.deleteMany({ where: { conversationId: conversation.id } });
    await prisma.conversationParticipant.deleteMany({ where: { conversationId: conversation.id } });
    await prisma.conversation.deleteMany({ where: { id: conversation.id } });
    await prisma.user.deleteMany({ where: { id: { in: [sender.id, recipient.id] } } });
  }
});

test('integration: report create/update triggers admin and reporter notifications', async () => {
  const reporter = await createUser({ role: 'BUYER' });
  const targetUser = await createUser({ role: 'SELLER' });
  const admin = await createUser({ role: 'ADMIN' });

  let reportId = null;

  try {
    const report = await createReport(reporter.id, {
      targetType: 'USER',
      targetId: targetUser.id,
      reason: 'SPAM',
      description: 'integration test report'
    });

    reportId = report.id;

    const adminNotif = await prisma.notification.findFirst({
      where: {
        userId: admin.id,
        type: 'REPORT'
      },
      orderBy: { createdAt: 'desc' }
    });

    assert.ok(adminNotif, 'Expected admin notification after report creation');
    assert.match(adminNotif.message, /báo cáo|REPORT|gửi/i);

    await updateReportStatus(report.id, admin.id, {
      status: 'IN_REVIEW',
      resolutionNote: 'started reviewing'
    });

    const reporterNotif = await prisma.notification.findFirst({
      where: {
        userId: reporter.id,
        type: 'REPORT',
        actionUrl: `/reports/${report.id}`
      },
      orderBy: { createdAt: 'desc' }
    });

    assert.ok(reporterNotif, 'Expected reporter notification after report status change');
    assert.match(reporterNotif.message, /xem xét|trạng thái|báo cáo/i);
  } finally {
    await prisma.notification.deleteMany({ where: { userId: { in: [reporter.id, targetUser.id, admin.id] } } });
    if (reportId) {
      await prisma.report.deleteMany({ where: { id: reportId } });
    }
    await prisma.user.deleteMany({ where: { id: { in: [reporter.id, targetUser.id, admin.id] } } });
  }
});
