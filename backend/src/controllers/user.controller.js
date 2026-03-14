import userService from '../services/user.service.js';

class UserController {
  /**
   * Search users
   * GET /api/users/search?q=...&role=SELLER&limit=20
   */
  async searchUsers(req, res, next) {
    try {
      const { q, role, limit } = req.query;
      const users = await userService.searchUsers({ q, role, limit });

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user profile by username
   * GET /api/users/username/:username
   */
  async getUserByUsername(req, res, next) {
    try {
      const { username } = req.params;

      const user = await userService.getUserByUsername(username);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user profile by ID
   * GET /api/users/:userId
   */
  async getUserById(req, res, next) {
    try {
      const { userId } = req.params;

      const user = await userService.getUserById(userId);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/users/me
   */
  async getMyProfile(req, res, next) {
    try {
      const userId = req.user.id;

      const user = await userService.getUserById(userId);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   * PUT /api/users/me
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { fullName, username, phone, bio, avatarUrl } = req.body;

      const user = await userService.updateProfile(userId, {
        fullName,
        username,
        phone,
        bio,
        avatarUrl
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Follow user
   * POST /api/users/:userId/follow
   */
  async followUser(req, res, next) {
    try {
      const followerId = req.user.id;
      const { userId } = req.params;

      const follow = await userService.followUser(followerId, userId);

      res.status(201).json({
        success: true,
        message: 'Followed user successfully',
        data: follow
      });
    } catch (error) {
      if (error.message === 'You cannot follow yourself' || error.message === 'Already following this user') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      next(error);
    }
  }

  /**
   * Unfollow user
   * DELETE /api/users/:userId/follow
   */
  async unfollowUser(req, res, next) {
    try {
      const followerId = req.user.id;
      const { userId } = req.params;

      const result = await userService.unfollowUser(followerId, userId);

      res.json({
        success: true,
        message: 'Unfollowed user successfully',
        data: result
      });
    } catch (error) {
      if (error.message === 'Follow relationship not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      next(error);
    }
  }

  /**
   * Get followers list
   * GET /api/users/:userId/followers
   */
  async getFollowers(req, res, next) {
    try {
      const { userId } = req.params;
      const { page, limit } = req.query;

      const result = await userService.getFollowers(userId, { page, limit });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get following list
   * GET /api/users/:userId/following
   */
  async getFollowing(req, res, next) {
    try {
      const { userId } = req.params;
      const { page, limit } = req.query;

      const result = await userService.getFollowing(userId, { page, limit });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
