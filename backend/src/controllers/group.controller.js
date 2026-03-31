import groupService from '../services/group.service.js';

class GroupController {
  async createGroup(req, res, next) {
    try {
      const group = await groupService.createGroup(req.user.id, req.body);
      res.status(201).json({ success: true, message: 'Group created', data: group });
    } catch (error) {
      next(error);
    }
  }

  async getGroups(req, res, next) {
    try {
      const result = await groupService.getGroups({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        search: req.query.search,
        privacy: req.query.privacy,
        userId: req.user?.id,
      });
      res.json({ success: true, data: result.groups, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getGroupById(req, res, next) {
    try {
      const group = await groupService.getGroupById(req.params.groupId, req.user?.id);
      res.json({ success: true, data: group });
    } catch (error) {
      if (error.message === 'Group not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async getGroupBySlug(req, res, next) {
    try {
      const group = await groupService.getGroupBySlug(req.params.slug, req.user?.id);
      res.json({ success: true, data: group });
    } catch (error) {
      if (error.message === 'Group not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async joinGroup(req, res, next) {
    try {
      const result = await groupService.joinGroup(req.params.groupId, req.user.id);
      const message = result.requested ? 'Join request submitted' : 'Joined group';
      res.json({ success: true, message, data: result });
    } catch (error) {
      if (error.message === 'Group not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === 'Already a member' || error.message === 'Join request already pending') {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async leaveGroup(req, res, next) {
    try {
      const result = await groupService.leaveGroup(req.params.groupId, req.user.id);
      res.json({ success: true, message: 'Left group', data: result });
    } catch (error) {
      if (error.message === 'Not a member') {
        return res.status(400).json({ success: false, message: error.message });
      }
      if (error.message.includes('only admin')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async getMembers(req, res, next) {
    try {
      const result = await groupService.getMembers(req.params.groupId, req.user?.id || null, {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
      });
      res.json({ success: true, data: result.members, pagination: result.pagination });
    } catch (error) {
      if (error.message === 'Must be a group member') {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async updateGroup(req, res, next) {
    try {
      const group = await groupService.updateGroup(req.params.groupId, req.user.id, req.body);
      res.json({ success: true, message: 'Group updated', data: group });
    } catch (error) {
      if (error.message.includes('Only admin')) {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async deleteGroup(req, res, next) {
    try {
      await groupService.deleteGroup(req.params.groupId, req.user.id);
      res.json({ success: true, message: 'Group deleted' });
    } catch (error) {
      if (error.message.includes('Only admin')) {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async updateMemberRole(req, res, next) {
    try {
      const member = await groupService.updateMemberRole(
        req.params.groupId,
        req.user.id,
        req.params.userId,
        req.body.role,
      );
      res.json({ success: true, message: 'Role updated', data: member });
    } catch (error) {
      if (
        error.message.includes('Only admin')
        || error.message.includes('not a member')
        || error.message.includes('only admin')
      ) {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async removeMember(req, res, next) {
    try {
      await groupService.removeMember(req.params.groupId, req.user.id, req.params.userId);
      res.json({ success: true, message: 'Member removed' });
    } catch (error) {
      if (error.message.includes('Insufficient') || error.message.includes('Cannot remove')) {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async getMyGroups(req, res, next) {
    try {
      const result = await groupService.getMyGroups(req.user.id, {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
      });
      res.json({ success: true, data: result.groups, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getGroupPosts(req, res, next) {
    try {
      const { formatPostsForResponse } = await import('../utils/postSerializer.js');
      const result = await groupService.getGroupPosts(
        req.params.groupId,
        req.user?.id || null,
        {
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 20,
        },
      );
      const data = await formatPostsForResponse(result.posts);
      res.json({ success: true, data, pagination: result.pagination });
    } catch (error) {
      if (error.message === 'Must be a group member') {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async createGroupPost(req, res, next) {
    try {
      const { formatPostForResponse } = await import('../utils/postSerializer.js');
      const post = await groupService.createGroupPost(
        req.params.groupId,
        req.user.id,
        req.body,
      );
      const formatted = await formatPostForResponse(post);
      res.status(201).json({ success: true, message: 'Group post created', data: { post: formatted } });
    } catch (error) {
      if (error.message === 'Group not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message.includes('Must be a group member')) {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async getGroupMedia(req, res, next) {
    try {
      const result = await groupService.getGroupMedia(
        req.params.groupId,
        req.user?.id || null,
        { page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 24 },
      );
      res.json({ success: true, data: result.items, pagination: result.pagination });
    } catch (error) {
      if (error.message === 'Must be a group member') {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async getGroupProducts(req, res, next) {
    try {
      const result = await groupService.getGroupProducts(
        req.params.groupId,
        req.user?.id || null,
        { page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20 },
      );
      res.json({ success: true, data: result.items, pagination: result.pagination });
    } catch (error) {
      if (error.message === 'Must be a group member') {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async listJoinRequests(req, res, next) {
    try {
      const result = await groupService.listJoinRequests(req.params.groupId, req.user.id, {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
      });
      res.json({ success: true, data: result.requests, pagination: result.pagination });
    } catch (error) {
      if (error.message === 'Insufficient permissions') {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async approveJoinRequest(req, res, next) {
    try {
      const data = await groupService.reviewJoinRequest(
        req.params.groupId,
        req.params.requestId,
        req.user.id,
        'approve',
      );
      res.json({ success: true, message: 'Request approved', data });
    } catch (error) {
      if (error.message === 'Insufficient permissions') {
        return res.status(403).json({ success: false, message: error.message });
      }
      if (error.message.includes('not found') || error.message.includes('already reviewed')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async rejectJoinRequest(req, res, next) {
    try {
      const data = await groupService.reviewJoinRequest(
        req.params.groupId,
        req.params.requestId,
        req.user.id,
        'reject',
      );
      res.json({ success: true, message: 'Request rejected', data });
    } catch (error) {
      if (error.message === 'Insufficient permissions') {
        return res.status(403).json({ success: false, message: error.message });
      }
      if (error.message.includes('not found') || error.message.includes('already reviewed')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async createInvite(req, res, next) {
    try {
      const invite = await groupService.createInvite(req.params.groupId, req.user.id, req.body || {});
      res.status(201).json({ success: true, message: 'Invite created', data: invite });
    } catch (error) {
      if (error.message === 'Insufficient permissions') {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async listInvites(req, res, next) {
    try {
      const invites = await groupService.listInvites(req.params.groupId, req.user.id);
      res.json({ success: true, data: invites });
    } catch (error) {
      if (error.message === 'Insufficient permissions') {
        return res.status(403).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async revokeInvite(req, res, next) {
    try {
      await groupService.revokeInvite(req.params.groupId, req.params.inviteId, req.user.id);
      res.json({ success: true, message: 'Invite revoked' });
    } catch (error) {
      if (error.message === 'Insufficient permissions') {
        return res.status(403).json({ success: false, message: error.message });
      }
      if (error.message === 'Invite not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async joinByInvite(req, res, next) {
    try {
      const result = await groupService.joinByInvite(req.body.code, req.user.id);
      res.json({
        success: true,
        message: result.requested ? 'Join request submitted' : 'Joined group',
        data: result,
      });
    } catch (error) {
      if (error.message.includes('Invite') || error.message.includes('Already a member')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
}

export default new GroupController();

