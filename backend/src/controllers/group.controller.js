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
      res.json({ success: true, message: 'Joined group', data: result });
    } catch (error) {
      if (error.message === 'Group not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === 'Already a member') {
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
      const result = await groupService.getMembers(req.params.groupId, {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
      });
      res.json({ success: true, data: result.members, pagination: result.pagination });
    } catch (error) {
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
      if (error.message.includes('Only admin') || error.message.includes('not a member')) {
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
}

export default new GroupController();
