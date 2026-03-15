import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import multer from 'multer';

import prisma from '../src/config/database.js';
import authService from '../src/services/auth.service.js';
import { uploadSellerVerification } from '../src/config/cloudinary.js';

process.env.JWT_SECRET ||= 'test-jwt-secret';

const originalSingle = uploadSellerVerification.single.bind(uploadSellerVerification);

uploadSellerVerification.single = (fieldName) => {
  const parser = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
  }).single(fieldName);

  return (req, res, next) => {
    parser(req, res, (error) => {
      if (error) {
        next(error);
        return;
      }

      if (req.file) {
        req.file.path = `https://example.com/test-uploads/${Date.now()}-${req.file.originalname}`;
        req.file.filename = `test-upload-${Date.now()}`;
        req.file.resource_type = req.file.mimetype?.startsWith('image/') ? 'image' : 'raw';
      }

      next();
    });
  };
};

const { default: app } = await import('../src/app.js');

const cleanupUserData = async (userId) => {
  await prisma.notification.deleteMany({ where: { userId } });
  await prisma.sellerVerification.deleteMany({ where: { userId } });
  await prisma.user.deleteMany({ where: { id: userId } });
};

const cleanupUsersData = async (userIds) => {
  await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.sellerVerification.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
};

const createAuthenticatedUser = async (role = 'BUYER') => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const result = await authService.register({
    email: `${role.toLowerCase()}-api-${suffix}@example.com`,
    username: `${role.toLowerCase()}-api-${suffix}`,
    password: 'StrongPassword123!',
    fullName: `${role} API Test`,
    phone: '0900000000',
    role
  });

  return result;
};

const createAuthenticatedBuyer = async () => createAuthenticatedUser('BUYER');
const createAuthenticatedAdmin = async () => createAuthenticatedUser('ADMIN');

test.after(() => {
  uploadSellerVerification.single = originalSingle;
});

test('API: GET /api/seller/verification returns default pending status for authenticated user', async () => {
  const { user, token } = await createAuthenticatedBuyer();

  try {
    const response = await request(app)
      .get('/api/seller/verification')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.userId, user.id);
    assert.equal(response.body.data.status, 'PENDING');
    assert.equal(response.body.data.completion.step1, false);
    assert.equal(response.body.data.completion.step2, false);
    assert.equal(response.body.data.completion.step3, false);
    assert.equal(response.body.data.completion.allStepsCompleted, false);
  } finally {
    await cleanupUserData(user.id);
  }
});

test('API: seller verification flow supports upload, save 3 steps, and submit for review', async () => {
  const { user, token } = await createAuthenticatedBuyer();

  try {
    const uploadFront = await request(app)
      .post('/api/seller/verification/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('documentType', 'idCardFront')
      .attach('file', Buffer.from('front-image-content'), 'front.jpg');

    assert.equal(uploadFront.status, 201);
    assert.equal(uploadFront.body.success, true);
    assert.equal(uploadFront.body.data.documentType, 'idCardFront');
    assert.match(uploadFront.body.data.url, /^https:\/\/example\.com\/test-uploads\//);

    const uploadBack = await request(app)
      .post('/api/seller/verification/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('documentType', 'idCardBack')
      .attach('file', Buffer.from('back-image-content'), 'back.jpg');

    assert.equal(uploadBack.status, 201);

    const uploadLicense = await request(app)
      .post('/api/seller/verification/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('documentType', 'businessLicense')
      .attach('file', Buffer.from('license-pdf-content'), 'license.pdf');

    assert.equal(uploadLicense.status, 201);

    const step1 = await request(app)
      .put('/api/seller/verification/step-1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        idCardNumber: '012345678901',
        idCardFrontUrl: uploadFront.body.data.url,
        idCardBackUrl: uploadBack.body.data.url,
        dateOfBirth: '1995-01-15',
        address: '123 Le Loi, District 1, HCM'
      });

    assert.equal(step1.status, 200);
    assert.equal(step1.body.success, true);
    assert.equal(step1.body.data.step1Completed, true);
    assert.equal(step1.body.data.status, 'PENDING');

    const step2 = await request(app)
      .put('/api/seller/verification/step-2')
      .set('Authorization', `Bearer ${token}`)
      .send({
        businessName: 'Shop API Test',
        businessType: 'HOUSEHOLD',
        businessLicenseNumber: 'BLN-2026-API',
        businessLicenseUrl: uploadLicense.body.data.url,
        taxCode: 'TAX-API-123'
      });

    assert.equal(step2.status, 200);
    assert.equal(step2.body.data.step2Completed, true);

    const step3 = await request(app)
      .put('/api/seller/verification/step-3')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bankName: 'Vietcombank',
        bankAccountNumber: '0123456789',
        bankAccountName: 'Shop API Test',
        bankBranch: 'HCM Branch'
      });

    assert.equal(step3.status, 200);
    assert.equal(step3.body.data.step3Completed, true);

    const submit = await request(app)
      .post('/api/seller/verification/submit')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(submit.status, 200);
    assert.equal(submit.body.success, true);
    assert.equal(submit.body.data.status, 'REVIEWING');

    const statusAfterSubmit = await request(app)
      .get('/api/seller/verification')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(statusAfterSubmit.status, 200);
    assert.equal(statusAfterSubmit.body.data.status, 'REVIEWING');
    assert.equal(statusAfterSubmit.body.data.completion.allStepsCompleted, true);
    assert.equal(statusAfterSubmit.body.data.businessLicenseUrl, uploadLicense.body.data.url);
  } finally {
    await cleanupUserData(user.id);
  }
});

test('API: submit seller verification returns 400 when steps are incomplete', async () => {
  const { user, token } = await createAuthenticatedBuyer();

  try {
    const response = await request(app)
      .post('/api/seller/verification/submit')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(response.status, 400);
    assert.equal(response.body.success, false);
    assert.match(response.body.message, /All verification steps must be completed/);
  } finally {
    await cleanupUserData(user.id);
  }
});

test('API: admin can approve seller verification and promote user to SELLER', async () => {
  const { user: admin, token: adminToken } = await createAuthenticatedAdmin();
  const { user: candidate } = await createAuthenticatedBuyer();

  try {
    await prisma.sellerVerification.create({
      data: {
        userId: candidate.id,
        step1Completed: true,
        step2Completed: true,
        step3Completed: true,
        idCardNumber: '012345678901',
        idCardFrontUrl: 'https://example.com/id-front.jpg',
        idCardBackUrl: 'https://example.com/id-back.jpg',
        dateOfBirth: new Date('1995-01-15'),
        address: '123 Le Loi, District 1, HCM',
        businessName: 'Approved Seller Shop',
        businessType: 'HOUSEHOLD',
        businessLicenseNumber: 'BLN-APPROVE-01',
        businessLicenseUrl: 'https://example.com/license.pdf',
        taxCode: 'TAX-APPROVE-01',
        bankName: 'Vietcombank',
        bankAccountNumber: '0123456789',
        bankAccountName: 'Approved Seller Shop',
        bankBranch: 'HCM Branch',
        status: 'REVIEWING'
      }
    });

    const response = await request(app)
      .patch(`/api/admin/users/${candidate.id}/verify-seller`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'approve' });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.message, 'Seller verified successfully');
    assert.equal(response.body.data.action, 'approve');
    assert.equal(response.body.data.user.id, candidate.id);
    assert.equal(response.body.data.user.role, 'SELLER');
    assert.equal(response.body.data.user.isVerified, true);

    const persistedUser = await prisma.user.findUnique({
      where: { id: candidate.id },
      select: { role: true, isVerified: true }
    });

    assert.equal(persistedUser.role, 'SELLER');
    assert.equal(persistedUser.isVerified, true);

    const verification = await prisma.sellerVerification.findUnique({
      where: { userId: candidate.id },
      select: { status: true, rejectionReason: true, verifiedBy: true, verifiedAt: true }
    });

    assert.equal(verification.status, 'APPROVED');
    assert.equal(verification.rejectionReason, null);
    assert.equal(verification.verifiedBy, admin.id);
    assert.ok(verification.verifiedAt);

    const notification = await prisma.notification.findFirst({
      where: {
        userId: candidate.id,
        type: 'SELLER_VERIFICATION'
      },
      orderBy: { createdAt: 'desc' }
    });

    assert.ok(notification);
    assert.match(notification.title, /phê duyệt/i);
    assert.equal(notification.actionUrl, '/seller/dashboard');
  } finally {
    await cleanupUsersData([admin.id, candidate.id]);
  }
});

