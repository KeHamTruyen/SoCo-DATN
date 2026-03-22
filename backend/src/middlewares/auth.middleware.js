import authService from '../services/auth.service.js';
import { isTokenBlacklisted } from '../utils/tokenBlacklist.js';

/**
 * Protect routes – Verify JWT token + check blacklist
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    if (isTokenBlacklisted(token)) {
      return res.status(401).json({ success: false, message: 'Token has been revoked' });
    }

    try {
      const decoded = authService.verifyToken(token);
      const user = await authService.getProfile(decoded.id);

      if (!user || !user.isActive) {
        return res.status(401).json({ success: false, message: 'User no longer exists or is deactivated' });
      }

      req.user = user;

      if (req.user.role === 'ADMIN') {
        return res.status(403).json({
          success: false,
          message:
            'Administrator accounts use the admin application. This API is for buyers and sellers only.',
        });
      }

      next();
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Restrict to specific roles
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
    }
    next();
  };
};

/** Authenticated buyers/sellers (admin is blocked earlier in `protect`). */
export const restrictToMember = restrictTo('BUYER', 'SELLER');

/**
 * Optional auth – Attach user if token exists, but don't block
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (token && !isTokenBlacklisted(token)) {
      try {
        const decoded = authService.verifyToken(token);
        const user = await authService.getProfile(decoded.id);
        if (user && user.isActive && user.role !== 'ADMIN') {
          req.user = user;
        }
      } catch {
        // Token invalid, continue without user
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
