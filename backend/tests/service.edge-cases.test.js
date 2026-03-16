import test from 'node:test';
import assert from 'node:assert/strict';

import prisma from '../src/config/database.js';
import { verifySeller } from '../src/services/admin.service.js';
import {
  submitVerificationStep1,
  submitVerificationForReview,
  getVerificationStatus
} from '../src/services/seller.service.js';

const uniq = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createUser = async ({ role = 'BUYER', isVerified = false } = {}) => {
  const token = uniq(role.toLowerCase());
  return prisma.user.create({
    data: {
      email: `${token}@example.com`,
      username: token,
      passwordHash: 'test-hash',
      fullName: `${role} ${token}`,
      role,
      isActive: true,
      isVerified
    }
  });
};

const cleanupUsers = async (ids) => {
  await prisma.notification.deleteMany({ where: { userId: { in: ids } } });
  await prisma.sellerVerification.deleteMany({ where: { userId: { in: ids } } });
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
};

test('service edge: admin verifySeller throws for invalid action', async () => {
  const admin = await createUser({ role: 'ADMIN', isVerified: true });
  const candidate = await createUser({ role: 'BUYER' });

  try {
    await assert.rejects(
      () => verifySeller(admin.id, candidate.id, 'invalid-action'),
      /Invalid action/
    );
  } finally {
    await cleanupUsers([admin.id, candidate.id]);
  }
});

test('service edge: admin verifySeller throws when target user does not exist', async () => {
  const admin = await createUser({ role: 'ADMIN', isVerified: true });

  try {
    await assert.rejects(
      () => verifySeller(admin.id, '00000000-0000-0000-0000-000000000000', 'approve'),
      /User not found/
    );
  } finally {
    await cleanupUsers([admin.id]);
  }
});

test('service edge: seller step edit on REVIEWING resets verification back to PENDING', async () => {
  const user = await createUser({ role: 'BUYER' });

  try {
    await prisma.sellerVerification.create({
      data: {
        userId: user.id,
        status: 'REVIEWING',
        rejectionReason: 'Need update',
        verifiedBy: user.id,
        verifiedAt: new Date(),
        step1Completed: true
      }
    });

    const updated = await submitVerificationStep1(user.id, {
      idCardNumber: '012345678901',
      idCardFrontUrl: 'https://example.com/front.jpg',
      idCardBackUrl: 'https://example.com/back.jpg',
      dateOfBirth: '1995-01-15',
      address: '123 Le Loi, District 1, HCM'
    });

    assert.equal(updated.status, 'PENDING');
    assert.equal(updated.rejectionReason, null);
    assert.equal(updated.verifiedBy, null);
    assert.equal(updated.verifiedAt, null);
    assert.equal(updated.step1Completed, true);
  } finally {
    await cleanupUsers([user.id]);
  }
});

test('service edge: seller step edit is blocked after verification APPROVED', async () => {
  const user = await createUser({ role: 'SELLER', isVerified: true });

  try {
    await prisma.sellerVerification.create({
      data: {
        userId: user.id,
        status: 'APPROVED',
        step1Completed: true,
        step2Completed: true,
        step3Completed: true,
        idCardNumber: '012345678901',
        idCardFrontUrl: 'https://example.com/front.jpg',
        idCardBackUrl: 'https://example.com/back.jpg',
        dateOfBirth: new Date('1995-01-15'),
        address: '123 Le Loi, District 1, HCM',
        businessName: 'Shop Approved',
        businessType: 'HOUSEHOLD',
        bankName: 'VCB',
        bankAccountNumber: '0123456789',
        bankAccountName: 'Shop Approved'
      }
    });

    await assert.rejects(
      () => submitVerificationStep1(user.id, {
        idCardNumber: '999999999999',
        idCardFrontUrl: 'https://example.com/new-front.jpg',
        idCardBackUrl: 'https://example.com/new-back.jpg',
        dateOfBirth: '1996-01-15',
        address: 'New Address'
      }),
      /already been approved/
    );
  } finally {
    await cleanupUsers([user.id]);
  }
});

test('service edge: submitVerificationForReview fails when step flags true but required data missing', async () => {
  const user = await createUser({ role: 'BUYER' });

  try {
    await prisma.sellerVerification.create({
      data: {
        userId: user.id,
        status: 'PENDING',
        step1Completed: true,
        step2Completed: true,
        step3Completed: true,
        // intentionally leave missing fields to hit validation branch in service
        businessName: 'Only partial business data',
        bankName: 'VCB'
      }
    });

    await assert.rejects(
      () => submitVerificationForReview(user.id),
      /Step 1 information is incomplete/
    );

    const current = await getVerificationStatus(user.id);
    assert.equal(current.status, 'PENDING');
  } finally {
    await cleanupUsers([user.id]);
  }
});
