import test from 'node:test';
import assert from 'node:assert/strict';

import prisma from '../src/config/database.js';
import authService from '../src/services/auth.service.js';
import categoryService from '../src/services/category.service.js';
import groupService from '../src/services/group.service.js';
import { createReview, respondToReview } from '../src/services/review.service.js';
import { searchAll } from '../src/services/search.service.js';
import { verifySeller, getDashboardOverview, getAdvancedAnalyticsDashboard } from '../src/services/admin.service.js';
import { createPost, getPostById } from '../src/services/post.service.js';
import { createScheduledPost, publishScheduledPostRecord } from '../src/services/scheduled-post.service.js';
import { trackProductView, getSellerAnalyticsDashboard } from '../src/services/analytics.service.js';
import productService from '../src/services/product.service.js';
import {
  getVerificationStatus,
  submitVerificationStep1,
  submitVerificationStep2,
  submitVerificationStep3,
  submitVerificationForReview
} from '../src/services/seller.service.js';

process.env.JWT_SECRET ||= 'test-jwt-secret';

const uniq = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createUser = async ({ role = 'BUYER', isActive = true, isVerified = false, bio } = {}) => {
  const token = uniq(role.toLowerCase());
  return prisma.user.create({
    data: {
      email: `${token}@example.com`,
      username: token,
      passwordHash: 'test-hash',
      fullName: `${role} ${token}`,
      role,
      isActive,
      isVerified,
      ...(bio !== undefined ? { bio } : {})
    }
  });
};

test('integration: auth register normalizes username and auth updateProfile ignores role changes', async () => {
  const email = `${uniq('register')}@example.com`;
  let userId = null;

  try {
    const registerResult = await authService.register({
      email,
      username: 'MixedCaseUser',
      password: 'StrongPassword123!',
      fullName: 'Register Test User',
      phone: '0900000000'
    });

    userId = registerResult.user.id;
    assert.equal(registerResult.user.username, 'mixedcaseuser');
    assert.ok(registerResult.token);

    const updated = await authService.updateProfile(userId, {
      fullName: 'Updated Auth User',
      role: 'SELLER'
    });

    assert.equal(updated.role, 'BUYER');
    assert.equal(updated.fullName, 'Updated Auth User');

    const persisted = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    assert.equal(persisted.role, 'BUYER');
  } finally {
    if (userId) {
      await prisma.user.deleteMany({ where: { id: userId } });
    }
  }
});

test('integration: category service returns only active categories and active children', async () => {
  const root = await prisma.category.create({
    data: {
      name: uniq('Root Category'),
      slug: uniq('root-category'),
      isActive: true,
      displayOrder: 2
    }
  });

  const activeChild = await prisma.category.create({
    data: {
      name: uniq('Active Child'),
      slug: uniq('active-child'),
      parentId: root.id,
      isActive: true,
      displayOrder: 1
    }
  });

  const inactiveChild = await prisma.category.create({
    data: {
      name: uniq('Inactive Child'),
      slug: uniq('inactive-child'),
      parentId: root.id,
      isActive: false,
      displayOrder: 0
    }
  });

  const inactiveRoot = await prisma.category.create({
    data: {
      name: uniq('Inactive Root'),
      slug: uniq('inactive-root'),
      isActive: false,
      displayOrder: 0
    }
  });

  try {
    const categories = await categoryService.getCategories();
    const matchedRoot = categories.find((item) => item.id === root.id);

    assert.ok(matchedRoot, 'Expected active root category to be returned');
    assert.equal(matchedRoot.children.length, 1);
    assert.equal(matchedRoot.children[0].id, activeChild.id);
    assert.ok(!categories.some((item) => item.id === inactiveRoot.id));

    const fetchedBySlug = await categoryService.getCategory(root.slug);
    assert.equal(fetchedBySlug.id, root.id);

    const roots = await categoryService.getRootCategories();
    assert.ok(roots.some((item) => item.id === root.id));
    assert.ok(!roots.some((item) => item.id === inactiveRoot.id));

    await assert.rejects(() => categoryService.getCategory(inactiveChild.slug), /Category not found/);
  } finally {
    await prisma.category.deleteMany({ where: { id: { in: [activeChild.id, inactiveChild.id, root.id, inactiveRoot.id] } } });
  }
});

