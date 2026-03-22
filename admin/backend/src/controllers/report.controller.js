import reportService from "../services/report.service.js";

class ReportController {
    async getReports(req, res, next) {
        try {
            const result = await reportService.getReports({
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
                status: req.query.status,
                targetType: req.query.targetType,
            });
            res.json({
                success: true,
                data: result.reports,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    async getReportById(req, res, next) {
        try {
            const report = await reportService.getReportById(req.params.reportId);
            res.json({ success: true, data: report });
        } catch (error) {
            if (error.message === "Report not found") {
                return res
                    .status(404)
                    .json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    async resolveReport(req, res, next) {
        try {
            const report = await reportService.resolveReport(
                req.params.reportId,
                req.user.id,
                req.body,
            );
            res.json({ success: true, message: "Report resolved", data: report });
        } catch (error) {
            if (error.message === "Report not found") {
                return res
                    .status(404)
                    .json({ success: false, message: error.message });
            }
            if (error.message === "Report already resolved") {
                return res
                    .status(400)
                    .json({ success: false, message: error.message });
            }
            next(error);
        }
    }
}

export default new ReportController();
