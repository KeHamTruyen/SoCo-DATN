import * as analyticsService from '../services/analytics.service.js';

export const getSellerDashboard = async (req, res, next) => {
  try {
    const data = await analyticsService.getSellerAnalyticsDashboard(req.user.id, req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getSellerStatsHistory = async (req, res, next) => {
  try {
    const data = await analyticsService.getSellerStatsHistory(req.user.id, req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getPlatformOverview = async (req, res, next) => {
  try {
    const data = await analyticsService.getPlatformAnalyticsOverview(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const aggregateSellerStatsDaily = async (req, res, next) => {
  try {
    const result = await analyticsService.aggregateSellerStatsDaily(req.body.date);
    res.json({
      success: true,
      message: 'Seller stats aggregation completed',
      data: result
    });
  } catch (error) {
    if (error.message === 'Invalid date') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};