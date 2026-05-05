import * as blockService from '../services/block.service.js';

export async function block(req, res) {
  try {
    const requesterId = req.user.id;
    const { targetUserId } = req.body;

    await blockService.blockUser(requesterId, targetUserId);

    return res.status(201).json({ success: true, message: 'User blocked' });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function unblock(req, res) {
  try {
    const requesterId = req.user.id;
    const { targetUserId } = req.params;

    await blockService.unblockUser(requesterId, targetUserId);

    return res.json({ success: true, message: 'User unblocked' });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

export async function list(req, res) {
  try {
    const requesterId = req.user.id;
    const list = await blockService.listBlockedUsers(requesterId);
    return res.json({ success: true, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to list blocked users' });
  }
}
