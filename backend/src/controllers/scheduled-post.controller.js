import * as scheduledPostService from '../services/scheduled-post.service.js';

export const createScheduledPost = async (req, res, next) => {
  try {
    const scheduledPost = await scheduledPostService.createScheduledPost(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Scheduled post created successfully',
      data: scheduledPost
    });
  } catch (error) {
    next(error);
  }
};

export const getMyScheduledPosts = async (req, res, next) => {
  try {
    const result = await scheduledPostService.getScheduledPosts(req.user.id, req.query);

    res.json({
      success: true,
      data: result.items,
      counts: result.counts,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const publishScheduledPostNow = async (req, res, next) => {
  try {
    const scheduledPost = await scheduledPostService.publishScheduledPostRecord(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Scheduled post published successfully',
      data: scheduledPost
    });
  } catch (error) {
    next(error);
  }
};

export const deleteScheduledPost = async (req, res, next) => {
  try {
    const result = await scheduledPostService.deleteScheduledPost(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Scheduled post deleted successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
