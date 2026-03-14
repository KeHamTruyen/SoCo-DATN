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
}

export default new UserController();
