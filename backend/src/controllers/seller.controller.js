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

  async withdrawReviewingApplication(req, res, next) {
    try {
      const result = await sellerService.withdrawReviewingApplication(req.user.id);
      res.json({ success: true, ...result });
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

  /** Multipart: fields idFront, idBack, optional shopLogo, shopCover + JSON string field `payload`. */
  async completeRegistrationWithUploads(req, res, next) {
    try {
      let payload;
      try {
        const raw = req.body?.payload;
        payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch {
        throw Object.assign(new Error('Invalid JSON in payload field'), { statusCode: 400 });
      }
      const result = await sellerService.completeRegistrationWithUploads(req.user.id, req.files || {}, payload);
      res.json({
        success: true,
        message: 'Application submitted for review',
        data: { application: result },
      });
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

  async getDashboardStats(req, res, next) {
    try {
      const data = await sellerService.getDashboardStats(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async verifySensitiveReauth(req, res, next) {
    try {
      const { currentPassword } = req.body;
      const data = await sellerService.verifySensitiveReauth(req.user.id, currentPassword);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getMaskedSensitiveSummary(req, res, next) {
    try {
      const { currentPassword } = req.body;
      const data = await sellerService.getMaskedSensitiveSummary(req.user.id, currentPassword);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async submitSensitiveChangeRequest(req, res, next) {
    try {
      const result = await sellerService.submitSensitiveChangeRequest(req.user.id, req.body);
      res.json({ success: true, data: { request: result } });
    } catch (error) {
      next(error);
    }
  }

  async getMyPendingSensitiveChange(req, res, next) {
    try {
      const data = await sellerService.getMyPendingSensitiveChange(req.user.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async listSensitiveChangeRequestsAdmin(req, res, next) {
    try {
      const { page, limit } = req.query;
      const data = await sellerService.listSensitiveChangeRequestsAdmin({
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async approveSensitiveChangeRequest(req, res, next) {
    try {
      const result = await sellerService.approveSensitiveChangeRequest(req.params.id, req.user.id);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async rejectSensitiveChangeRequest(req, res, next) {
    try {
      const { reason } = req.body;
      const result = await sellerService.rejectSensitiveChangeRequest(
        req.params.id,
        req.user.id,
        reason,
      );
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export default new SellerController();
