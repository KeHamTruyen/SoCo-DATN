import { body, param, query, validationResult } from "express-validator";

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    }
    next();
};

export const validateCreateReview = [
    body("orderItemId")
        .notEmpty()
        .withMessage("orderItemId is required")
        .isUUID()
        .withMessage("Invalid order item ID format"),
    body("rating")
        .notEmpty()
        .withMessage("rating is required")
        .isInt({ min: 1, max: 5 })
        .withMessage("rating must be between 1 and 5"),
    body("title")
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage("title too long"),
    body("content")
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage("content too long"),
    body("images")
        .optional()
        .isArray({ max: 6 })
        .withMessage("images must be an array with max 6 items"),
    body("images.*")
        .optional()
        .isString()
        .withMessage("image URL must be string"),
    validate,
];

export const validateGetProductReviews = [
    param("productId")
        .notEmpty()
        .withMessage("productId is required")
        .isUUID()
        .withMessage("Invalid product ID format"),
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("page must be positive integer"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("limit must be between 1 and 100"),
    query("rating")
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage("rating must be between 1 and 5"),
    query("hasMedia")
        .optional()
        .isIn(["true", "false"])
        .withMessage("hasMedia must be true or false"),
    query("hasSellerReply")
        .optional()
        .isIn(["true", "false"])
        .withMessage("hasSellerReply must be true or false"),
    query("sortBy")
        .optional()
        .isIn(["createdAt", "rating", "helpfulCount"])
        .withMessage("sortBy must be one of createdAt, rating, helpfulCount"),
    query("sortOrder")
        .optional()
        .isIn(["asc", "desc"])
        .withMessage("sortOrder must be asc or desc"),
    validate,
];

export const validateReplyReview = [
    param("reviewId")
        .notEmpty()
        .withMessage("reviewId is required")
        .isUUID()
        .withMessage("Invalid review ID format"),
    body("reply")
        .notEmpty()
        .withMessage("reply is required")
        .trim()
        .isLength({ min: 2, max: 1000 })
        .withMessage("reply length must be between 2 and 1000"),
    validate,
];
