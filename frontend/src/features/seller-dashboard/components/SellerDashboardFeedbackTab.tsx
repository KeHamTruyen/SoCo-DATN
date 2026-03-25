export function SellerDashboardFeedbackTab() {
    return (
        <div
            className="rounded-xl border border-dashed border-neutral-200 py-14 text-center dark:border-neutral-700"
            role="status"
            aria-live="polite"
        >
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Tổng hợp đánh giá theo shop sẽ hiển thị tại đây khi API danh sách
                review cho seller sẵn sàng.
            </p>
            <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
                Bạn có thể xem đánh giá trên từng sản phẩm trong My Shop / Inventory.
            </p>
        </div>
    );
}
