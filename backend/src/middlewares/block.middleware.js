import * as blockService from '../services/block.service.js';

function extractTargetId(req) {
  return req.params.targetUserId || req.params.userId || req.body.targetUserId || req.body.userId || req.query.userId || null;
}

export async function ensureNotBlocked(req, res, next) {
  const requesterId = req.user && req.user.id;
  const targetId = extractTargetId(req);

  if (!requesterId || !targetId) return next();

  const blocked = await blockService.isBlockedBetween(requesterId, targetId);
  if (blocked) {
    return res.status(403).json({ success: false, message: 'You are blocked from interacting with this user' });
  }

  next();
}
