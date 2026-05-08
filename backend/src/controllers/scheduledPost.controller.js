import scheduledPostService from '../services/scheduledPost.service.js';

class ScheduledPostController {
  /**
   * POST /api/scheduled-posts
   */
  async create(req, res, next) {
    try {
      const post = await scheduledPostService.schedulePost(req.user.id, req.body);
      res.status(201).json({ success: true, message: 'Post scheduled', data: { post } });
    } catch (error) {
      if (error.message === 'productId is deprecated. Use productTags[] instead') {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  /**
   * GET /api/scheduled-posts
   */
  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const status =
        typeof req.query.status === 'string' && req.query.status.trim().length > 0
          ? req.query.status.trim().toLowerCase()
          : undefined;
      const data = await scheduledPostService.getScheduledPosts(req.user.id, {
        status,
        page,
        limit,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/scheduled-posts/analytics
   */
  async getAnalytics(req, res, next) {
    try {
      const range =
        typeof req.query.range === 'string' && req.query.range.trim().length > 0
          ? req.query.range.trim().toLowerCase()
          : '30d';
      const data = await scheduledPostService.getScheduledPostsAnalytics(req.user.id, { range });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/scheduled-posts/:id
   */
  async update(req, res, next) {
    try {
      const post = await scheduledPostService.updateScheduledPost(req.params.id, req.user.id, req.body);
      res.json({ success: true, message: 'Scheduled post updated', data: { post } });
    } catch (error) {
      if (error.message === 'productId is deprecated. Use productTags[] instead') {
        return res.status(400).json({ success: false, message: error.message });
      }
      if (
        error.message === 'Scheduled post not found' ||
        error.message === 'Published post not found'
      ) {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  /**
   * POST /api/scheduled-posts/:id/publish
   */
  async publishNow(req, res, next) {
    try {
      const post = await scheduledPostService.publishNow(req.params.id, req.user.id);
      res.json({ success: true, message: 'Post published', data: { post } });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/scheduled-posts/:id
   */
  async delete(req, res, next) {
    try {
      await scheduledPostService.deleteScheduledPost(req.params.id, req.user.id);
      res.json({ success: true, message: 'Scheduled post deleted' });
    } catch (error) {
      if (
        error.message === 'Scheduled post not found' ||
        error.message === 'Published post not found'
      ) {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
}

export default new ScheduledPostController();
