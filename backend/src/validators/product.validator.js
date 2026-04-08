import { body, query, param, validationResult } from "express-validator";

/** Optional { length?, width?, height?, unit? } or null (clear on update). */
const dimensionsField = (path = "dimensions") =>
    body(path)
        .optional({ nullable: true })
        .custom((value) => {
            if (value === null || value === undefined) return true;
            if (typeof value !== "object" || Array.isArray(value)) {
                throw new Error("Dimensions must be an object");
            }
            const allowed = new Set(["length", "width", "height", "unit"]);
            for (const key of Object.keys(value)) {
                if (!allowed.has(key)) {
                    throw new Error(`Invalid dimensions key: ${key}`);
                }
            }
            for (const k of ["length", "width", "height"]) {
                const v = value[k];
                if (v !== undefined && v !== null) {
                    const n = typeof v === "string" ? parseFloat(v) : Number(v);
                    if (Number.isNaN(n) || n < 0) {
                        throw new Error(`${k} must be a non-negative number`);
                    }
                }
            }
            if (value.unit != null && typeof value.unit !== "string") {
                throw new Error("unit must be a string");
            }
            if (typeof value.unit === "string" && value.unit.length > 20) {
                throw new Error("unit must not exceed 20 characters");
            }
            return true;
        });

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

export const createProductValidation = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ max: 200 })
        .withMessage("Title must not exceed 200 characters"),

    body("description")
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage("Description must not exceed 5000 characters"),

    body("price")
        .notEmpty()
        .withMessage("Price is required")
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),

    body("compareAtPrice")
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage("Compare at price must be a positive number"),

    body("costPrice")
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage("Cost price must be a positive number"),

    body("categoryIds")
        .optional()
        .isArray({ max: 20 })
        .withMessage("categoryIds must be an array with at most 20 items"),

    body("categoryIds.*").optional().isUUID().withMessage("Each category ID must be a valid UUID"),

    body("stockQuantity")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Stock quantity must be a non-negative integer"),

    body("lowStockThreshold")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Low stock threshold must be a non-negative integer"),

    body("sku")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("SKU must not exceed 100 characters"),

    body("weight")
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage("Weight must be a positive number"),

    body("trackInventory").optional().isBoolean().withMessage("trackInventory must be a boolean"),

    dimensionsField(),

    body("metaTitle")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 200 })
        .withMessage("metaTitle must not exceed 200 characters"),

    body("metaDescription")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 500 })
        .withMessage("metaDescription must not exceed 500 characters"),

    body("metaKeywords")
        .optional()
        .isArray({ max: 50 })
        .withMessage("metaKeywords must be an array with at most 50 items"),

    body("metaKeywords.*")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Each meta keyword must not exceed 100 characters"),

    body("images").optional().isArray().withMessage("Images must be an array"),

    body("images.*.url").optional().isURL().withMessage("Invalid image URL"),

    body("variants")
        .optional()
        .isArray()
        .withMessage("Variants must be an array"),

    body("variants.*.name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Variant name is required"),

    body("variants.*.price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Variant price must be a positive number"),

    body("variants.*.stockQuantity")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Variant stock quantity must be a non-negative integer"),

    body("variants.*.sku")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage("Variant SKU must not exceed 100 characters"),

    body("variants.*.options")
        .optional()
        .custom((v) => {
            if (v === undefined || v === null) return true;
            return typeof v === "object" && !Array.isArray(v);
        })
        .withMessage("Variant options must be a plain object"),
];

