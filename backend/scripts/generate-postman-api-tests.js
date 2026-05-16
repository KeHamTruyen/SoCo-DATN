import fs from 'fs';
import path from 'path';

const outputDir = path.resolve('postman');
const collectionPath = path.join(outputDir, 'SoCo-API-Test-Cases.postman_collection.json');
const environmentPath = path.join(outputDir, 'SoCo-Local.postman_environment.json');

const uuid = '00000000-0000-4000-8000-000000000001';

function testStatus(expected) {
  const list = Array.isArray(expected) ? expected : [expected];
  return `
pm.test("Status code is ${list.join(" or ")}", function () {
  pm.expect(${JSON.stringify(list)}).to.include(pm.response.code);
});
`;
}

function testJsonEnvelope() {
  return `
pm.test("Response is JSON when body exists", function () {
  if (pm.response.text()) {
    pm.response.to.have.jsonBody();
  }
});
`;
}

function testSuccessFlag(expected) {
  return `
pm.test("success is ${expected}", function () {
  const json = pm.response.json();
  pm.expect(json.success).to.eql(${expected});
});
`;
}

function saveToken(varName, paths = ['data.accessToken', 'accessToken', 'token']) {
  return `
(function saveToken() {
  if (!pm.response.text()) return;
  const json = pm.response.json();
  const paths = ${JSON.stringify(paths)};
  for (const path of paths) {
    const value = path.split('.').reduce((obj, key) => obj && obj[key], json);
    if (typeof value === "string" && value.length > 0) {
      pm.environment.set("${varName}", value);
      return;
    }
  }
})();
`;
}

function saveId(varName, paths) {
  return `
(function saveId() {
  if (!pm.response.text()) return;
  const json = pm.response.json();
  const paths = ${JSON.stringify(paths)};
  for (const path of paths) {
    const value = path.split('.').reduce((obj, key) => obj && obj[key], json);
    if (typeof value === "string" && value.length > 0) {
      pm.environment.set("${varName}", value);
      return;
    }
  }
})();
`;
}

function event(script) {
  return [{ listen: 'test', script: { type: 'text/javascript', exec: script.trim().split('\n') } }];
}

function request(name, method, url, options = {}) {
  const headers = [{ key: 'Content-Type', value: 'application/json' }];
  if (options.token) {
    headers.push({ key: 'Authorization', value: `Bearer {{${options.token}}}` });
  }

  const item = {
    name,
    request: {
      method,
      header: headers,
      url: {
        raw: url,
        host: [url],
      },
    },
    event: event([
      testStatus(options.status ?? [200, 201, 400, 401, 403, 404]),
      testJsonEnvelope(),
      options.expectSuccess === undefined ? '' : testSuccessFlag(options.expectSuccess),
      options.extraTests || '',
    ].join('\n')),
  };

  if (options.body !== undefined) {
    item.request.body = {
      mode: 'raw',
      raw: JSON.stringify(options.body, null, 2),
      options: { raw: { language: 'json' } },
    };
  }

  return item;
}

function folder(name, items) {
  return { name, item: items };
}