test('integration: review service creates verified review and allows seller response', async () => {
  const buyer = await createUser({ role: 'BUYER' });
  const seller = await createUser({ role: 'SELLER' });
  let reviewId = null;

  const product = await prisma.product.create({
    data: {
      sellerId: seller.id,
      title: uniq('review-product-title'),
      slug: uniq('review-product-slug'),
      description: 'review product',
      price: 100000,
      stockQuantity: 10,
      trackInventory: true,
      status: 'ACTIVE',
      metaKeywords: []
    }
  });

  const order = await prisma.order.create({
    data: {
      orderNumber: uniq('ORD'),
      buyerId: buyer.id,
      subtotal: 100000,
      shippingFee: 30000,
      tax: 0,
      discount: 0,
      total: 130000,
      shippingName: 'Buyer Review',
      shippingPhone: '0900000000',
      shippingAddress: '123 Review Street',
      shippingCity: 'HCM',
      shippingDistrict: 'District 1',
      shippingWard: 'Ward 1',
      paymentMethod: 'COD',
      paymentStatus: 'PAID',
      status: 'DELIVERED'
    }
  });

  const orderItem = await prisma.orderItem.create({
    data: {
      orderId: order.id,
      productId: product.id,
      sellerId: seller.id,
      productName: product.title,
      quantity: 1,
      unitPrice: 100000,
      totalPrice: 100000,
      status: 'delivered'
    }
  });

  try {
    const review = await createReview(buyer.id, {
      productId: product.id,
      orderItemId: orderItem.id,
      rating: 5,
      title: 'Tuyet voi',
      content: 'San pham tot',
      images: ['https://example.com/review.jpg']
    });

    reviewId = review.id;
    assert.equal(review.isVerifiedPurchase, true);
    assert.equal(review.isPublished, true);

    await assert.rejects(
      () => createReview(buyer.id, {
        productId: product.id,
        orderItemId: orderItem.id,
        rating: 4,
        title: 'Duplicate',
        content: 'Duplicate review'
      }),
      /already reviewed/
    );

    const responded = await respondToReview(review.id, seller.id, 'Cam on ban da danh gia');
    assert.equal(responded.sellerResponse, 'Cam on ban da danh gia');
    assert.ok(responded.sellerResponseAt);

    await assert.rejects(
      () => respondToReview(review.id, buyer.id, 'Tra loi sai quyen'),
      /Review not found or unauthorized/
    );
  } finally {
    if (reviewId) {
      await prisma.review.deleteMany({ where: { id: reviewId } });
    }
    await prisma.orderItem.deleteMany({ where: { id: orderItem.id } });
    await prisma.order.deleteMany({ where: { id: order.id } });
    await prisma.product.deleteMany({ where: { id: product.id } });
    await prisma.user.deleteMany({ where: { id: { in: [buyer.id, seller.id] } } });
  }
});