test('API: admin can reject seller verification and keep user as BUYER', async () => {
  const { user: admin, token: adminToken } = await createAuthenticatedAdmin();
  const { user: candidate } = await createAuthenticatedBuyer();

  try {
    await prisma.sellerVerification.create({
      data: {
        userId: candidate.id,
        step1Completed: true,
        step2Completed: true,
        step3Completed: true,
        idCardNumber: '012345678901',
        idCardFrontUrl: 'https://example.com/id-front.jpg',
        idCardBackUrl: 'https://example.com/id-back.jpg',
        dateOfBirth: new Date('1995-01-15'),
        address: '123 Le Loi, District 1, HCM',
        businessName: 'Rejected Seller Shop',
        businessType: 'HOUSEHOLD',
        businessLicenseNumber: 'BLN-REJECT-01',
        businessLicenseUrl: 'https://example.com/license.pdf',
        taxCode: 'TAX-REJECT-01',
        bankName: 'Vietcombank',
        bankAccountNumber: '0123456789',
        bankAccountName: 'Rejected Seller Shop',
        bankBranch: 'HCM Branch',
        status: 'REVIEWING'
      }
    });

    const response = await request(app)
      .patch(`/api/admin/users/${candidate.id}/verify-seller`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        action: 'reject',
        rejectionReason: 'Missing supporting documents'
      });

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.message, 'Seller verification rejected');
    assert.equal(response.body.data.action, 'reject');
    assert.equal(response.body.data.user.id, candidate.id);
    assert.equal(response.body.data.user.role, 'BUYER');

    const persistedUser = await prisma.user.findUnique({
      where: { id: candidate.id },
      select: { role: true, isVerified: true }
    });

    assert.equal(persistedUser.role, 'BUYER');
    assert.equal(persistedUser.isVerified, false);

    const verification = await prisma.sellerVerification.findUnique({
      where: { userId: candidate.id },
      select: { status: true, rejectionReason: true, verifiedBy: true, verifiedAt: true }
    });

    assert.equal(verification.status, 'REJECTED');
    assert.equal(verification.rejectionReason, 'Missing supporting documents');
    assert.equal(verification.verifiedBy, admin.id);
    assert.equal(verification.verifiedAt, null);

    const notification = await prisma.notification.findFirst({
      where: {
        userId: candidate.id,
        type: 'SELLER_VERIFICATION'
      },
      orderBy: { createdAt: 'desc' }
    });

    assert.ok(notification);
    assert.match(notification.title, /từ chối/i);
    assert.match(notification.message, /Missing supporting documents/);
    assert.equal(notification.actionUrl, '/become-seller');
  } finally {
    await cleanupUsersData([admin.id, candidate.id]);
  }
});