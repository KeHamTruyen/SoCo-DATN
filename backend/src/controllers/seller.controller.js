import sellerService from '../services/seller.service.js';

class SellerController {
  // ─── Buyer endpoints ────────────────────────────────────────

  async startApplication(req, res, next) {
    try {
      const application = await sellerService.getOrCreateApplication(req.user.id);
      res.json({ success: true, data: { application } });
    } catch (error) {
      next(error);
    }
  }

  async getStatus(req, res, next) {
    try {
      const status = await sellerService.getApplicationStatus(req.user.id);
      res.json({ success: true, data: status });
    } catch (error) {
      next(error);
    }
  }

  async submitStep1(req, res, next) {
    try {
      const result = await sellerService.submitStep1(req.user.id, req.body);
      res.json({ success: true, message: 'Step 1 completed', data: { application: result } });
    } catch (error) {
      next(error);
    }
  }

  async submitStep2(req, res, next) {
    try {
      const result = await sellerService.submitStep2(req.user.id, req.body);
      res.json({ success: true, message: 'Step 2 completed', data: { application: result } });
    } catch (error) {
      next(error);
    }
  }

  async submitStep3(req, res, next) {
    try {
      const result = await sellerService.submitStep3(req.user.id, req.body);
      res.json({ success: true, message: 'Application submitted for review', data: { application: result } });
    } catch (error) {
      next(error);
    }
  }

  // ─── Admin endpoints ───────────────────────────────────────

  async listApplications(req, res, next) {
    try {
      const { page, limit, status } = req.query;
      const data = await sellerService.listApplications({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async approve(req, res, next) {
    try {
      const result = await sellerService.approve(req.params.id, req.user.id);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async reject(req, res, next) {
    try {
      const { reason } = req.body;
      const result = await sellerService.reject(req.params.id, req.user.id, reason);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export default new SellerController();