test('integration: search service aggregates product user and post results with filters', async () => {
  const seller = await createUser({ role: 'SELLER', isVerified: true, bio: 'seller keyword profile' });
  const inactiveUser = await createUser({ role: 'BUYER', isActive: false, bio: 'keyword hidden user' });

  const product = await prisma.product.create({
    data: {
      sellerId: seller.id,
      title: 'keyword product visible',
      slug: uniq('search-product-slug'),
      description: 'keyword product description',
      price: 99000,
      stockQuantity: 3,
      trackInventory: true,
      status: 'ACTIVE',
      metaKeywords: []
    }
  });

  const hiddenProduct = await prisma.product.create({
    data: {
      sellerId: seller.id,
      title: 'keyword archived product',
      slug: uniq('search-hidden-product-slug'),
      description: 'keyword archived description',
      price: 199000,
      stockQuantity: 3,
      trackInventory: true,
      status: 'ARCHIVED',
      metaKeywords: []
    }
  });

  const publicPost = await prisma.post.create({
    data: {
      authorId: seller.id,
      content: 'keyword public post',
      mediaUrls: [],
      status: 'PUBLISHED',
      visibility: 'PUBLIC'
    }
  });

  const privatePost = await prisma.post.create({
    data: {
      authorId: seller.id,
      content: 'keyword private post',
      mediaUrls: [],
      status: 'PUBLISHED',
      visibility: 'PRIVATE'
    }
  });

  try {
    const result = await searchAll({ q: 'keyword', limit: 5 });

    assert.equal(result.products.length, 1);
    assert.equal(result.products[0].id, product.id);
    assert.equal(result.users.length, 1);
    assert.equal(result.users[0].id, seller.id);
    assert.equal(result.posts.length, 1);
    assert.equal(result.posts[0].id, publicPost.id);
    assert.deepEqual(result.totals, {
      products: 1,
      users: 1,
      posts: 1
    });
  } finally {
    await prisma.post.deleteMany({ where: { id: { in: [publicPost.id, privatePost.id] } } });
    await prisma.product.deleteMany({ where: { id: { in: [product.id, hiddenProduct.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [seller.id, inactiveUser.id] } } });
  }
});

test('integration: product service returns trending products based on paid sales and engagement', async () => {
  const seller = await createUser({ role: 'SELLER', isVerified: true });
  const buyer = await createUser({ role: 'BUYER' });

  const hotProduct = await prisma.product.create({
    data: {
      sellerId: seller.id,
      title: uniq('hot-product-title'),
      slug: uniq('hot-product-slug'),
      description: 'hot product',
      price: 120000,
      stockQuantity: 50,
      trackInventory: true,
      status: 'ACTIVE',
      viewsCount: 120,
      likesCount: 20,
      metaKeywords: []
    }
  });

  const coolProduct = await prisma.product.create({
    data: {
      sellerId: seller.id,
      title: uniq('cool-product-title'),
      slug: uniq('cool-product-slug'),
      description: 'cool product',
      price: 90000,
      stockQuantity: 50,
      trackInventory: true,
      status: 'ACTIVE',
      viewsCount: 10,
      likesCount: 1,
      metaKeywords: []
    }
  });

  const order = await prisma.order.create({
    data: {
      orderNumber: uniq('ORD'),
      buyerId: buyer.id,
      subtotal: 420000,
      shippingFee: 30000,
      tax: 0,
      discount: 0,
      total: 450000,
      shippingName: 'Buyer Trending',
      shippingPhone: '0900000000',
      shippingAddress: '123 Trending Street',
      shippingCity: 'HCM',
      shippingDistrict: 'District 1',
      shippingWard: 'Ward 1',
      paymentMethod: 'COD',
      paymentStatus: 'PAID',
      status: 'DELIVERED'
    }
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order.id,
        productId: hotProduct.id,
        sellerId: seller.id,
        productName: hotProduct.title,
        quantity: 3,
        unitPrice: 120000,
        totalPrice: 360000,
        status: 'delivered'
      },
      {
        orderId: order.id,
        productId: coolProduct.id,
        sellerId: seller.id,
        productName: coolProduct.title,
        quantity: 1,
        unitPrice: 90000,
        totalPrice: 90000,
        status: 'delivered'
      }
    ]
  });

  try {
    const trending = await productService.getTrendingProducts({ days: 30, limit: 5 });

    assert.equal(trending.periodDays, 30);
    assert.ok(trending.items.length >= 2);

    const hotItem = trending.items.find((item) => item.product.id === hotProduct.id);
    const coolItem = trending.items.find((item) => item.product.id === coolProduct.id);

    assert.ok(hotItem, 'Expected hot product in trending response');
    assert.ok(coolItem, 'Expected cool product in trending response');
    assert.ok(hotItem.metrics.soldQuantity > coolItem.metrics.soldQuantity);
    assert.ok(hotItem.metrics.trendScore > coolItem.metrics.trendScore);
  } finally {
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
    await prisma.order.deleteMany({ where: { id: order.id } });
    await prisma.product.deleteMany({ where: { id: { in: [hotProduct.id, coolProduct.id] } } });
    await prisma.user.deleteMany({ where: { id: { in: [seller.id, buyer.id] } } });
  }
});