const protectedCases = [
  ['AUTH', 'GET', '{{baseUrl}}/auth/me'],
  ['AUTH', 'PUT', '{{baseUrl}}/auth/profile'],
  ['AUTH', 'PUT', '{{baseUrl}}/auth/password'],
  ['AUTH', 'GET', '{{baseUrl}}/auth/privacy'],
  ['AUTH', 'GET', '{{baseUrl}}/auth/2fa/status'],
  ['AUTH', 'POST', '{{baseUrl}}/auth/2fa/enable'],
  ['AUTH', 'POST', '{{baseUrl}}/auth/2fa/confirm'],
  ['AUTH', 'POST', '{{baseUrl}}/auth/2fa/disable'],
  ['USER', 'GET', '{{baseUrl}}/users/me'],
  ['USER', 'GET', '{{baseUrl}}/users/suggested'],
  ['USER', 'POST', `{{baseUrl}}/users/${uuid}/follow`],
  ['POST', 'GET', '{{baseUrl}}/posts/feed'],
  ['POST', 'POST', '{{baseUrl}}/posts'],
  ['POST', 'PUT', `{{baseUrl}}/posts/${uuid}`],
  ['POST', 'DELETE', `{{baseUrl}}/posts/${uuid}`],
  ['POST', 'POST', `{{baseUrl}}/posts/${uuid}/like`],
  ['POST', 'POST', `{{baseUrl}}/posts/${uuid}/share`],
  ['POST', 'POST', `{{baseUrl}}/posts/${uuid}/comments`],
  ['PRODUCT', 'GET', '{{baseUrl}}/products/seller/me'],
  ['PRODUCT', 'POST', '{{baseUrl}}/products'],
  ['PRODUCT', 'PUT', `{{baseUrl}}/products/${uuid}`],
  ['PRODUCT', 'DELETE', `{{baseUrl}}/products/${uuid}`],
  ['PRODUCT', 'POST', `{{baseUrl}}/products/${uuid}/restore`],
  ['PRODUCT', 'POST', `{{baseUrl}}/products/${uuid}/publish`],
  ['PRODUCT', 'POST', `{{baseUrl}}/products/${uuid}/images`],
  ['PRODUCT', 'POST', `{{baseUrl}}/products/${uuid}/view`],
  ['PRODUCT', 'POST', '{{baseUrl}}/products/search-events'],
  ['PRODUCT', 'GET', '{{baseUrl}}/products/recommendations/me'],
  ['CART', 'GET', '{{baseUrl}}/cart'],
  ['CART', 'GET', '{{baseUrl}}/cart/count'],
  ['CART', 'POST', '{{baseUrl}}/cart/items'],
  ['CART', 'PUT', `{{baseUrl}}/cart/items/${uuid}`],
  ['CART', 'DELETE', `{{baseUrl}}/cart/items/${uuid}`],
  ['CART', 'DELETE', '{{baseUrl}}/cart'],
  ['ORDER', 'POST', '{{baseUrl}}/orders'],
  ['ORDER', 'GET', '{{baseUrl}}/orders/my/purchases'],
  ['ORDER', 'GET', '{{baseUrl}}/orders/my/sales'],
  ['ORDER', 'GET', `{{baseUrl}}/orders/${uuid}`],
  ['ORDER', 'PUT', `{{baseUrl}}/orders/${uuid}/status`],
  ['ORDER', 'POST', `{{baseUrl}}/orders/${uuid}/cancel`],
  ['ORDER', 'POST', `{{baseUrl}}/orders/${uuid}/payment/confirm`],
  ['ORDER', 'POST', `{{baseUrl}}/orders/${uuid}/refund-request`],
  ['ORDER', 'POST', `{{baseUrl}}/orders/${uuid}/refund`],
  ['REVIEW', 'POST', '{{baseUrl}}/reviews'],
  ['REVIEW', 'POST', `{{baseUrl}}/reviews/${uuid}/reply`],
  ['GROUP', 'POST', '{{baseUrl}}/groups'],
  ['GROUP', 'GET', '{{baseUrl}}/groups/me'],
  ['GROUP', 'POST', '{{baseUrl}}/groups/join-by-invite'],
  ['GROUP', 'PUT', `{{baseUrl}}/groups/${uuid}`],
  ['GROUP', 'DELETE', `{{baseUrl}}/groups/${uuid}`],
  ['GROUP', 'POST', `{{baseUrl}}/groups/${uuid}/join`],
  ['GROUP', 'POST', `{{baseUrl}}/groups/${uuid}/leave`],
  ['GROUP', 'GET', `{{baseUrl}}/groups/${uuid}/requests`],
  ['GROUP', 'POST', `{{baseUrl}}/groups/${uuid}/posts`],
  ['GROUP', 'POST', `{{baseUrl}}/groups/${uuid}/invites`],
  ['MESSAGE', 'GET', '{{baseUrl}}/messages/conversations'],
  ['MESSAGE', 'POST', '{{baseUrl}}/messages/conversations'],
  ['MESSAGE', 'GET', `{{baseUrl}}/messages/conversations/${uuid}`],
  ['MESSAGE', 'POST', `{{baseUrl}}/messages/conversations/${uuid}`],
  ['MESSAGE', 'PATCH', `{{baseUrl}}/messages/conversations/${uuid}/read`],
  ['MESSAGE', 'DELETE', `{{baseUrl}}/messages/messages/${uuid}`],
  ['NOTIFICATION', 'GET', '{{baseUrl}}/notifications'],
  ['NOTIFICATION', 'GET', '{{baseUrl}}/notifications/preferences'],
  ['NOTIFICATION', 'PATCH', '{{baseUrl}}/notifications/preferences'],
  ['NOTIFICATION', 'PATCH', '{{baseUrl}}/notifications/read-all'],
  ['NOTIFICATION', 'PATCH', `{{baseUrl}}/notifications/${uuid}/read`],
  ['NOTIFICATION', 'DELETE', `{{baseUrl}}/notifications/${uuid}`],
  ['NOTIFICATION', 'DELETE', '{{baseUrl}}/notifications'],
  ['AI', 'GET', '{{baseUrl}}/ai/history'],
  ['AI', 'POST', '{{baseUrl}}/ai/generate-text'],
  ['AI', 'POST', '{{baseUrl}}/ai/generate-image-text'],
  ['AI', 'POST', '{{baseUrl}}/ai/generate-video-images-text'],
  ['AI', 'PATCH', `{{baseUrl}}/ai/history/${uuid}/link-post`],
  ['AI', 'DELETE', `{{baseUrl}}/ai/history/${uuid}`],
  ['AI_ASSISTANT', 'POST', '{{baseUrl}}/ai-assistant/chat'],
  ['SCHEDULED', 'POST', '{{baseUrl}}/scheduled-posts'],
  ['SCHEDULED', 'GET', '{{baseUrl}}/scheduled-posts'],
  ['SCHEDULED', 'GET', '{{baseUrl}}/scheduled-posts/analytics'],
  ['SCHEDULED', 'PUT', `{{baseUrl}}/scheduled-posts/${uuid}`],
  ['SCHEDULED', 'POST', `{{baseUrl}}/scheduled-posts/${uuid}/publish`],
  ['SCHEDULED', 'DELETE', `{{baseUrl}}/scheduled-posts/${uuid}`],
  ['SELLER', 'GET', '{{baseUrl}}/seller/status'],
  ['SELLER', 'GET', '{{baseUrl}}/seller/stats'],
  ['SELLER', 'POST', '{{baseUrl}}/seller/apply'],
  ['SELLER', 'PUT', '{{baseUrl}}/seller/step1'],
  ['SELLER', 'PUT', '{{baseUrl}}/seller/step2'],
  ['SELLER', 'PUT', '{{baseUrl}}/seller/step3'],
  ['SELLER', 'POST', '{{baseUrl}}/seller/submit'],
  ['REPORT', 'POST', '{{baseUrl}}/reports'],
  ['REPORT', 'GET', '{{baseUrl}}/reports/me'],
  ['SAVED', 'GET', '{{baseUrl}}/saved-items'],
  ['SAVED', 'GET', '{{baseUrl}}/saved-items/lookup?itemType=PRODUCT&targetId={{productId}}'],
  ['SAVED', 'POST', '{{baseUrl}}/saved-items'],
  ['SAVED', 'DELETE', `{{baseUrl}}/saved-items/${uuid}`],
  ['ADMIN_CORE', 'GET', '{{baseUrl}}/admin/auth/me'],
  ['ADMIN_CORE', 'GET', '{{baseUrl}}/admin/seller/applications'],
  ['ADMIN_CORE', 'PATCH', `{{baseUrl}}/admin/seller/applications/${uuid}/approve`],
  ['ADMIN_CORE', 'PATCH', `{{baseUrl}}/admin/seller/applications/${uuid}/reject`],
  ['ADMIN_CORE', 'GET', '{{baseUrl}}/admin/categories'],
  ['ADMIN_CORE', 'POST', '{{baseUrl}}/admin/categories'],
  ['ADMIN_CORE', 'PUT', `{{baseUrl}}/admin/categories/${uuid}`],
  ['ADMIN_CORE', 'DELETE', `{{baseUrl}}/admin/categories/${uuid}`],
  ['ADMIN_CORE', 'DELETE', `{{baseUrl}}/admin/posts/${uuid}`],
  ['ADMIN_CORE', 'DELETE', `{{baseUrl}}/admin/products/${uuid}`],
];

