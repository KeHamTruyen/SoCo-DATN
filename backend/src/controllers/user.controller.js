import userService from "../services/user.service.js";

class UserController {
    async getUserByUsername(req, res, next) {
        try {
            const viewerId = req.user?.id || null;
            const user = await userService.getUserByUsername(
                req.params.username,
                viewerId,
            );
            res.json({ success: true, data: user });
        } catch (error) {
            if (error.message === "User not found") {
                return res
                    .status(404)
                    .json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    async getUserById(req, res, next) {
        try {
            const viewerId = req.user?.id || null;
            const user = await userService.getUserById(
                req.params.userId,
                viewerId,
            );
            res.json({ success: true, data: user });
        } catch (error) {
            if (error.message === "User not found") {
                return res
                    .status(404)
                    .json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    async getMyProfile(req, res, next) {
        try {
            const user = await userService.getUserById(req.user.id);
            res.json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req, res, next) {
        try {
            const {
                fullName,
                username,
                phone,
                bio,
                avatarUrl,
                coverImage,
                address,
                shopInformation,
            } = req.body;
            const user = await userService.updateProfile(req.user.id, {
                fullName,
                username,
                phone,
                bio,
                avatarUrl,
                coverImage,
                address,
                shopInformation,
            });
            res.json({
                success: true,
                message: "Profile updated successfully",
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }

    // ─── Follow (UC2.5) ───────────────────────────────────

    async toggleFollow(req, res, next) {
        try {
            const result = await userService.toggleFollow(
                req.user.id,
                req.params.userId,
            );
            res.json({
                success: true,
                message: result.followed
                    ? "Followed successfully"
                    : "Unfollowed successfully",
                data: result,
            });
        } catch (error) {
            if (error.message === "Cannot follow yourself") {
                return res
                    .status(400)
                    .json({ success: false, message: error.message });
            }
            if (error.message === "User not found") {
                return res
                    .status(404)
                    .json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    async getFollowers(req, res, next) {
        try {
            const result = await userService.getFollowers(req.params.userId, {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
            });
            res.json({
                success: true,
                data: result.users,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    async getFollowing(req, res, next) {
        try {
            const result = await userService.getFollowing(req.params.userId, {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
            });
            res.json({
                success: true,
                data: result.users,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    async getSuggestedUsers(req, res, next) {
        try {
            const users = await userService.getSuggestedUsers(
                req.user.id,
                parseInt(req.query.limit) || 10,
            );
            res.json({ success: true, data: users });
        } catch (error) {
            next(error);
        }
    }

    async searchUsers(req, res, next) {
        try {
            const result = await userService.searchUsers(req.query.q || "", {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
            });
            res.json({
                success: true,
                data: result.users,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();
