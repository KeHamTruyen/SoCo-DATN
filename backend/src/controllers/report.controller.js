import reportService from '../services/report.service.js';

class ReportController {
  async createReport(req, res, next) {
    try {
      const report = await reportService.createReport(req.user.id, req.body);
      res.status(201).json({ success: true, message: 'Report submitted', data: report });
    } catch (error) {
      if (error.message === 'Invalid target type') {
        return res.status(400).json({ success: false, message: error.message });
      }
      if (error.message.includes('already reported')) {
        return res.status(429).json({ success: false, message: error.message });
      }
      next(error);
    }
  }

  async getMyReports(req, res, next) {
    try {
      const result = await reportService.getMyReports(req.user.id, {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
      });
      res.json({ success: true, data: result.reports, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }
}

export default new ReportController();
