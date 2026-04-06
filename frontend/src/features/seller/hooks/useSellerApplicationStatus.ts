import { useState, useCallback, useEffect } from "react";
import { sellerApi } from "../../seller/api/sellerApi";
import type { SellerApplicationStatus } from "../../seller/types/seller.types";
import { HttpError } from "../../../shared/api/httpClient";

export function useSellerApplicationStatus() {
    const [applicationStatus, setApplicationStatus] = useState<SellerApplicationStatus | null>(null);
    const [statusLoading, setStatusLoading] = useState(true);
    const [statusError, setStatusError] = useState<string | null>(null);

    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [withdrawError, setWithdrawError] = useState<string | null>(null);

    const loadApplicationStatus = useCallback(async () => {
        setStatusLoading(true);
        setStatusError(null);
        try {
            const s = await sellerApi.getApplicationStatus();
            setApplicationStatus(s);
        } catch (e) {
            setStatusError(
                e instanceof Error ? e.message : "Không tải được trạng thái đơn."
            );
        } finally {
            setStatusLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadApplicationStatus();
    }, [loadApplicationStatus]);

    const handleWithdrawReviewingApplication = useCallback(async () => {
        setWithdrawError(null);
        const ok = window.confirm(
            "Thu hồi đơn đang chờ duyệt? Toàn bộ dữ liệu trong đơn sẽ bị xóa và bạn có thể điền đơn mới. Ảnh đại diện/bìa trên hồ sơ (nếu đã cập nhật khi đăng ký) sẽ không tự động đổi lại.",
        );
        if (!ok) return;

        setWithdrawLoading(true);
        try {
            await sellerApi.withdrawReviewingApplication();
            await loadApplicationStatus();
        } catch (e) {
            const msg =
                e instanceof HttpError
                    ? e.message
                    : e instanceof Error
                      ? e.message
                      : "Không thể thu hồi đơn.";
            setWithdrawError(msg);
        } finally {
            setWithdrawLoading(false);
        }
    }, [loadApplicationStatus]);

    return {
        applicationStatus,
        statusLoading,
        statusError,
        withdrawLoading,
        withdrawError,
        loadApplicationStatus,
        handleWithdrawReviewingApplication
    };
}