test('integration: seller verification supports 3-step submission and review status transition', async () => {
  const user = await createUser({ role: 'BUYER' });

  try {
    const initial = await getVerificationStatus(user.id);
    assert.equal(initial.status, 'PENDING');
    assert.equal(initial.completion.allStepsCompleted, false);

    await submitVerificationStep1(user.id, {
      idCardNumber: '012345678901',
      idCardFrontUrl: 'https://example.com/id-front.jpg',
      idCardBackUrl: 'https://example.com/id-back.jpg',
      dateOfBirth: '1995-01-15',
      address: '123 Le Loi, District 1, HCM'
    });

    await submitVerificationStep2(user.id, {
      businessName: 'Shop Test Integration',
      businessType: 'HOUSEHOLD',
      businessLicenseNumber: 'BLN-2026-0001',
      businessLicenseUrl: 'https://example.com/license.pdf',
      taxCode: 'TAX-123456'
    });

    await submitVerificationStep3(user.id, {
      bankName: 'Vietcombank',
      bankAccountNumber: '0123456789',
      bankAccountName: 'Shop Test Integration',
      bankBranch: 'HCM Branch'
    });

    const completed = await getVerificationStatus(user.id);
    assert.equal(completed.completion.step1, true);
    assert.equal(completed.completion.step2, true);
    assert.equal(completed.completion.step3, true);
    assert.equal(completed.completion.allStepsCompleted, true);
    assert.equal(completed.status, 'PENDING');

    const submitted = await submitVerificationForReview(user.id);
    assert.equal(submitted.status, 'REVIEWING');

    const resubmitted = await submitVerificationForReview(user.id);
    assert.equal(resubmitted.status, 'REVIEWING');
  } finally {
    await prisma.sellerVerification.deleteMany({ where: { userId: user.id } });
    await prisma.user.deleteMany({ where: { id: user.id } });
  }
});

