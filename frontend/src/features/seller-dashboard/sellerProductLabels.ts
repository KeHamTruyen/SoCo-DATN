/** Nhãn hiển thị cho ProductStatus từ API */
export const SELLER_PRODUCT_STATUS_LABEL: Record<string, string> = {
    DRAFT: "Bản nháp",
    ACTIVE: "Đang bán",
    OUT_OF_STOCK: "Hết hàng",
    ARCHIVED: "Lưu trữ",
};

export function formatSellerProductStatus(status: string): string {
    return SELLER_PRODUCT_STATUS_LABEL[status] ?? status;
}
