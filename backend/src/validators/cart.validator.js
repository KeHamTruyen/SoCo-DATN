import { body, param, validationResult } from "express-validator";

/**
 * Middleware to handle validation errors
 */
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

/**
 * Validate add to cart request
 */
export const validateAddToCart = [
    body("productId")
        .notEmpty()
        .withMessage("Product ID is required")
        .isUUID()
        .withMessage("Invalid product ID format"),
    body("quantity")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Quantity must be at least 1"),
    body("variantId")
        .optional()
        .isUUID()
        .withMessage("Invalid variant ID format"),
    body("selectedVariant")
        .optional()
        .isObject()
        .withMessage("Selected variant must be an object"),
    validate,
];

/**
 * Validate update cart item request
 */
export const validateUpdateCartItem = [
    param("itemId")
        .notEmpty()
        .withMessage("Item ID is required")
        .isUUID()
        .withMessage("Invalid item ID format"),
    body("quantity")
        .notEmpty()
        .withMessage("Quantity is required")
        .isInt({ min: 1 })
        .withMessage("Quantity must be at least 1"),
    validate,
];

/**
 * Validate remove from cart request
 */
export const validateRemoveFromCart = [
    param("itemId")
        .notEmpty()
        .withMessage("Item ID is required")
        .isUUID()
        .withMessage("Invalid item ID format"),
    validate,
];
