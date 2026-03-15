import test from 'node:test';
import assert from 'node:assert/strict';

import prisma from '../src/config/database.js';
import notificationService from '../src/services/notification.service.js';

test('notifyOrderStatusChange builds correct payload', async () => {
  const originalCreateNotification = notificationService.createNotification;
  let captured = null;

  notificationService.createNotification = async (payload) => {
    captured = payload;
    return { id: 'notif-1', ...payload };
  };

  try {
    await notificationService.notifyOrderStatusChange('order-123', 'buyer-123', 'SHIPPING');

    assert.ok(captured);
    assert.equal(captured.userId, 'buyer-123');
    assert.equal(captured.type, 'ORDER');
    assert.equal(captured.title, 'Cập nhật đơn hàng');
    assert.equal(captured.message, 'Đơn hàng đang được giao');
    assert.equal(captured.relatedOrderId, 'order-123');
    assert.equal(captured.actionUrl, '/orders/order-123');
  } finally {
    notificationService.createNotification = originalCreateNotification;
  }
});

test('notifyReportStatusUpdated builds reporter payload', async () => {
  const originalCreateNotification = notificationService.createNotification;
  let captured = null;

  notificationService.createNotification = async (payload) => {
    captured = payload;
    return { id: 'notif-2', ...payload };
  };

  try {
    await notificationService.notifyReportStatusUpdated('report-123', 'user-321', 'RESOLVED');

    assert.ok(captured);
    assert.equal(captured.userId, 'user-321');
    assert.equal(captured.type, 'REPORT');
    assert.equal(captured.title, 'Cập nhật báo cáo');
    assert.match(captured.message, /đã được xử lý/);
    assert.equal(captured.actionUrl, '/reports/report-123');
  } finally {
    notificationService.createNotification = originalCreateNotification;
  }
});

test('notifyAdminsNewReport creates notification for all active admins', async () => {
  const originalFindMany = prisma.user.findMany;
  const originalFindUnique = prisma.user.findUnique;
  const originalCreateNotification = notificationService.createNotification;

  const sentTo = [];

  prisma.user.findMany = async () => [{ id: 'admin-1' }, { id: 'admin-2' }];
  prisma.user.findUnique = async () => ({ fullName: 'Reporter Name', username: 'reporter' });
  notificationService.createNotification = async (payload) => {
    sentTo.push(payload.userId);
    return { id: `notif-${payload.userId}`, ...payload };
  };

  try {
    await notificationService.notifyAdminsNewReport('report-1', 'user-1', 'POST', 'SPAM');

    assert.deepEqual(sentTo.sort(), ['admin-1', 'admin-2']);
  } finally {
    prisma.user.findMany = originalFindMany;
    prisma.user.findUnique = originalFindUnique;
    notificationService.createNotification = originalCreateNotification;
  }
});
