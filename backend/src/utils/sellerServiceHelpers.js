import { signedAuthenticatedImageUrl } from '../config/cloudinary.js';
import { decryptSensitive, maskAccountOrId } from './sensitiveCrypto.js';

/**
 * Validates the full seller registration payload (single-shot wizard).
 */
export function validateCompleteRegistrationPayload(p) {
  if (!p || typeof p !== 'object') {
    throw Object.assign(new Error('Invalid registration payload'), { statusCode: 400 });
  }
  const idNum = typeof p.idNumber === 'string' ? p.idNumber.trim() : '';
  if (!idNum) {
    throw Object.assign(new Error('ID number is required'), { statusCode: 400 });
  }
  const shopName = typeof p.shopName === 'string' ? p.shopName.trim() : '';
  if (!shopName) {
    throw Object.assign(new Error('Shop name is required'), { statusCode: 400 });
  }
  if (!p.bankName || !String(p.bankName).trim()) {
    throw Object.assign(new Error('Bank name is required'), { statusCode: 400 });
  }
  const acc = typeof p.accountNumber === 'string' ? p.accountNumber.trim() : '';
  if (!acc) {
    throw Object.assign(new Error('Bank account number is required'), { statusCode: 400 });
  }
  if (!p.accountHolderName || !String(p.accountHolderName).trim()) {
    throw Object.assign(new Error('Account holder name is required'), { statusCode: 400 });
  }
}

/**
 * Public shop JSON on User (no avatar/cover, no plaintext CCCD/STK).
 * Built from step3 `registrationMeta` so the snapshot matches the wizard (FE sends full shop fields).
 */
export function normalizeShopSnapshot(meta) {
  if (!meta || typeof meta !== 'object') return null;
  const t = (v) => (typeof v === 'string' ? v.trim() : v);
  const clip = (s, max) => {
    const x = t(s);
    if (x == null || x === '') return null;
    return x.length > max ? x.slice(0, max) : x;
  };
  const o = {
    shopName: clip(meta.shopName, 255),
    shopCategory: clip(meta.shopCategory, 100),
    shopDescription: clip(meta.shopDescription, 5000),
    shopAddress: clip(meta.shopAddress, 500),
    contactPhone: clip(meta.contactPhone, 40),
    idType: clip(meta.idType, 50),
  };
  if (!Object.values(o).some(Boolean)) return null;
  return o;
}

export function sanitizeVerificationForAdminList(v) {
  const idDec = decryptSensitive(v.idCardNumber);
  const bankDec = decryptSensitive(v.bankAccountNumber);
  return {
    ...v,
    idCardNumber: maskAccountOrId(idDec),
    bankAccountNumber: maskAccountOrId(bankDec),
    idCardFrontSignedUrl: signedAuthenticatedImageUrl(v.idCardFrontPublicId) || v.idCardFrontUrl,
    idCardBackSignedUrl: signedAuthenticatedImageUrl(v.idCardBackPublicId) || v.idCardBackUrl,
  };
}