test('integration: admin service verifies seller and dashboard overview reflects created data', async () => {
  const admin = await createUser({ role: 'ADMIN', isVerified: true });
  const buyer = await createUser({ role: 'BUYER' });
  const candidateSeller = await createUser({ role: 'BUYER' });
  let productId = null;
  let orderId = null;
  let orderItemId = null;
  let postId = null;

  try {
    const approved = await verifySeller(admin.id, candidateSeller.id, 'approve');
    assert.equal(approved.user.role, 'SELLER');
    assert.equal(approved.user.isVerified, true);

    const verification = await prisma.sellerVerification.findUnique({
      where: { userId: candidateSeller.id },
      select: { status: true, verifiedBy: true }
    });

    assert.equal(verification.status, 'APPROVED');
    assert.equal(verification.verifiedBy, admin.id);

    const product = await prisma.product.create({
      data: {
        sellerId: candidateSeller.id,
        title: uniq('admin-product-title'),
        slug: uniq('admin-product-slug'),
        description: 'admin dashboard product',
        price: 120000,
        stockQuantity: 5,
        trackInventory: true,
        status: 'ACTIVE',
        metaKeywords: []
      }
    });
    productId = product.id;

    const order = await prisma.order.create({
      data: {
        orderNumber: uniq('ORD'),
        buyerId: buyer.id,
        subtotal: 120000,
        shippingFee: 30000,
        tax: 0,
        discount: 0,
        total: 150000,
        shippingName: 'Buyer Admin',
        shippingPhone: '0900000000',
        shippingAddress: '123 Admin Street',
        shippingCity: 'HCM',
        shippingDistrict: 'District 1',
        shippingWard: 'Ward 1',
        paymentMethod: 'COD',
        paymentStatus: 'PAID',
        status: 'CONFIRMED'
      }
    });
    orderId = order.id;

    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: product.id,
        sellerId: candidateSeller.id,
        productName: product.title,
        quantity: 1,
        unitPrice: 120000,
        totalPrice: 120000,
        status: 'confirmed'
      }
    });
    orderItemId = orderItem.id;

    const post = await prisma.post.create({
      data: {
        authorId: candidateSeller.id,
        content: 'admin dashboard post',
        mediaUrls: [],
        status: 'PUBLISHED',
        visibility: 'PUBLIC'
      }
    });
    postId = post.id;

    const overview = await getDashboardOverview();

    assert.ok(overview.totals.users >= 3);
    assert.ok(overview.totals.sellers >= 1);
    assert.ok(overview.totals.products >= 1);
    assert.ok(overview.totals.orders >= 1);
    assert.ok(overview.totals.posts >= 1);
    assert.ok(overview.totals.paidRevenue >= 150000);
    assert.ok((overview.orderStatusBreakdown.CONFIRMED || 0) >= 1);
  } finally {
    await prisma.notification.deleteMany({ where: { userId: { in: [admin.id, buyer.id, candidateSeller.id] } } });
    if (postId) {
      await prisma.post.deleteMany({ where: { id: postId } });
    }
    if (orderItemId) {
      await prisma.orderItem.deleteMany({ where: { id: orderItemId } });
    }
    if (orderId) {
      await prisma.order.deleteMany({ where: { id: orderId } });
    }
    if (productId) {
      await prisma.product.deleteMany({ where: { id: productId } });
    }
    await prisma.sellerVerification.deleteMany({ where: { userId: candidateSeller.id } });
    await prisma.user.deleteMany({ where: { id: { in: [admin.id, buyer.id, candidateSeller.id] } } });
  }
});

test('integration: admin advanced analytics dashboard returns summary and trend series', async () => {
  const seller = await createUser({ role: 'SELLER', isVerified: true });
  const buyer = await createUser({ role: 'BUYER' });
  let productId = null;
  let postId = null;
  let orderId = null;
  let orderItemId = null;

  try {
    const product = await prisma.product.create({
      data: {
        sellerId: seller.id,
        title: uniq('admin-analytics-product-title'),
        slug: uniq('admin-analytics-product-slug'),
        description: 'admin analytics product',
        price: 130000,
        stockQuantity: 9,
        trackInventory: true,
        status: 'ACTIVE',
        metaKeywords: []
      }
    });
    productId = product.id;

    const post = await prisma.post.create({
      data: {
        authorId: seller.id,
        content: 'admin analytics post',
        mediaUrls: [],
        status: 'PUBLISHED',
        visibility: 'PUBLIC'
      }
    });
    postId = post.id;

    const order = await prisma.order.create({
      data: {
        orderNumber: uniq('ORD'),
        buyerId: buyer.id,
        subtotal: 130000,
        shippingFee: 30000,
        tax: 0,
        discount: 0,
        total: 160000,
        shippingName: 'Buyer Analytics Admin',
        shippingPhone: '0900000000',
        shippingAddress: '123 Analytics Admin Street',
        shippingCity: 'HCM',
        shippingDistrict: 'District 1',
        shippingWard: 'Ward 1',
        paymentMethod: 'COD',
        paymentStatus: 'PAID',
        status: 'DELIVERED'
      }
    });
    orderId = order.id;

    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: product.id,
        sellerId: seller.id,
        productName: product.title,
        quantity: 1,
        unitPrice: 130000,
        totalPrice: 130000,
        status: 'delivered'
      }
    });
    orderItemId = orderItem.id;

    const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const dashboard = await getAdvancedAnalyticsDashboard({
      startDate,
      endDate,
      interval: 'day'
    });

    assert.equal(dashboard.period.interval, 'day');
    assert.ok(dashboard.period.bucketCount >= 1);
    assert.ok(dashboard.summary.users.total >= 2);
    assert.ok(dashboard.summary.users.new >= 2);
    assert.ok(dashboard.summary.content.newPosts >= 1);
    assert.ok(dashboard.summary.content.newProducts >= 1);
    assert.ok(dashboard.summary.commerce.orders >= 1);
    assert.ok(dashboard.summary.commerce.paidOrders >= 1);
    assert.ok(dashboard.summary.commerce.revenue.total >= 160000);
    assert.ok(Array.isArray(dashboard.trends));
    assert.ok(dashboard.trends.some((row) => row.content.newProducts >= 1));
  } finally {
    if (orderItemId) {
      await prisma.orderItem.deleteMany({ where: { id: orderItemId } });
    }
    if (orderId) {
      await prisma.order.deleteMany({ where: { id: orderId } });
    }
    if (postId) {
      await prisma.post.deleteMany({ where: { id: postId } });
    }
    if (productId) {
      await prisma.product.deleteMany({ where: { id: productId } });
    }
    await prisma.user.deleteMany({ where: { id: { in: [seller.id, buyer.id] } } });
  }
});

