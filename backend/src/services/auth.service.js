import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import emailService from './email.service.js';
import { generateOtp, generateSecureToken } from '../utils/otp.js';
import { blacklistToken } from '../utils/tokenBlacklist.js';

const USER_SELECT = {
  id: true, email: true, username: true, fullName: true, phone: true,
  avatarUrl: true, coverImage: true, bio: true, address: true,
  role: true, isVerified: true, isActive: true, createdAt: true,
  privacySettings: true,
  _count: { select: { followers: true, following: true, products: true, posts: true } },
};

class AuthService {
  // ─── UC1.1 – Register ───────────────────────────────────────

  async register({ email, username, password, fullName, phone, role = 'BUYER' }) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      throw Object.assign(new Error(
        existing.email === email ? 'Email already registered' : 'Username already taken'
      ), { statusCode: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email, username, passwordHash, fullName, phone, role,
        isVerified: false,
        isActive: true,
      },
      select: USER_SELECT,
    });

    const { otp, tempToken } = await this._generateEmailOtp(user.id);

    try {
      await emailService.sendVerificationOtpEmail(email, otp);
    } catch {
      // Email send failure is non-blocking; user can request resend
    }

    return {
      message: 'Registration successful. Please check your email for the 6-digit verification code.',
      tempToken,
    };
  }

  // ─── UC1.1 – Verify email ──────────────────────────────────

  async verifyEmail(tempToken, otpCode) {
    const payload = this._verifyPurposeToken(tempToken, 'email-verify');

    const valid = await bcrypt.compare(otpCode, payload.otpHash);
    if (!valid) {
      throw Object.assign(new Error('Invalid or expired verification code'), { statusCode: 400 });
    }

    const user = await prisma.user.update({
      where: { id: payload.id },
      data: { isVerified: true },
      select: USER_SELECT,
    });

    const authToken = this.generateToken(user);
    return { user, accessToken: authToken };
  }

  // ─── UC1.1 – Resend verification email ─────────────────────

  async resendVerification(email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Prevent email enumeration — return success-like response
      return { message: 'If that email is registered, a new code has been sent.' };
    }
    if (user.isVerified) {
      throw Object.assign(new Error('Account is already verified'), { statusCode: 400 });
    }

    const { otp, tempToken } = await this._generateEmailOtp(user.id);
    await emailService.sendVerificationOtpEmail(email, otp);

    return { message: 'A new verification code has been sent to your email.', tempToken };
  }

  // ─── Helper: generate 6-digit OTP embedded in a signed JWT ─

  async _generateEmailOtp(userId) {
    const otp = generateOtp(6);
    const otpHash = await bcrypt.hash(otp, 10);
    // Embed the hash inside a short-lived signed token — no DB column needed
    const tempToken = jwt.sign(
      { id: userId, purpose: 'email-verify', otpHash },
      process.env.JWT_SECRET,
      { expiresIn: '10m' },
    );
    return { otp, tempToken };
  }

  // ─── UC1.2 – Login ─────────────────────────────────────────

  async login({ email, password }) {
    const user = await prisma.user.findFirst({
      where: { OR: [{ email }, { username: email }] },
      include: { twoFactorAuth: true },
    });

    if (!user) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
    if (!user.isActive) throw Object.assign(new Error('Account has been deactivated'), { statusCode: 403 });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });

    if (!user.isVerified) {
      const { otp, tempToken } = await this._generateEmailOtp(user.id);
      try { await emailService.sendVerificationOtpEmail(user.email, otp); } catch {}
      throw Object.assign(
        new Error('Please verify your email before logging in'),
        { statusCode: 403, data: { email: user.email, tempToken } },
      );
    }

    // If 2FA is enabled, send OTP instead of returning token
    if (user.twoFactorAuth?.isEnabled) {
      const otp = generateOtp();
      const otpHash = await bcrypt.hash(otp, 10);

      await prisma.twoFactorAuth.update({
        where: { userId: user.id },
        data: { secretKey: otpHash },
      });

      await emailService.sendOtpEmail(user.email, otp);

      const tempToken = this._signPurposeToken(user.id, '2fa-pending', '10m');

      return {
        requires2FA: true,
        tempToken,
        message: 'OTP sent to your email',
      };
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

    const { passwordHash, twoFactorAuth, ...safeUser } = user;
    const token = this.generateToken(safeUser);

    return { user: safeUser, accessToken: token };
  }

  // ─── UC1.3 – Verify 2FA OTP ────────────────────────────────

  async verify2FA(tempToken, otpCode) {
    const payload = this._verifyPurposeToken(tempToken, '2fa-pending');

    const tfa = await prisma.twoFactorAuth.findUnique({ where: { userId: payload.id } });
    if (!tfa || !tfa.isEnabled) {
      throw Object.assign(new Error('2FA is not enabled'), { statusCode: 400 });
    }

    const valid = await bcrypt.compare(otpCode, tfa.secretKey);
    if (!valid) throw Object.assign(new Error('Invalid or expired OTP'), { statusCode: 401 });

    // Clear OTP after successful verification
    await prisma.twoFactorAuth.update({
      where: { userId: payload.id },
      data: { secretKey: 'used' },
    });

    await prisma.user.update({ where: { id: payload.id }, data: { lastLogin: new Date() } });

    const user = await this.getProfile(payload.id);
    const token = this.generateToken(user);

    return { user, accessToken: token };
  }

  // ─── UC1.3 – Enable 2FA ────────────────────────────────────

  async enable2FA(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const backupCodes = Array.from({ length: 8 }, () => generateSecureToken().slice(0, 8));

    await prisma.twoFactorAuth.upsert({
      where: { userId },
      create: { userId, secretKey: otpHash, backupCodes, isEnabled: false },
      update: { secretKey: otpHash, backupCodes, isEnabled: false },
    });

    await emailService.sendOtpEmail(user.email, otp);

    return { message: 'OTP sent to your email. Submit it to confirm 2FA activation.', backupCodes };
  }

  async confirm2FAEnable(userId, otpCode) {
    const tfa = await prisma.twoFactorAuth.findUnique({ where: { userId } });
    if (!tfa) throw Object.assign(new Error('Please initiate 2FA setup first'), { statusCode: 400 });

    const valid = await bcrypt.compare(otpCode, tfa.secretKey);
    if (!valid) throw Object.assign(new Error('Invalid OTP'), { statusCode: 401 });

    await prisma.twoFactorAuth.update({
      where: { userId },
      data: { isEnabled: true, secretKey: 'confirmed' },
    });

    return { message: '2FA has been enabled', backupCodes: tfa.backupCodes };
  }

  // ─── UC1.3 – Disable 2FA ───────────────────────────────────

  async disable2FA(userId, password) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw Object.assign(new Error('Invalid password'), { statusCode: 401 });

    await prisma.twoFactorAuth.deleteMany({ where: { userId } });

    return { message: '2FA has been disabled' };
  }

  // ─── UC1.4 – Forgot password ───────────────────────────────

  async forgotPassword(email) {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    const genericMsg = 'If that email is registered, a password reset link has been sent';
    if (!user || !user.isActive) return { message: genericMsg };

    // Invalidate all previous tokens
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    const token = generateSecureToken();
    const tokenHash = await bcrypt.hash(token, 10);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    try {
      await emailService.sendPasswordResetEmail(email, token);
    } catch {
      // non-blocking
    }

    return { message: genericMsg };
  }

  // ─── UC1.4 – Reset password ────────────────────────────────

  async resetPassword(token, newPassword) {
    // Find all unexpired, unused tokens
    const resetTokens = await prisma.passwordResetToken.findMany({
      where: { used: false, expiresAt: { gt: new Date() } },
    });

    let matchedToken = null;
    for (const rt of resetTokens) {
      const valid = await bcrypt.compare(token, rt.token);
      if (valid) { matchedToken = rt; break; }
    }

    if (!matchedToken) {
      throw Object.assign(new Error('Invalid or expired reset token'), { statusCode: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: matchedToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: matchedToken.id },
        data: { used: true },
      }),
    ]);

    return { message: 'Password has been reset successfully' };
  }

  // ─── UC1.5 – Logout ────────────────────────────────────────

  logout(token) {
    if (token) blacklistToken(token);
    return { message: 'Logout successful' };
  }

  // ─── UC1.6 – Get profile ───────────────────────────────────

  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: USER_SELECT,
    });
    if (!user) throw new Error('User not found');
    return user;
  }

  // ─── UC1.6 – Update profile ────────────────────────────────

  async updateProfile(userId, data) {
    const { email, username, fullName, phone, bio, avatarUrl, coverImage, address } = data;

    if (email || username) {
      const conditions = [];
      if (email) conditions.push({ email });
      if (username) conditions.push({ username });

      const existing = await prisma.user.findFirst({
        where: { AND: [{ id: { not: userId } }, { OR: conditions }] },
      });
      if (existing) {
        throw Object.assign(new Error(
          existing.email === email ? 'Email already in use' : 'Username already taken'
        ), { statusCode: 409 });
      }
    }

    const updateData = {};
    if (email) updateData.email = email;
    if (username) updateData.username = username;
    if (fullName) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (address !== undefined) updateData.address = address;

    return prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: USER_SELECT,
    });
  }

  // ─── UC1.7 – Privacy settings ──────────────────────────────

  async getPrivacySettings(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { privacySettings: true },
    });
    if (!user) throw new Error('User not found');

    const defaults = {
      profileVisibility: 'public',
      postVisibility: 'public',
      messagePermission: 'everyone',
    };

    return { ...defaults, ...(user.privacySettings || {}) };
  }

  async updatePrivacySettings(userId, settings) {
    const allowed = ['profileVisibility', 'postVisibility', 'messagePermission'];
    const validValues = {
      profileVisibility: ['public', 'followers', 'private'],
      postVisibility: ['public', 'followers', 'private'],
      messagePermission: ['everyone', 'followers', 'nobody'],
    };

    const current = await this.getPrivacySettings(userId);
    const updated = { ...current };

    for (const key of allowed) {
      if (settings[key] !== undefined) {
        if (!validValues[key].includes(settings[key])) {
          throw Object.assign(new Error(`Invalid value for ${key}`), { statusCode: 400 });
        }
        updated[key] = settings[key];
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { privacySettings: updated },
    });

    return updated;
  }

  // ─── UC1.6 – Change password ────────────────────────────────

  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw Object.assign(new Error('Current password is incorrect'), { statusCode: 401 });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    return { message: 'Password changed successfully' };
  }

  // ─── Token helpers ──────────────────────────────────────────

  generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' },
    );
  }

  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  _signPurposeToken(userId, purpose, expiresIn) {
    return jwt.sign({ id: userId, purpose }, process.env.JWT_SECRET, { expiresIn });
  }

  _verifyPurposeToken(token, expectedPurpose) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload.purpose !== expectedPurpose) throw new Error('Token purpose mismatch');
      return payload;
    } catch {
      throw Object.assign(new Error('Invalid or expired token'), { statusCode: 400 });
    }
  }
}

export default new AuthService();
