import * as reportService from '../services/report.service.js';

export const createReport = async (req, res, next) => {
  try {
    const report = await reportService.createReport(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report
    });
  } catch (error) {
    if (error.message === 'Target not found') {
      return res.status(404).json({ success: false, message: error.message });
    }

    if (
      error.message === 'You already have an active report for this target' ||
      error.message === 'You cannot report yourself' ||
      error.message === 'You cannot report your own post' ||
      error.message === 'You cannot report your own product' ||
      error.message === 'You cannot report your own shop'
    ) {
      const status = error.message === 'You already have an active report for this target' ? 409 : 400;
      return res.status(status).json({ success: false, message: error.message });
    }

    next(error);
  }
};

export const getMyReports = async (req, res, next) => {
  try {
    const result = await reportService.getMyReports(req.user.id, req.query);
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

export const getReportsForAdmin = async (req, res, next) => {
  try {
    const result = await reportService.getReportsForAdmin(req.query);
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

export const updateReportStatus = async (req, res, next) => {
  try {
    const report = await reportService.updateReportStatus(req.params.id, req.user.id, req.body);

    res.json({
      success: true,
      message: 'Report status updated successfully',
      data: report
    });
  } catch (error) {
    if (error.message === 'Report not found') {
      return res.status(404).json({ success: false, message: error.message });
    }

    next(error);
  }
};
