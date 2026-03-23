import type { SellerApplicationAdmin } from "@/features/seller-applications/api/sellerAdminApi";
import { DetailRow } from "@/features/seller-applications/components/detail/DetailRow";
import { Section } from "@/features/seller-applications/components/detail/Section";
import { formatDateTime } from "@/features/seller-applications/utils/formatDateTime";

export function PersonalStepSection({
    detail,
}: {
    detail: SellerApplicationAdmin;
}) {
    return (
        <Section title="Personal (step 1)">
            <DetailRow label="Step 1 done">
                {detail.step1Completed ? "Yes" : "No"}
            </DetailRow>
            <DetailRow label="ID number (masked)">
                {detail.idCardNumber ?? "—"}
            </DetailRow>
            <DetailRow label="Date of birth">
                {detail.dateOfBirth
                    ? formatDateTime(detail.dateOfBirth)
                    : "—"}
            </DetailRow>
            <DetailRow label="Address">{detail.address ?? "—"}</DetailRow>
        </Section>
    );
}
