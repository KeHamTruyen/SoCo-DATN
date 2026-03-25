import { Link } from "react-router-dom";

export function SellerDashboardSettingsTab() {
    return (
        <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="text-lg font-bold">Settings</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Chỉnh sửa thông tin hiển thị công khai (ảnh đại diện, ảnh bìa, bio,
                tên shop) trên trang hồ sơ. Cập nhật qua API{" "}
                <code className="rounded bg-neutral-100 px-1 text-xs dark:bg-neutral-800">
                    PUT /users/me
                </code>{" "}
                khi bạn lưu từ trang Profile.
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                <li>Ảnh đại diện và ảnh bìa cửa hàng</li>
                <li>Tên hiển thị, username, giới thiệu</li>
                <li>Thông tin shop (nếu đã cấu hình)</li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-1">
                <Link
                    to="/profile"
                    className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:opacity-90"
                >
                    Mở My Profile
                </Link>
                <Link
                    to="/marketplace"
                    className="inline-flex rounded-lg border border-neutral-200 bg-transparent px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                    Marketplace
                </Link>
            </div>
        </div>
    );
}
