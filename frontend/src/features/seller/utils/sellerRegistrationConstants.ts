import { HttpError } from "../../../shared/api/httpClient";

export const SELLER_REGISTRATION_CATEGORIES = [
    { value: "electronics", label: "Electronics" },
    { value: "fashion", label: "Fashion & Apparel" },
    { value: "home", label: "Home & Living" },
    { value: "beauty", label: "Beauty & Wellness" },
    { value: "other", label: "Other" },
];

export const SELLER_REGISTRATION_ID_TYPES = [
    { value: "national_id", label: "National ID Card" },
    { value: "passport", label: "Passport" },
    { value: "business_license", label: "Business License" },
];

export function messageForSellerRegistrationSubmitError(err: unknown): string {
    if (err instanceof HttpError) {
        const code = (err.details as { code?: string } | undefined)?.code;
        if (code === "SELLER_APPLICATION_LOCKED") {
            return "Đơn đăng ký của bạn đang được xem xét. Bạn không thể gửi lại cho đến khi có kết quả từ quản trị viên.";
        }
        if (code === "SELLER_APPLICATION_ALREADY_APPROVED") {
            return "Đơn đăng ký đã được duyệt. Vui lòng tải lại trang hoặc đăng nhập lại.";
        }
        if (code === "USER_ALREADY_SELLER") {
            return "Tài khoản của bạn đã là người bán.";
        }
    }
    return err instanceof Error ? err.message : "Unknown error";
}
