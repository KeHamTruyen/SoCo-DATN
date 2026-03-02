import aiService from "../services/ai.service.js";

class AIController {
    /**
     * POST /api/ai/generate-text
     */
    async generateText(req, res, next) {
        try {
            const { description, tone } = req.body;
            const imageBase64 = req.body.imageBase64 || null;

            if (!description) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message: "Description is required",
                    });
            }

            const result = await aiService.generateText({
                userId: req.user.id,
                description,
                tone,
                imageBase64,
            });

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/ai/generate-image-text
     */
    async generateImageText(req, res, next) {
        try {
            const { description, tone } = req.body;
            const imageBase64 = req.body.imageBase64 || null;

            if (!description) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message: "Description is required",
                    });
            }

            const result = await aiService.generateImageText({
                userId: req.user.id,
                description,
                tone,
                imageBase64,
            });

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/ai/generate-video-images-text
     */
    async generateVideoImagesText(req, res, next) {
        try {
            const { description, tone } = req.body;
            const imageBase64 = req.body.imageBase64 || null;

            if (!description) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message: "Description is required",
                    });
            }

            const result = await aiService.generateVideoImagesText({
                userId: req.user.id,
                description,
                tone,
                imageBase64,
            });

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}

export default new AIController();
