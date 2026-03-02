import * as postService from '../services/post.service.js';

export const createPost = async (req, res, next) => {
  try {
    const post = await postService.createPost(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Post created successfully', data: { post } });
  } catch (error) {
    next(error);
  }
};

export const getPersonalizedFeed = async (req, res, next) => {
  try {
    const result = await postService.getPersonalizedFeed(req.user.id, {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    });
    res.json({ success: true, data: result.posts, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      authorId: req.query.authorId,
      productId: req.query.productId,
      visibility: req.query.visibility,
      status: req.query.status || 'PUBLISHED',
      search: req.query.search,
      userId: req.user?.id,
    };
    const result = await postService.getPosts(filters);
    res.json({ success: true, data: result.posts, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const post = await postService.getPostById(req.params.id, userId);
    res.json({ success: true, data: { post } });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const post = await postService.updatePost(req.params.id, req.user.id, req.body);
    res.json({ success: true, message: 'Post updated successfully', data: { post } });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if (error.message === 'Unauthorized to update this post') {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    await postService.deletePost(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if (error.message === 'Unauthorized to delete this post') {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const toggleLike = async (req, res, next) => {
  try {
    const result = await postService.toggleLike(req.params.id, req.user.id);
    res.json({ success: true, message: result.message, data: { liked: result.liked } });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { content, parentId } = req.body;
    const comment = await postService.addComment(req.params.id, req.user.id, content, parentId);
    res.status(201).json({ success: true, message: 'Comment added successfully', data: { comment } });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    next(error);
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const comment = await postService.updateComment(req.params.commentId, req.user.id, req.body.content);
    res.json({ success: true, message: 'Comment updated', data: { comment } });
  } catch (error) {
    if (error.message === 'Comment not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === 'Unauthorized') {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    await postService.deleteComment(req.params.commentId, req.user.id, req.user.role);
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    if (error.message === 'Comment not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === 'Unauthorized') {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await postService.getComments(req.params.id, page, limit);
    res.json({ success: true, data: result.comments, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

export const getReplies = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await postService.getReplies(req.params.commentId, page, limit);
    res.json({ success: true, data: result.replies, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

export const getUserPosts = async (req, res, next) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      status: req.query.status || 'PUBLISHED',
    };
    const result = await postService.getUserPosts(req.params.userId, filters);
    res.json({ success: true, data: result.posts, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

export const getMyPosts = async (req, res, next) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      status: req.query.status,
    };
    const result = await postService.getUserPosts(req.user.id, filters);
    res.json({ success: true, data: result.posts, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

export const sharePost = async (req, res, next) => {
  try {
    const result = await postService.sharePost(req.params.id);
    res.json({ success: true, message: 'Post shared', data: result });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    next(error);
  }
};
