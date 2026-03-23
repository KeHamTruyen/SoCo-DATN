import type { SellerApplicationAdmin } from "@/features/seller-applications/api/sellerAdminApi";
import { DetailRow } from "@/features/seller-applications/components/detail/DetailRow";
import { Section } from "@/features/seller-applications/components/detail/Section";

export function BusinessStepSection({
    detail,
}: {
    detail: SellerApplicationAdmin;
}) {
    return (
        <Section title="Business (step 2)">
            <DetailRow label="Step 2 done">
                {detail.step2Completed ? "Yes" : "No"}
            </DetailRow>
            <DetailRow label="Business name">
                {detail.businessName ?? "—"}
            </DetailRow>
            <DetailRow label="Business type">
                {detail.businessType ?? "—"}
            </DetailRow>
            <DetailRow label="License number">
                {detail.businessLicenseNumber ?? "—"}
            </DetailRow>
            <DetailRow label="Tax code">{detail.taxCode ?? "—"}</DetailRow>
            {detail.businessLicenseUrl ? (
                <DetailRow label="License file">
                    <a
                        href={detail.businessLicenseUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                    >
                        Open link
                    </a>
                </DetailRow>
            ) : null}
        </Section>
    );
}
