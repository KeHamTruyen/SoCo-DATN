import type { SellerApplicationAdmin } from "@/features/seller-applications/api/sellerAdminApi";
import { DetailRow } from "@/features/seller-applications/components/detail/DetailRow";
import { Section } from "@/features/seller-applications/components/detail/Section";
import { formatDateTime } from "@/features/seller-applications/utils/formatDateTime";

export function VerificationStatusSection({
    detail,
}: {
    detail: SellerApplicationAdmin;
}) {
    return (
        <Section title="Verification status">
            <DetailRow label="Status">{detail.status}</DetailRow>
            <DetailRow label="Submitted">
                {formatDateTime(detail.createdAt)}
            </DetailRow>
            <DetailRow label="Updated">
                {formatDateTime(detail.updatedAt)}
            </DetailRow>
            <DetailRow label="Verified at">
                {formatDateTime(detail.verifiedAt)}
            </DetailRow>
            {detail.rejectionReason ? (
                <DetailRow label="Rejection reason">
                    {detail.rejectionReason}
                </DetailRow>
            ) : null}
        </Section>
    );
}