test('integration: group service creates membership flow and prevents last admin from leaving', async () => {
  const creator = await createUser({ role: 'BUYER' });
  const member = await createUser({ role: 'BUYER' });
  let groupId = null;

  try {
    const group = await groupService.createGroup(creator.id, {
      name: `Nhom ${uniq('ban-hang')}`,
      description: 'Cong dong test'
    });

    groupId = group.id;
    assert.equal(group.isMember, true);
    assert.equal(group.memberRole, 'ADMIN');

    const joined = await groupService.joinGroup(groupId, member.id);
    assert.equal(joined._count.members, 2);

    const discover = await groupService.listGroups({ userId: member.id, membership: 'joined' });
    assert.ok(discover.groups.some((item) => item.id === groupId && item.isMember === true));

    await assert.rejects(
      () => groupService.leaveGroup(groupId, creator.id),
      /Group must have at least one admin/
    );

    const left = await groupService.leaveGroup(groupId, member.id);
    assert.equal(left.left, true);
  } finally {
    if (groupId) {
      await prisma.groupMember.deleteMany({ where: { groupId } });
      await prisma.group.deleteMany({ where: { id: groupId } });
    }
    await prisma.user.deleteMany({ where: { id: { in: [creator.id, member.id] } } });
  }
});

test('integration: post service creates post and getPostById marks liked state and increments views', async () => {
  const author = await createUser({ role: 'SELLER', isVerified: true });
  const viewer = await createUser({ role: 'BUYER' });
  let postId = null;

  try {
    const post = await createPost(author.id, {
      content: 'Bai viet test post service',
      mediaUrls: [],
      visibility: 'PUBLIC',
      status: 'PUBLISHED'
    });

    postId = post.id;
    assert.equal(post.author.id, author.id);

    await prisma.postLike.create({
      data: {
        postId,
        userId: viewer.id
      }
    });

    const detail = await getPostById(postId, viewer.id);
    assert.equal(detail.isLiked, true);

    const persisted = await prisma.post.findUnique({
      where: { id: postId },
      select: { viewsCount: true }
    });

    assert.equal(persisted.viewsCount, 1);
  } finally {
    if (postId) {
      await prisma.postLike.deleteMany({ where: { postId } });
      await prisma.postComment.deleteMany({ where: { postId } });
      await prisma.post.deleteMany({ where: { id: postId } });
    }
    await prisma.user.deleteMany({ where: { id: { in: [author.id, viewer.id] } } });
  }
});

