import authService from '../services/auth.service.js';
import { isTokenBlacklisted } from '../utils/tokenBlacklist.js';

/**
 * Protect routes – Verify JWT token + check blacklist (buyers/sellers only)
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

      if (decoded.principal === 'admin') {
        return res.status(403).json({
          success: false,
          message:
            'Administrator accounts use the admin API (/api/admin). This route is for buyers and sellers only.',
        });
      }

      const user = await authService.getProfile(decoded.id);

      if (!user || !user.isActive) {
        return res.status(401).json({ success: false, message: 'User no longer exists or is deactivated' });
      }

      req.user = user;

      next();
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Protect admin routes – JWT must be issued for platform admins (`principal: admin`)
 */
export const protectAdmin = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.adminToken) {
      token = req.cookies.adminToken;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    if (isTokenBlacklisted(token)) {
      return res.status(401).json({ success: false, message: 'Token has been revoked' });
    }

    try {
      const decoded = authService.verifyToken(token);

      if (decoded.principal !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required. Sign in via POST /api/admin/auth/login.',
        });
      }

      const admin = await authService.getAdminProfile(decoded.id);

      if (!admin || !admin.isActive) {
        return res.status(401).json({ success: false, message: 'Admin account no longer exists or is deactivated' });
      }

      req.admin = admin;
      next();
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Restrict to specific roles (consumer users only; use after `protect`)
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
    }
    next();
  };
};

/** Authenticated buyers/sellers */
export const restrictToMember = restrictTo('BUYER', 'SELLER');

/**
 * Optional auth – Attach user if token exists, but don't block
 */
/**
 * Authenticated buyer/seller OR platform admin (for shared routes e.g. signed ID doc URL).
 * Sets exactly one of `req.user` or `req.admin`.
 */
export const protectUserOrAdmin = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    } else if (req.cookies.adminToken) {
      token = req.cookies.adminToken;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    if (isTokenBlacklisted(token)) {
      return res.status(401).json({ success: false, message: 'Token has been revoked' });
    }

    try {
      const decoded = authService.verifyToken(token);

      if (decoded.principal === 'admin') {
        const admin = await authService.getAdminProfile(decoded.id);
        if (!admin || !admin.isActive) {
          return res.status(401).json({ success: false, message: 'Admin account no longer exists or is deactivated' });
        }
        req.admin = admin;
        return next();
      }

      const user = await authService.getProfile(decoded.id);
      if (!user || !user.isActive) {
        return res.status(401).json({ success: false, message: 'User no longer exists or is deactivated' });
      }
      req.user = user;
      next();
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  } catch (error) {
    next(error);
  }
};

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
        if (decoded.principal === 'admin') {
          // Consumer optional auth ignores admin tokens
        } else {
          const user = await authService.getProfile(decoded.id);
          if (user && user.isActive) {
            req.user = user;
          }
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
