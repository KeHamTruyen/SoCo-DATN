import { body, param, query, validationResult } from "express-validator";

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
 * Validate create order request
 */
export const validateCreateOrder = [
    body("cartItemIds")
        .optional()
        .isArray({ min: 1 })
        .withMessage("cartItemIds must be a non-empty array"),
    body("cartItemIds.*")
        .optional()
        .isUUID()
        .withMessage("Each cartItemId must be a valid UUID"),
    body("shippingName")
        .notEmpty()
        .withMessage("Shipping name is required")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Shipping name must be between 2-100 characters"),
    body("shippingPhone")
        .notEmpty()
        .withMessage("Shipping phone is required")
        .matches(/^[0-9]{10,11}$/)
        .withMessage("Invalid phone number format"),
    body("shippingAddress")
        .notEmpty()
        .withMessage("Shipping address is required")
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage("Shipping address must be between 10-500 characters"),
    body("shippingCity")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("City name too long"),
    body("shippingDistrict")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("District name too long"),
    body("shippingWard")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Ward name too long"),
    body("shippingNote")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Shipping note too long"),
    body("paymentMethod")
        .notEmpty()
        .withMessage("Payment method is required")
        .isIn(["COD", "BANK_TRANSFER", "MOMO", "VNPAY", "ZALOPAY"])
        .withMessage("Invalid payment method"),
    validate,
];

/**
 * Validate get orders query
 */
export const validateGetOrders = [
    query("status")
        .optional()
        .isIn([
            "PENDING",
            "CONFIRMED",
            "PROCESSING",
            "SHIPPING",
            "DELIVERED",
            "COMPLETED",
            "CANCELLED",
            "REFUNDED",
        ])
        .withMessage("Invalid order status"),
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),
    validate,
];

/**
 * Validate order ID parameter
 */
export const validateOrderId = [
    param("orderId")
        .notEmpty()
        .withMessage("Order ID is required")
        .isUUID()
        .withMessage("Invalid order ID format"),
    validate,
];

/**
 * Validate update order status request
 */
export const validateUpdateOrderStatus = [
    param("orderId")
        .notEmpty()
        .withMessage("Order ID is required")
        .isUUID()
        .withMessage("Invalid order ID format"),
    body("status")
        .notEmpty()
        .withMessage("Status is required")
        .isIn([
            "PENDING",
            "CONFIRMED",
            "PROCESSING",
            "SHIPPING",
            "DELIVERED",
            "COMPLETED",
            "CANCELLED",
            "REFUNDED",
        ])
        .withMessage("Invalid order status"),
    validate,
];

/**
 * Validate cancel order request
 */
export const validateCancelOrder = [
    param("orderId")
        .notEmpty()
        .withMessage("Order ID is required")
        .isUUID()
        .withMessage("Invalid order ID format"),
    body("reason")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Cancellation reason too long"),
    validate,
];

/**
 * Validate request refund request
 */
export const validateRequestRefund = [
    param("orderId")
        .notEmpty()
        .withMessage("Order ID is required")
        .isUUID()
        .withMessage("Invalid order ID format"),
    body("reason")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Refund reason too long"),
    validate,
];

/**
 * Validate process refund request
 */
export const validateProcessRefund = [
    param("orderId")
        .notEmpty()
        .withMessage("Order ID is required")
        .isUUID()
        .withMessage("Invalid order ID format"),
    body("accept")
        .notEmpty()
        .withMessage("accept is required")
        .isBoolean()
        .withMessage("accept must be boolean"),
    body("reason")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Reason too long"),
    validate,
];
