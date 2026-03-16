import groupService from '../services/group.service.js';

class GroupController {
  async listGroups(req, res, next) {
    try {
      const { q, page, limit, membership } = req.query;
      const result = await groupService.listGroups({
        q,
        page,
        limit,
        membership,
        userId: req.user?.id
      });

      res.json({
        success: true,
        data: result.groups,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyGroups(req, res, next) {
    try {
      const { q, page, limit } = req.query;
      const result = await groupService.listGroups({
        q,
        page,
        limit,
        membership: 'joined',
        userId: req.user.id
      });

      res.json({
        success: true,
        data: result.groups,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async getGroupById(req, res, next) {
    try {
      const { id } = req.params;
      const group = await groupService.getGroupById(id, req.user?.id);

      res.json({
        success: true,
        data: group
      });
    } catch (error) {
      next(error);
    }
  }

  async createGroup(req, res, next) {
    try {
      const group = await groupService.createGroup(req.user.id, req.body);

      res.status(201).json({
        success: true,
        message: 'Group created successfully',
        data: group
      });
    } catch (error) {
      next(error);
    }
  }

  async joinGroup(req, res, next) {
    try {
      const { id } = req.params;
      const group = await groupService.joinGroup(id, req.user.id);

      res.json({
        success: true,
        message: 'Joined group successfully',
        data: group
      });
    } catch (error) {
      next(error);
    }
  }

  async leaveGroup(req, res, next) {
    try {
      const { id } = req.params;
      const result = await groupService.leaveGroup(id, req.user.id);

      res.json({
        success: true,
        message: 'Left group successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getGroupMembers(req, res, next) {
    try {
      const { id } = req.params;
      const { page, limit, q } = req.query;
      const result = await groupService.getGroupMembers(id, { page, limit, q });

      res.json({
        success: true,
        data: result.members,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMemberRole(req, res, next) {
    try {
      const { id: groupId, userId } = req.params;
      const { role } = req.body;
      const member = await groupService.updateMemberRole(groupId, req.user.id, userId, role);

      res.json({
        success: true,
        message: 'Member role updated successfully',
        data: member
      });
    } catch (error) {
      next(error);
    }
  }

  async kickMember(req, res, next) {
    try {
      const { id: groupId, userId } = req.params;
      const result = await groupService.kickMember(groupId, req.user.id, userId);

      res.json({
        success: true,
        message: 'Member removed successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async inviteMember(req, res, next) {
    try {
      const { id: groupId } = req.params;
      const { userId, role } = req.body;
      const result = await groupService.inviteMember(groupId, req.user.id, userId, role || 'MEMBER');

      res.json({
        success: true,
        message: result.invited ? 'Member invited successfully' : 'User is already a member',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePostApprovalSetting(req, res, next) {
    try {
      const { id: groupId } = req.params;
      const { isApprovedPosts } = req.body;
      const result = await groupService.updatePostApprovalSetting(groupId, req.user.id, isApprovedPosts);

      res.json({
        success: true,
        message: 'Group post approval setting updated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new GroupController();