test('integration: scheduled-post service creates and publishes scheduled record into feed post', async () => {
  const user = await createUser({ role: 'BUYER' });
  let scheduledId = null;
  let publishedPostId = null;

  try {
    const scheduled = await createScheduledPost(user.id, {
      content: 'Hen gio dang bai test',
      mediaUrls: [],
      visibility: 'PUBLIC',
      scheduledTime: new Date(Date.now() + 60_000).toISOString()
    });

    scheduledId = scheduled.id;
    assert.equal(scheduled.status, 'scheduled');

    const published = await publishScheduledPostRecord(scheduled.id, user.id);
    assert.equal(published.status, 'published');
    assert.ok(published.publishedPostId);
    publishedPostId = published.publishedPostId;

    const feedPost = await prisma.post.findUnique({
      where: { id: publishedPostId },
      select: { content: true, authorId: true, status: true }
    });

    assert.equal(feedPost.authorId, user.id);
    assert.equal(feedPost.content, 'Hen gio dang bai test');
    assert.equal(feedPost.status, 'PUBLISHED');
  } finally {
    if (publishedPostId) {
      await prisma.post.deleteMany({ where: { id: publishedPostId } });
    }
    if (scheduledId) {
      await prisma.scheduledPost.deleteMany({ where: { id: scheduledId } });
    }
    await prisma.user.deleteMany({ where: { id: user.id } });
  }
});

test('integration: analytics service tracks views and returns seller dashboard summary', async () => {
  const seller = await createUser({ role: 'SELLER', isVerified: true });
  const buyer = await createUser({ role: 'BUYER' });
  let productId = null;
  let orderId = null;
  let orderItemId = null;

  try {
    const product = await prisma.product.create({
      data: {
        sellerId: seller.id,
        title: uniq('analytics-product-title'),
        slug: uniq('analytics-product-slug'),
        description: 'analytics dashboard product',
        price: 175000,
        stockQuantity: 8,
        trackInventory: true,
        status: 'ACTIVE',
        metaKeywords: []
      }
    });
    productId = product.id;

    await trackProductView({
      productId,
      userId: buyer.id,
      sessionId: uniq('session'),
      ipAddress: '127.0.0.1',
      userAgent: 'node-test'
    });

    await prisma.follow.create({
      data: {
        followerId: buyer.id,
        followingId: seller.id
      }
    });

    const order = await prisma.order.create({
      data: {
        orderNumber: uniq('ORD'),
        buyerId: buyer.id,
        subtotal: 175000,
        shippingFee: 30000,
        tax: 0,
        discount: 0,
        total: 205000,
        shippingName: 'Buyer Analytics',
        shippingPhone: '0900000000',
        shippingAddress: '123 Analytics Street',
        shippingCity: 'HCM',
        shippingDistrict: 'District 1',
        shippingWard: 'Ward 1',
        paymentMethod: 'COD',
        paymentStatus: 'PAID',
        status: 'DELIVERED'
      }
    });
    orderId = order.id;

    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId,
        sellerId: seller.id,
        productName: product.title,
        quantity: 2,
        unitPrice: 175000,
        totalPrice: 350000,
        status: 'delivered'
      }
    });
    orderItemId = orderItem.id;

    const dashboard = await getSellerAnalyticsDashboard(seller.id);
    assert.equal(dashboard.summary.products.total >= 1, true);
    assert.equal(dashboard.summary.traffic.totalViews >= 1, true);
    assert.equal(dashboard.summary.audience.totalFollowers >= 1, true);
    assert.equal(dashboard.summary.sales.totalOrders >= 1, true);
    assert.equal(dashboard.summary.sales.totalItemsSold >= 2, true);
    assert.equal(dashboard.summary.sales.grossRevenue >= 350000, true);
    assert.ok(dashboard.topProducts.some((item) => item.product.id === productId));
  } finally {
    await prisma.follow.deleteMany({ where: { followerId: buyer.id, followingId: seller.id } });
    if (orderItemId) {
      await prisma.orderItem.deleteMany({ where: { id: orderItemId } });
    }
    if (orderId) {
      await prisma.order.deleteMany({ where: { id: orderId } });
    }
    if (productId) {
      await prisma.productView.deleteMany({ where: { productId } });
      await prisma.product.deleteMany({ where: { id: productId } });
    }
    await prisma.user.deleteMany({ where: { id: { in: [seller.id, buyer.id] } } });
  }
});
