import { body, param, query, validationResult } from "express-validator";

const POST_TAG_ANCHOR_TYPES = ["MEDIA_HOTSPOT", "INLINE_TEXT", "CONTENT_BLOCK"];
const MAX_PRODUCT_TAGS = 20;

function validateProductTags(tags) {
    if (!Array.isArray(tags)) {
        throw new Error("productTags must be an array");
    }
    if (tags.length > MAX_PRODUCT_TAGS) {
        throw new Error(`Maximum ${MAX_PRODUCT_TAGS} product tags allowed`);
    }
    for (const tag of tags) {
        if (!tag || typeof tag !== "object") {
            throw new Error("Each product tag must be an object");
        }
        const { productId, anchorType, positionX, positionY, blockId, startOffset, endOffset } = tag;
        if (!productId || typeof productId !== "string") {
            throw new Error("Each product tag requires productId");
        }
        if (anchorType && !POST_TAG_ANCHOR_TYPES.includes(anchorType)) {
            throw new Error("Invalid product tag anchorType");
        }
        const effectiveAnchor = anchorType || "MEDIA_HOTSPOT";
        if (effectiveAnchor === "MEDIA_HOTSPOT") {
            if (
                typeof positionX !== "number" ||
                typeof positionY !== "number" ||
                positionX < 0 ||
                positionX > 100 ||
                positionY < 0 ||
                positionY > 100
            ) {
                throw new Error("MEDIA_HOTSPOT tags require positionX/positionY between 0 and 100");
            }
        }
        if (effectiveAnchor === "CONTENT_BLOCK" && (!blockId || typeof blockId !== "string")) {
            throw new Error("CONTENT_BLOCK tags require blockId");
        }
        if (effectiveAnchor !== "MEDIA_HOTSPOT" && positionX !== undefined && typeof positionX !== "number") {
            throw new Error("positionX must be a number when provided");
        }
        if (effectiveAnchor !== "MEDIA_HOTSPOT" && positionY !== undefined && typeof positionY !== "number") {
            throw new Error("positionY must be a number when provided");
        }
        if (startOffset !== undefined && (!Number.isInteger(startOffset) || startOffset < 0)) {
            throw new Error("startOffset must be a non-negative integer");
        }
        if (endOffset !== undefined && (!Number.isInteger(endOffset) || endOffset < 0)) {
            throw new Error("endOffset must be a non-negative integer");
        }
    }
    return true;
}

/**
 * Validation middleware - checks for validation errors
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array(),
        });
    }
    next();
};

/**
 * Validation for creating a new post
 */
export const createPostValidation = [
    body("content")
        .optional({ nullable: true })
        .trim()
        .custom((value, { req }) => {
            const urls = req.body.mediaUrls;
            const hasMedia = Array.isArray(urls) && urls.length > 0;
            const text =
                value === undefined || value === null ? "" : String(value).trim();
            if (!hasMedia && !text) {
                throw new Error("Content or at least one media URL is required");
            }
            if (text.length > 5000) {
                throw new Error("Content must not exceed 5000 characters");
            }
            return true;
        }),

    body("mediaUrls")
        .optional()
        .isArray()
        .withMessage("Media URLs must be an array")
        .custom((urls) => {
            if (urls.length > 10) {
                throw new Error("Maximum 10 media files allowed");
            }
            return true;
        }),

    body("mediaUrls.*")
        .optional()
        .isURL()
        .withMessage("Each media URL must be a valid URL"),

    body("mediaType")
        .optional()
        .isIn(["IMAGE", "VIDEO", "NONE"])
        .withMessage("Media type must be IMAGE, VIDEO, or NONE"),

    body("productId")
        .not()
        .exists()
        .withMessage("productId is deprecated. Use productTags[] instead"),

    body("productTags")
        .optional()
        .custom(validateProductTags),

    body("productTags.*.productId")
        .optional()
        .isUUID()
        .withMessage("Each tagged product ID must be a valid UUID"),

    body("groupId")
        .optional()
        .isUUID()
        .withMessage("Group ID must be a valid UUID"),

    body("status")
        .optional()
        .isIn(["DRAFT", "PUBLISHED"])
        .withMessage("Status must be DRAFT or PUBLISHED"),

    body("visibility")
        .optional()
        .isIn(["PUBLIC", "FOLLOWERS", "FOLLOWING", "PRIVATE"])
        .withMessage("Visibility must be PUBLIC, FOLLOWERS, FOLLOWING, or PRIVATE"),

    body("location")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 500 })
        .withMessage("Location must not exceed 500 characters"),

    body("feeling")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 120 })
        .withMessage("Feeling must not exceed 120 characters"),

    body("taggedUserIds")
        .optional()
        .isArray()
        .withMessage("taggedUserIds must be an array")
        .custom((arr) => {
            if (arr.length > 10) {
                throw new Error("Maximum 10 tagged users allowed");
            }
            return true;
        }),

    body("taggedUserIds.*")
        .optional()
        .isUUID()
        .withMessage("Each tagged user ID must be a valid UUID"),
];

