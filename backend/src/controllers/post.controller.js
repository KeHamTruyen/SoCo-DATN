import * as postService from '../services/post.service.js';
import { formatPostForResponse, formatPostsForResponse } from '../utils/postSerializer.js';
import {
  buildCacheKey,
  CACHE_TTL_SECONDS,
  cacheDelByPattern,
  getOrSetCache,
} from '../lib/cache.js';

async function invalidatePostCaches(postId = null) {
  await Promise.all([
    cacheDelByPattern('soco:posts:list:*'),
    cacheDelByPattern('soco:search:all:*'),
    ...(postId ? [cacheDelByPattern(`soco:posts:detail:${postId}:*`), cacheDelByPattern(`soco:posts:comments:${postId}:*`)] : []),
  ]);
}

export const createPost = async (req, res, next) => {
  try {
    const post = await postService.createPost(req.user.id, req.body);
    const formatted = await formatPostForResponse(post);
    await invalidatePostCaches(post.id);
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post: formatted },
    });
  } catch (error) {
    if (error.message === 'productId is deprecated. Use productTags[] instead') {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.message === 'Group not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === 'Must be a group member to post') {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const getPersonalizedFeed = async (req, res, next) => {
  try {
    const result = await postService.getPersonalizedFeed(req.user.id, {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    });
    const data = await formatPostsForResponse(result.posts);
    res.json({ success: true, data, pagination: result.pagination });
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
      visibility: req.query.visibility,
      status: req.query.status || 'PUBLISHED',
      search: req.query.search,
      userId: req.user?.id,
    };
    const key = buildCacheKey('posts', 'list', filters);
    const { data: payload } = await getOrSetCache(key, CACHE_TTL_SECONDS.postsList, async () => {
      const result = await postService.getPosts(filters);
      const data = await formatPostsForResponse(result.posts);
      return { data, pagination: result.pagination };
    });
    res.json({ success: true, data: payload.data, pagination: payload.pagination });
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const key = buildCacheKey('posts', `detail:${req.params.id}`, { userId });
    const { data: payload } = await getOrSetCache(key, CACHE_TTL_SECONDS.postDetail, async () => {
      const post = await postService.getPostById(req.params.id, userId);
      const formatted = await formatPostForResponse(post);
      return { post: formatted };
    });
    res.json({ success: true, data: payload });
  } catch (error) {
    if (error.message === 'productId is deprecated. Use productTags[] instead') {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.message === 'Post not found') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const post = await postService.updatePost(req.params.id, req.user.id, req.body);
    const formatted = await formatPostForResponse(post);
    await invalidatePostCaches(post.id);
    res.json({ success: true, message: 'Post updated successfully', data: { post: formatted } });
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
    await postService.deletePost(req.params.id, req.user.id);
    await invalidatePostCaches(req.params.id);
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
    await invalidatePostCaches(req.params.id);
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
    await invalidatePostCaches(req.params.id);
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
    await postService.deleteComment(req.params.commentId, req.user.id);
    await invalidatePostCaches();
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
    const offset = req.query.offset ? parseInt(req.query.offset) : undefined;
    const key = buildCacheKey('posts', `comments:${req.params.id}`, { page, limit, offset });
    const { data: payload } = await getOrSetCache(key, CACHE_TTL_SECONDS.postComments, async () => {
      const result = await postService.getComments(req.params.id, page, limit, offset);
      return { comments: result.comments, pagination: result.pagination };
    });
    res.json({ success: true, data: payload.comments, pagination: payload.pagination });
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
    const data = await formatPostsForResponse(result.posts);
    res.json({ success: true, data, pagination: result.pagination });
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
    const data = await formatPostsForResponse(result.posts);
    res.json({ success: true, data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

export const sharePost = async (req, res, next) => {
  try {
    const result = await postService.sharePost(req.params.id);
    await invalidatePostCaches(req.params.id);
    res.json({ success: true, message: 'Post shared', data: result });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    next(error);
  }
};

export const adminDeletePost = async (req, res, next) => {
  try {
    await postService.deletePostAsModerator(req.params.id);
    await invalidatePostCaches(req.params.id);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    if (error.message === 'Post not found') {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    next(error);
  }
};

export const adminDeleteComment = async (req, res, next) => {
  try {
    await postService.deleteCommentAsModerator(req.params.commentId);
    await invalidatePostCaches();
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    if (error.message === 'Comment not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};
