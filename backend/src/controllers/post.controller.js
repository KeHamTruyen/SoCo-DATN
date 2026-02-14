import * as postService from '../services/post.service.js';

/**
 * @desc    Create new post
 * @route   POST /api/posts
 * @access  Private
 */
export const createPost = async (req, res, next) => {
  try {
    const post = await postService.createPost(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all posts (Feed)
 * @route   GET /api/posts
 * @access  Public
 */
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
    };

    const result = await postService.getPosts(filters);

    res.json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single post by ID
 * @route   GET /api/posts/:id
 * @access  Public
 */
export const getPostById = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const post = await postService.getPostById(req.params.id, userId);

    res.json({
      success: true,
      data: { post },
    });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    next(error);
  }
};

/**
 * @desc    Update post
 * @route   PUT /api/posts/:id
 * @access  Private (Author only)
 */
export const updatePost = async (req, res, next) => {
  try {
    const post = await postService.updatePost(
      req.params.id,
      req.user.id,
      req.body
    );

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: { post },
    });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    if (error.message === 'Unauthorized to update this post') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this post',
      });
    }
    next(error);
  }
};

/**
 * @desc    Delete post
 * @route   DELETE /api/posts/:id
 * @access  Private (Author only)
 */
export const deletePost = async (req, res, next) => {
  try {
    await postService.deletePost(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    if (error.message === 'Unauthorized to delete this post') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post',
      });
    }
    next(error);
  }
};

/**
 * @desc    Like/Unlike post
 * @route   POST /api/posts/:id/like
 * @access  Private
 */
export const toggleLike = async (req, res, next) => {
  try {
    const result = await postService.toggleLike(req.params.id, req.user.id);

    res.json({
      success: true,
      message: result.message,
      data: {
        liked: result.liked,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add comment to post
 * @route   POST /api/posts/:id/comments
 * @access  Private
 */
export const addComment = async (req, res, next) => {
  try {
    const { content, parentId } = req.body;
    const comment = await postService.addComment(
      req.params.id,
      req.user.id,
      content,
      parentId
    );

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get comments for a post
 * @route   GET /api/posts/:id/comments
 * @access  Public
 */
export const getComments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await postService.getComments(req.params.id, page, limit);

    res.json({
      success: true,
      data: result.comments,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's posts
 * @route   GET /api/posts/user/:userId
 * @access  Public
 */
export const getUserPosts = async (req, res, next) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      status: req.query.status || 'PUBLISHED',
    };

    const result = await postService.getUserPosts(req.params.userId, filters);

    res.json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get my posts (logged in user)
 * @route   GET /api/posts/me
 * @access  Private
 */
export const getMyPosts = async (req, res, next) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      status: req.query.status, // Can see all statuses (DRAFT, PUBLISHED, etc.)
    };

    const result = await postService.getUserPosts(req.user.id, filters);

    res.json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};
