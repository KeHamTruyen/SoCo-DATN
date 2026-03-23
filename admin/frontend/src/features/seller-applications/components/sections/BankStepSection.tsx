import type { SellerApplicationAdmin } from "@/features/seller-applications/api/sellerAdminApi";
import { DetailRow } from "@/features/seller-applications/components/detail/DetailRow";
import { Section } from "@/features/seller-applications/components/detail/Section";

export function BankStepSection({
    detail,
}: {
    detail: SellerApplicationAdmin;
}) {
    return (
        <Section title="Bank (step 3)">
            <DetailRow label="Step 3 done">
                {detail.step3Completed ? "Yes" : "No"}
            </DetailRow>
            <DetailRow label="Bank">{detail.bankName ?? "—"}</DetailRow>
            <DetailRow label="Account number (masked)">
                {detail.bankAccountNumber ?? "—"}
            </DetailRow>
            <DetailRow label="Account name">
                {detail.bankAccountName ?? "—"}
            </DetailRow>
            <DetailRow label="Branch">{detail.bankBranch ?? "—"}</DetailRow>
        </Section>
    );
}
