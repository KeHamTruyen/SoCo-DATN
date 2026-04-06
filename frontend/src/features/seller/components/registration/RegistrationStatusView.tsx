import { Clock, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useSellerRegistrationContext } from "../../context/SellerRegistrationContext";
import { BrandLogo } from "../../../../shared/ui/organisms/brand-logo/BrandLogo";
import { Button } from "../../../../shared/ui/atoms/button";

const shellClass = "flex min-h-screen flex-col items-center bg-background-light px-4 py-12 text-neutral-900 dark:bg-background-dark dark:text-neutral-100";

export function RegistrationStatusView() {
    const {
        statusLoading, statusError, loadApplicationStatus,
        isAlreadySeller, applicationStatus,
        withdrawLoading, withdrawError, handleWithdrawReviewingApplication
    } = useSellerRegistrationContext();

    if (statusLoading) {
        return (
            <div className={shellClass}>
                <div className="mb-8"><BrandLogo /></div>
                <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                    <Loader2 className="h-6 w-6 shrink-0 animate-spin text-primary" aria-hidden />
                    <p className="text-sm font-medium">Đang tải trạng thái đơn đăng ký…</p>
                </div>
            </div>
        );
    }

    if (statusError) {
        return (
            <div className={shellClass}>
                <div className="mb-8"><BrandLogo /></div>
                <div className="w-full max-w-lg rounded-xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900/40 dark:bg-neutral-900">
                    <p className="text-sm text-red-600 dark:text-red-400">{statusError}</p>
                    <div className="mt-4 flex gap-3">
                        <Button onClick={() => void loadApplicationStatus()}>Thử lại</Button>
                        <Link to="/feed">
                            <Button variant="outline">Về bảng tin</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (isAlreadySeller) {
        return (
            <div className={shellClass}>
                <div className="mb-8"><BrandLogo /></div>
                <div className="w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Bạn đã là người bán</h1>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                        Tài khoản của bạn đã có quyền bán hàng. Vào trung tâm người bán để quản lý cửa hàng.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link to="/seller/dashboard">
                            <Button>Trung tâm người bán</Button>
                        </Link>
                        <Link to="/feed">
                            <Button variant="outline">Về bảng tin</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (applicationStatus?.status === "REVIEWING") {
        return (
            <div className={shellClass}>
                <div className="mb-8"><BrandLogo /></div>
                <div className="w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Clock className="h-6 w-6" aria-hidden />
                    </div>
                    <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Đang chờ duyệt</h1>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                        Đơn đăng ký bán hàng của bạn đã được gửi và đang được quản trị viên xem xét. 
                        Bạn sẽ nhận được thông báo khi có kết quả. Nếu bạn muốn sửa đơn, có thể thu hồi đơn 
                        hiện tại và gửi đơn mới (quản trị viên sẽ không còn thấy bản đã thu hồi).
                    </p>
                    {withdrawError && (
                        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {withdrawError}
                        </p>
                    )}
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                        <Link to="/feed"><Button>Về bảng tin</Button></Link>
                        <Button
                            variant="destructive"
                            disabled={withdrawLoading}
                            onClick={() => void handleWithdrawReviewingApplication()}
                        >
                            {withdrawLoading ? "Đang thu hồi…" : "Thu hồi đơn và đăng ký lại"}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
