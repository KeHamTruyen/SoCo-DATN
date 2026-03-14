import * as searchService from '../services/search.service.js';

export const searchAll = async (req, res, next) => {
  try {
    const data = await searchService.searchAll(req.query, req.user?.id || null);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (req, res, next) => {
  try {
    const result = await searchService.searchProducts(req.query);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const result = await searchService.searchUsers(req.query);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

export const searchPosts = async (req, res, next) => {
  try {
    const result = await searchService.searchPosts(req.query, req.user?.id || null);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};