/**
 * Validation for updating a post
 */
export const updatePostValidation = [
    param("id").isUUID().withMessage("Post ID must be a valid UUID"),

    body("content")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Content cannot be empty")
        .isLength({ max: 5000 })
        .withMessage("Content must not exceed 5000 characters"),

    body("mediaUrls")
        .optional()
        .isArray()
        .withMessage("Media URLs must be an array")
        .custom((urls) => {
            if (urls.length > 10) {
                throw new Error("Maximum 10 media files allowed");
            }
            return true;
        }),

    body("mediaUrls.*")
        .optional()
        .isURL()
        .withMessage("Each media URL must be a valid URL"),

    body("mediaType")
        .optional()
        .isIn(["IMAGE", "VIDEO", "NONE"])
        .withMessage("Media type must be IMAGE, VIDEO, or NONE"),

    body("productId")
        .not()
        .exists()
        .withMessage("productId is deprecated. Use productTags[] instead"),

    body("productTags")
        .optional()
        .custom(validateProductTags),

    body("productTags.*.productId")
        .optional()
        .isUUID()
        .withMessage("Each tagged product ID must be a valid UUID"),

    body("status")
        .optional()
        .isIn(["DRAFT", "PUBLISHED", "ARCHIVED"])
        .withMessage("Status must be DRAFT, PUBLISHED, or ARCHIVED"),

    body("visibility")
        .optional()
        .isIn(["PUBLIC", "FOLLOWERS", "FOLLOWING", "PRIVATE"])
        .withMessage("Visibility must be PUBLIC, FOLLOWERS, FOLLOWING, or PRIVATE"),

    body("location")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 500 })
        .withMessage("Location must not exceed 500 characters"),

    body("feeling")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 120 })
        .withMessage("Feeling must not exceed 120 characters"),

    body("taggedUserIds")
        .optional()
        .isArray()
        .withMessage("taggedUserIds must be an array")
        .custom((arr) => {
            if (arr.length > 10) {
                throw new Error("Maximum 10 tagged users allowed");
            }
            return true;
        }),

    body("taggedUserIds.*")
        .optional()
        .isUUID()
        .withMessage("Each tagged user ID must be a valid UUID"),
];

/**
 * Validation for getting a post by ID
 */
export const getPostByIdValidation = [
    param("id").isUUID().withMessage("Post ID must be a valid UUID"),
];

/**
 * Validation for deleting a post
 */
export const deletePostValidation = [
    param("id").isUUID().withMessage("Post ID must be a valid UUID"),
];

/**
 * Validation for liking a post
 */
export const likePostValidation = [
    param("id").isUUID().withMessage("Post ID must be a valid UUID"),
];

/**
 * Validation for adding a comment
 */
export const addCommentValidation = [
    param("id").isUUID().withMessage("Post ID must be a valid UUID"),

    body("content")
        .trim()
        .notEmpty()
        .withMessage("Comment content is required")
        .isLength({ max: 1000 })
        .withMessage("Comment must not exceed 1000 characters"),

    body("parentId")
        .optional()
        .isUUID()
        .withMessage("Parent ID must be a valid UUID"),
];

/**
 * Validation for getting comments
 */
export const getCommentsValidation = [
    param("id").isUUID().withMessage("Post ID must be a valid UUID"),

    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),
];

/**
 * Validation for getting posts feed
 */
export const getPostsValidation = [
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),

    query("authorId")
        .optional()
        .isUUID()
        .withMessage("Author ID must be a valid UUID"),

    query("visibility")
        .optional()
        .isIn(["PUBLIC", "FOLLOWERS", "FOLLOWING", "PRIVATE"])
        .withMessage("Visibility must be PUBLIC, FOLLOWERS, FOLLOWING, or PRIVATE"),

    query("status")
        .optional()
        .isIn(["DRAFT", "PUBLISHED", "ARCHIVED"])
        .withMessage("Status must be DRAFT, PUBLISHED, or ARCHIVED"),

    query("search")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("Search query must not exceed 200 characters"),
];

/**
 * Validation for getting user posts
 */
export const getUserPostsValidation = [
    param("userId").isUUID().withMessage("User ID must be a valid UUID"),

    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),

    query("status")
        .optional()
        .isIn(["DRAFT", "PUBLISHED", "ARCHIVED"])
        .withMessage("Status must be DRAFT, PUBLISHED, or ARCHIVED"),
];

/**
 * Validation for getting my posts
 */
export const getMyPostsValidation = [
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),

    query("status")
        .optional()
        .isIn(["DRAFT", "PUBLISHED", "ARCHIVED"])
        .withMessage("Status must be DRAFT, PUBLISHED, or ARCHIVED"),
];