const folders = [
  folder('00 - Public Smoke', [
    request('API metadata', 'GET', '{{baseUrl}}', { status: 200, expectSuccess: undefined }),
    request('List products', 'GET', '{{baseUrl}}/products?page=1&limit=5', { status: 200, expectSuccess: true }),
    request('List categories', 'GET', '{{baseUrl}}/categories', { status: 200 }),
    request('Root categories', 'GET', '{{baseUrl}}/categories/root', { status: 200 }),
    request('List public posts', 'GET', '{{baseUrl}}/posts?page=1&limit=5', { status: 200, expectSuccess: true }),
    request('Search requires q', 'GET', '{{baseUrl}}/search', { status: 400, expectSuccess: false }),
    request('Search all', 'GET', '{{baseUrl}}/search?q={{searchQuery}}&limit=5', { status: 200, expectSuccess: true }),
    request('Search users', 'GET', '{{baseUrl}}/users/search?q={{searchQuery}}&limit=5', { status: 200, expectSuccess: true }),
    request('Browse groups', 'GET', '{{baseUrl}}/groups?search={{searchQuery}}&limit=5', { status: 200, expectSuccess: true }),
  ]),
  folder('01 - Auth Validation', [
    request('Register missing fields fails', 'POST', '{{baseUrl}}/auth/register', { status: 400, expectSuccess: false, body: {} }),
    request('Login missing fields fails', 'POST', '{{baseUrl}}/auth/login', { status: 400, expectSuccess: false, body: {} }),
    request('Verify email missing fields fails', 'POST', '{{baseUrl}}/auth/verify-email', { status: 400, expectSuccess: false, body: {} }),
    request('Resend verification missing fields fails', 'POST', '{{baseUrl}}/auth/resend-verification', { status: 400, expectSuccess: false, body: {} }),
    request('Verify 2FA missing fields fails', 'POST', '{{baseUrl}}/auth/verify-2fa', { status: 400, expectSuccess: false, body: {} }),
    request('Forgot password missing fields fails', 'POST', '{{baseUrl}}/auth/forgot-password', { status: 400, expectSuccess: false, body: {} }),
    request('Reset password missing fields fails', 'POST', '{{baseUrl}}/auth/reset-password', { status: 400, expectSuccess: false, body: {} }),
    request('Malformed bearer token fails', 'GET', '{{baseUrl}}/auth/me', {
      status: 401,
      expectSuccess: false,
      token: 'badToken',
    }),
  ]),
  folder('02 - Auth Happy Path Environment Driven', [
    request('Login buyer and save token', 'POST', '{{baseUrl}}/auth/login', {
      status: [200, 403],
      body: { email: '{{buyerEmail}}', password: '{{buyerPassword}}' },
      extraTests: saveToken('accessToken'),
    }),
    request('Login seller and save token', 'POST', '{{baseUrl}}/auth/login', {
      status: [200, 403],
      body: { email: '{{sellerEmail}}', password: '{{sellerPassword}}' },
      extraTests: saveToken('sellerToken'),
    }),
    request('Login core admin and save token', 'POST', '{{baseUrl}}/admin/auth/login', {
      status: [200, 401, 403],
      body: { email: '{{adminEmail}}', password: '{{adminPassword}}' },
      extraTests: saveToken('adminToken'),
    }),
    request('Get current buyer profile', 'GET', '{{baseUrl}}/auth/me', {
      status: [200, 401],
      token: 'accessToken',
      extraTests: saveId('userId', ['data.id', 'data.user.id', 'user.id']),
    }),
    request('Get current admin profile', 'GET', '{{baseUrl}}/admin/auth/me', {
      status: [200, 401],
      token: 'adminToken',
    }),
  ]),
  folder('03 - Protected Endpoint Auth Guards', protectedCases.map(([groupName, method, url]) =>
    request(`${groupName} ${method} ${url.replace('{{baseUrl}}', '')} rejects missing token`, method, url, {
      status: 401,
      expectSuccess: false,
      body: ['POST', 'PUT', 'PATCH'].includes(method) ? {} : undefined,
    }),
  )),
  folder('04 - Product, Search, Recommendation', [
    request('Product search/filter', 'GET', '{{baseUrl}}/products?search={{searchQuery}}&page=1&limit=10&sortBy=salesCount&sortOrder=desc', { status: 200, expectSuccess: true }),
    request('Product recommendations with buyer token', 'GET', '{{baseUrl}}/products/recommendations/me?page=1&limit=12', { status: [200, 401], token: 'accessToken' }),
    request('Track search event', 'POST', '{{baseUrl}}/products/search-events', { status: [201, 401], token: 'accessToken', body: { query: '{{searchQuery}}' } }),
    request('Get product detail by variable', 'GET', '{{baseUrl}}/products/{{productId}}', { status: [200, 404] }),
    request('Track product view', 'POST', '{{baseUrl}}/products/{{productId}}/view', { status: [201, 401, 404], token: 'accessToken', body: { sessionId: 'postman-session' } }),
  ]),
  folder('05 - Social, Group, Report', [
    request('Create post as buyer', 'POST', '{{baseUrl}}/posts', { status: [201, 400, 401], token: 'accessToken', body: { content: 'Postman API test post', visibility: 'PUBLIC' }, extraTests: saveId('postId', ['data.post.id', 'data.id']) }),
    request('Like post', 'POST', '{{baseUrl}}/posts/{{postId}}/like', { status: [200, 401, 404], token: 'accessToken' }),
    request('Comment post', 'POST', '{{baseUrl}}/posts/{{postId}}/comments', { status: [200, 201, 400, 401, 404], token: 'accessToken', body: { content: 'Postman comment' } }),
    request('Create report for post', 'POST', '{{baseUrl}}/reports', { status: [201, 400, 401, 404], token: 'accessToken', body: { targetType: 'post', targetId: '{{postId}}', reason: 'spam', description: 'Postman report test' } }),
    request('Create group', 'POST', '{{baseUrl}}/groups', { status: [201, 400, 401], token: 'accessToken', body: { name: 'Postman Test Group', description: 'Created by Postman', privacy: 'PUBLIC' }, extraTests: saveId('groupId', ['data.id', 'group.id']) }),
    request('Create group post', 'POST', '{{baseUrl}}/groups/{{groupId}}/posts', { status: [201, 400, 401, 403, 404], token: 'accessToken', body: { content: 'Group post from Postman' } }),
  ]),
  folder('06 - Cart, Order, Review', [
    request('Get cart', 'GET', '{{baseUrl}}/cart', { status: [200, 401], token: 'accessToken' }),
    request('Add cart item', 'POST', '{{baseUrl}}/cart/items', { status: [200, 201, 400, 401, 404], token: 'accessToken', body: { productId: '{{productId}}', quantity: 1 }, extraTests: saveId('cartItemId', ['data.id', 'data.item.id']) }),
    request('Update cart item', 'PUT', '{{baseUrl}}/cart/items/{{cartItemId}}', { status: [200, 400, 401, 403, 404], token: 'accessToken', body: { quantity: 2 } }),
    request('Checkout', 'POST', '{{baseUrl}}/orders', { status: [201, 400, 401], token: 'accessToken', body: { shippingName: 'Postman Buyer', shippingPhone: '0900000000', shippingAddress: 'Postman address', paymentMethod: 'COD' }, extraTests: saveId('orderId', ['data.id', 'data.order.id']) }),
    request('Get order detail', 'GET', '{{baseUrl}}/orders/{{orderId}}', { status: [200, 401, 403, 404], token: 'accessToken' }),
    request('Create review', 'POST', '{{baseUrl}}/reviews', { status: [201, 400, 401, 403], token: 'accessToken', body: { productId: '{{productId}}', orderItemId: '{{orderItemId}}', rating: 5, title: 'Good', content: 'Postman review' } }),
  ]),
  folder('07 - Messaging, Notification, Saved', [
    request('Create conversation', 'POST', '{{baseUrl}}/messages/conversations', { status: [200, 201, 400, 401], token: 'accessToken', body: { participantId: '{{sellerId}}' }, extraTests: saveId('conversationId', ['data.id', 'data.conversation.id']) }),
    request('Send message', 'POST', '{{baseUrl}}/messages/conversations/{{conversationId}}', { status: [200, 201, 400, 401, 403, 404], token: 'accessToken', body: { content: 'Hello from Postman', messageType: 'TEXT' } }),
    request('Get notifications', 'GET', '{{baseUrl}}/notifications', { status: [200, 401], token: 'accessToken' }),
    request('Update notification preferences', 'PATCH', '{{baseUrl}}/notifications/preferences', { status: [200, 400, 401], token: 'accessToken', body: { orderUpdates: true, socialInteractions: true, messages: true } }),
    request('Save product', 'POST', '{{baseUrl}}/saved-items', { status: [200, 201, 400, 401], token: 'accessToken', body: { itemType: 'PRODUCT', targetId: '{{productId}}' }, extraTests: saveId('savedItemId', ['data.id']) }),
    request('Remove saved item', 'DELETE', '{{baseUrl}}/saved-items/{{savedItemId}}', { status: [200, 401, 404], token: 'accessToken' }),
  ]),
  folder('08 - AI, Scheduled Post, Seller', [
    request('Generate AI text', 'POST', '{{baseUrl}}/ai/generate-text', { status: [200, 400, 401, 503], token: 'sellerToken', body: { idea: 'Áo thun mùa hè', tone: 'friendly' } }),
    request('AI assistant chat', 'POST', '{{baseUrl}}/ai-assistant/chat', { status: [200, 400, 401], token: 'accessToken', body: { message: 'Gợi ý sản phẩm dưới 500k', history: [], memory: {} } }),
    request('Create scheduled post', 'POST', '{{baseUrl}}/scheduled-posts', { status: [201, 400, 401], token: 'sellerToken', body: { content: 'Scheduled from Postman', scheduledTime: '{{futureIso}}', timezone: 'Asia/Ho_Chi_Minh', visibility: 'PUBLIC' }, extraTests: saveId('scheduledPostId', ['data.id']) }),
    request('Publish scheduled post', 'POST', '{{baseUrl}}/scheduled-posts/{{scheduledPostId}}/publish', { status: [200, 400, 401, 404], token: 'sellerToken' }),
    request('Get seller status', 'GET', '{{baseUrl}}/seller/status', { status: [200, 401], token: 'sellerToken' }),
    request('Seller stats', 'GET', '{{baseUrl}}/seller/stats', { status: [200, 401, 403], token: 'sellerToken' }),
  ]),
  folder('09 - Core Admin', [
    request('Admin dashboard users list', 'GET', '{{baseUrl}}/admin/users?page=1&limit=10', { status: [200, 401, 403], token: 'adminToken' }),
    request('Admin products list', 'GET', '{{baseUrl}}/admin/products?page=1&limit=10', { status: [200, 401, 403], token: 'adminToken' }),
    request('Admin posts list', 'GET', '{{baseUrl}}/admin/posts?page=1&limit=10', { status: [200, 401, 403], token: 'adminToken' }),
    request('Admin reports list', 'GET', '{{baseUrl}}/admin/reports?page=1&limit=10', { status: [200, 401, 403], token: 'adminToken' }),
    request('Admin categories list', 'GET', '{{baseUrl}}/admin/categories', { status: [200, 401, 403], token: 'adminToken' }),
  ]),
  folder('10 - Separate Admin Backend Optional', [
    request('Admin backend root', 'GET', '{{adminBaseUrl}}', { status: [200, 404] }),
    request('Admin backend login', 'POST', '{{adminBaseUrl}}/auth/login', { status: [200, 401, 403], body: { email: '{{adminEmail}}', password: '{{adminPassword}}' }, extraTests: saveToken('separateAdminToken') }),
    request('Admin backend dashboard', 'GET', '{{adminBaseUrl}}/admin/dashboard', { status: [200, 401, 403], token: 'separateAdminToken' }),
    request('Admin backend reports', 'GET', '{{adminBaseUrl}}/reports', { status: [200, 401, 403], token: 'separateAdminToken' }),
    request('Admin backend seller applications', 'GET', '{{adminBaseUrl}}/seller/applications', { status: [200, 401, 403], token: 'separateAdminToken' }),
  ]),
];