export const updateProductValidation = [
    body("title")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Title cannot be empty")
        .isLength({ max: 200 })
        .withMessage("Title must not exceed 200 characters"),

    body("description")
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage("Description must not exceed 5000 characters"),

    body("price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),

    body("compareAtPrice")
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage("Compare at price must be a positive number"),

    body("costPrice")
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage("Cost price must be a positive number"),

    body("categoryIds")
        .optional({ nullable: true })
        .isArray({ max: 20 })
        .withMessage("categoryIds must be an array with at most 20 items"),

    body("categoryIds.*").optional().isUUID().withMessage("Each category ID must be a valid UUID"),

    body("stockQuantity")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Stock quantity must be a non-negative integer"),

    body("lowStockThreshold")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Low stock threshold must be a non-negative integer"),

    body("sku")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage("SKU must not exceed 100 characters"),

    body("weight")
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage("Weight must be a positive number"),

    body("trackInventory").optional().isBoolean().withMessage("trackInventory must be a boolean"),

    dimensionsField(),

    body("metaTitle")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 200 })
        .withMessage("metaTitle must not exceed 200 characters"),

    body("metaDescription")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 500 })
        .withMessage("metaDescription must not exceed 500 characters"),

    body("metaKeywords")
        .optional({ nullable: true })
        .isArray({ max: 50 })
        .withMessage("metaKeywords must be an array with at most 50 items"),

    body("metaKeywords.*")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Each meta keyword must not exceed 100 characters"),

    body("status")
        .optional()
        .isIn(["DRAFT", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"])
        .withMessage("Invalid status"),
];

export const getProductsValidation = [
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),

    query("minPrice")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Min price must be a positive number"),

    query("maxPrice")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Max price must be a positive number"),

    query("sortBy")
        .optional()
        .isIn(["createdAt", "price", "viewsCount", "salesCount", "title"])
        .withMessage("Invalid sort field"),

    query("sortOrder")
        .optional()
        .isIn(["asc", "desc"])
        .withMessage("Sort order must be asc or desc"),

    query("status")
        .optional()
        .isIn(["DRAFT", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"])
        .withMessage("Invalid status"),

    query("sellerId")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("sellerId must be a non-empty string"),

    query("includeDeleted")
        .optional()
        .isBoolean()
        .withMessage("includeDeleted must be a boolean"),
];

export const productIdValidation = [
    param("id").notEmpty().withMessage("Product ID is required"),
];

export const deleteProductValidation = [
    ...productIdValidation,
    body("reason")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 300 })
        .withMessage("Reason must not exceed 300 characters"),
];

export const restoreProductValidation = [
    ...productIdValidation,
];

export const sellerProductIdParamValidation = [
    param("productId").notEmpty().withMessage("Product ID is required"),
];

export const addImagesValidation = [
    body("images")
        .isArray({ min: 1 })
        .withMessage("At least one image is required"),

    body("images.*.url").isURL().withMessage("Invalid image URL"),

    body("images.*.altText")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("Alt text must not exceed 200 characters"),
];

export const sellerProductVariantParams = [
    param("productId").notEmpty().withMessage("Product ID is required"),
    param("variantId").isUUID().withMessage("Invalid variant ID"),
];

export const createSellerVariantValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Variant name is required")
        .isLength({ max: 100 }),
    body("sku")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage("SKU must not exceed 100 characters"),
    body("price")
        .optional({ nullable: true })
        .isFloat({ min: 0 })
        .withMessage("Variant price must be a positive number"),
    body("stockQuantity")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Stock quantity must be a non-negative integer"),
    body("options")
        .optional()
        .custom((v) => {
            if (v === undefined || v === null) return true;
            return typeof v === "object" && !Array.isArray(v);
        })
        .withMessage("options must be a plain object"),
    body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
];

export const updateSellerVariantValidation = [
    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Name cannot be empty")
        .isLength({ max: 100 }),
    body("sku")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 100 }),
    body("price")
        .optional({ nullable: true })
        .isFloat({ min: 0 }),
    body("stockQuantity")
        .optional()
        .isInt({ min: 0 }),
    body("options")
        .optional()
        .custom((v) => {
            if (v === undefined || v === null) return true;
            return typeof v === "object" && !Array.isArray(v);
        })
        .withMessage("options must be a plain object"),
    body("isActive").optional().isBoolean(),
];
