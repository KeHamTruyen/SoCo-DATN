import type { SellerApplicationAdmin } from "@/features/seller-applications/api/sellerAdminApi";
import { ApplicantSection } from "@/features/seller-applications/components/sections/ApplicantSection";
import { BankStepSection } from "@/features/seller-applications/components/sections/BankStepSection";
import { BusinessStepSection } from "@/features/seller-applications/components/sections/BusinessStepSection";
import { IdDocumentsSection } from "@/features/seller-applications/components/sections/IdDocumentsSection";
import { PersonalStepSection } from "@/features/seller-applications/components/sections/PersonalStepSection";
import { ShopBrandingSection } from "@/features/seller-applications/components/sections/ShopBrandingSection";
import { ShopProfileSection } from "@/features/seller-applications/components/sections/ShopProfileSection";
import { VerificationStatusSection } from "@/features/seller-applications/components/sections/VerificationStatusSection";

type Props = {
    detail: SellerApplicationAdmin;
    onClose: () => void;
    onRequestApprove: () => void;
    onRequestReject: () => void;
};

export function SellerApplicationDetailModal({
    detail,
    onClose,
    onRequestApprove,
    onRequestReject,
}: Props) {
    const reviewing = detail.status === "REVIEWING";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            role="presentation"
            onClick={onClose}
        >
            <div
                className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-lg"
                role="dialog"
                aria-labelledby="seller-app-detail-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
                    <div>
                        <h2
                            id="seller-app-detail-title"
                            className="text-lg font-bold text-foreground"
                        >
                            Seller application
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {detail.user?.fullName || detail.user?.username} ·{" "}
                            {detail.user?.email}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold text-foreground hover:bg-muted"
                    >
                        Close
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                    <div className="space-y-8">
                        <ApplicantSection user={detail.user} />
                        <ShopBrandingSection user={detail.user} />
                        <ShopProfileSection
                            shopInformation={detail.user?.shopInformation}
                        />
                        <VerificationStatusSection detail={detail} />
                        <PersonalStepSection detail={detail} />
                        <IdDocumentsSection detail={detail} />
                        <BusinessStepSection detail={detail} />
                        <BankStepSection detail={detail} />
                    </div>
                </div>

                {reviewing ? (
                    <div className="flex flex-wrap justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
                        <button
                            type="button"
                            onClick={onRequestApprove}
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                        >
                            Approve
                        </button>
                        <button
                            type="button"
                            onClick={onRequestReject}
                            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
                        >
                            Reject
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
