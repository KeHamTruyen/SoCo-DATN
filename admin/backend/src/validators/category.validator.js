import { body, param, query, validationResult } from "express-validator";

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

export const adminListCategoriesValidation = [
    query("includeInactive")
        .optional()
        .isIn(["true", "false", "1", "0"])
        .withMessage("includeInactive must be true or false"),
];

export const categoryIdParamValidation = [
    param("id").notEmpty().withMessage("Category ID is required"),
];

export const createCategoryValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ max: 100 })
        .withMessage("Name must not exceed 100 characters"),
    body("slug")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Slug must not exceed 100 characters"),
    body("description")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 2000 })
        .withMessage("Description is too long"),
    body("iconUrl")
        .optional({ nullable: true })
        .custom((v) => {
            if (v === null || v === undefined || v === "") return true;
            if (typeof v !== "string") return false;
            try {
                new URL(v.trim());
                return true;
            } catch {
                return false;
            }
        })
        .withMessage("iconUrl must be a valid URL"),
    body("parentId")
        .optional({ nullable: true })
        .isUUID()
        .withMessage("parentId must be a valid UUID"),
    body("displayOrder")
        .optional()
        .isInt({ min: 0 })
        .withMessage("displayOrder must be a non-negative integer"),
    body("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean"),
];

export const updateCategoryValidation = [
    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Name cannot be empty")
        .isLength({ max: 100 })
        .withMessage("Name must not exceed 100 characters"),
    body("slug")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Slug must not exceed 100 characters"),
    body("description")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 2000 })
        .withMessage("Description is too long"),
    body("iconUrl")
        .optional({ nullable: true })
        .custom((v) => {
            if (v === null || v === undefined || v === "") return true;
            if (typeof v !== "string") return false;
            try {
                new URL(v.trim());
                return true;
            } catch {
                return false;
            }
        })
        .withMessage("iconUrl must be a valid URL"),
    body("parentId")
        .optional({ nullable: true })
        .isUUID()
        .withMessage("parentId must be a valid UUID"),
    body("displayOrder")
        .optional()
        .isInt({ min: 0 })
        .withMessage("displayOrder must be a non-negative integer"),
    body("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean"),
];