const collection = {
  info: {
    name: 'SoCo API Test Cases',
    description: [
      'Postman/Newman collection for Social Commerce Platform API.',
      'The collection contains public smoke tests, auth/validation fail-paths, protected auth-guard tests, and environment-driven happy-path tests.',
      'Set credentials and entity IDs in the SoCo Local environment before running full happy paths.',
    ].join('\n'),
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  item: folders,
};

const environment = {
  name: 'SoCo Local',
  values: [
    ['baseUrl', 'http://localhost:5000/api'],
    ['adminBaseUrl', 'http://localhost:5001/api'],
    ['searchQuery', 'earbuds'],
    ['buyerEmail', 'buyer@example.com'],
    ['buyerPassword', 'QaUser@123'],
    ['sellerEmail', 'seller@example.com'],
    ['sellerPassword', 'QaUser@123'],
    ['adminEmail', 'admin@soco.local'],
    ['adminPassword', 'Admin@123'],
    ['accessToken', ''],
    ['sellerToken', ''],
    ['adminToken', ''],
    ['separateAdminToken', ''],
    ['badToken', 'not-a-valid-jwt'],
    ['userId', uuid],
    ['sellerId', uuid],
    ['productId', uuid],
    ['postId', uuid],
    ['groupId', uuid],
    ['cartItemId', uuid],
    ['orderId', uuid],
    ['orderItemId', uuid],
    ['conversationId', uuid],
    ['savedItemId', uuid],
    ['scheduledPostId', uuid],
    ['futureIso', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()],
  ].map(([key, value]) => ({ key, value, type: 'default', enabled: true })),
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(collectionPath, `${JSON.stringify(collection, null, 2)}\n`);
fs.writeFileSync(environmentPath, `${JSON.stringify(environment, null, 2)}\n`);

console.log(`Generated ${collectionPath}`);
console.log(`Generated ${environmentPath}`);

