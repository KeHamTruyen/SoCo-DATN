import aiService from "../services/ai.service.js";

class AIController {
    /**
     * GET /api/ai/history
     */
    async listHistory(req, res, next) {
        try {
            const data = await aiService.listContentHistory(req.user.id, req.query);
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/ai/history/:id/link-post
     */
    async linkHistoryToPost(req, res, next) {
        try {
            const { id } = req.params;
            const postId = req.body?.postId;
            if (!postId || typeof postId !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "postId is required",
                });
            }
            const linkTarget =
                req.body?.linkTarget === "scheduled_post"
                    ? "scheduled_post"
                    : "post";
            await aiService.linkHistoryToPost(
                req.user.id,
                id,
                postId,
                linkTarget,
            );
            res.json({ success: true, data: { linked: true } });
        } catch (error) {
            if (error?.code === "AI_HISTORY_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }
            next(error);
        }
    }

    /**
     * DELETE /api/ai/history/:id
     */
    async deleteHistory(req, res, next) {
        try {
            const { id } = req.params;
            await aiService.deleteContentHistory(req.user.id, id);
            res.json({ success: true, data: { deleted: true } });
        } catch (error) {
            if (error?.code === "AI_HISTORY_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }
            next(error);
        }
    }

    /**
     * POST /api/ai/generate-text
     */
    async generateText(req, res, next) {
        try {
            const {
                description,
                tone,
                withHashtags = true,
                withCta = true,
                length,
            } = req.body;
            const imageBase64 = req.body.imageBase64 || null;
            const normalizedLength =
                length === "Short" || length === "Medium" || length === "Long"
                    ? length
                    : "Medium";

            if (!description) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message: "Description is required",
                    });
            }

            const sourceIdea =
                typeof req.body.sourceIdea === "string" ? req.body.sourceIdea : undefined;
            const linkedProductId =
                typeof req.body.linkedProductId === "string"
                    ? req.body.linkedProductId
                    : undefined;
            const productTitle =
                typeof req.body.productTitle === "string"
                    ? req.body.productTitle
                    : undefined;
            const productImageUrl =
                typeof req.body.productImageUrl === "string"
                    ? req.body.productImageUrl
                    : undefined;

            const result = await aiService.generateText({
                userId: req.user.id,
                description,
                tone,
                imageBase64,
                withHashtags: Boolean(withHashtags),
                withCta: Boolean(withCta),
                length: normalizedLength,
                sourceIdea,
                linkedProductId,
                productTitle,
                productImageUrl,
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
            const {
                description,
                tone,
                withHashtags = true,
                withCta = true,
                length,
            } = req.body;
            const imageBase64 = req.body.imageBase64 || null;
            const normalizedLength =
                length === "Short" || length === "Medium" || length === "Long"
                    ? length
                    : "Medium";

            if (!description) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message: "Description is required",
                    });
            }

            const sourceIdea =
                typeof req.body.sourceIdea === "string" ? req.body.sourceIdea : undefined;
            const linkedProductId =
                typeof req.body.linkedProductId === "string"
                    ? req.body.linkedProductId
                    : undefined;
            const productTitle =
                typeof req.body.productTitle === "string"
                    ? req.body.productTitle
                    : undefined;
            const productImageUrl =
                typeof req.body.productImageUrl === "string"
                    ? req.body.productImageUrl
                    : undefined;

            const result = await aiService.generateImageText({
                userId: req.user.id,
                description,
                tone,
                imageBase64,
                withHashtags: Boolean(withHashtags),
                withCta: Boolean(withCta),
                length: normalizedLength,
                sourceIdea,
                linkedProductId,
                productTitle,
                productImageUrl,
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
            const {
                description,
                tone,
                withHashtags = true,
                withCta = true,
                length,
            } = req.body;
            const imageBase64 = req.body.imageBase64 || null;
            const normalizedLength =
                length === "Short" || length === "Medium" || length === "Long"
                    ? length
                    : "Medium";

            if (!description) {
                return res
                    .status(400)
                    .json({
                        success: false,
                        message: "Description is required",
                    });
            }

            const sourceIdea =
                typeof req.body.sourceIdea === "string" ? req.body.sourceIdea : undefined;
            const linkedProductId =
                typeof req.body.linkedProductId === "string"
                    ? req.body.linkedProductId
                    : undefined;
            const productTitle =
                typeof req.body.productTitle === "string"
                    ? req.body.productTitle
                    : undefined;
            const productImageUrl =
                typeof req.body.productImageUrl === "string"
                    ? req.body.productImageUrl
                    : undefined;

            const result = await aiService.generateVideoImagesText({
                userId: req.user.id,
                description,
                tone,
                imageBase64,
                withHashtags: Boolean(withHashtags),
                withCta: Boolean(withCta),
                length: normalizedLength,
                sourceIdea,
                linkedProductId,
                productTitle,
                productImageUrl,
            });

            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}

export default new AIController();
