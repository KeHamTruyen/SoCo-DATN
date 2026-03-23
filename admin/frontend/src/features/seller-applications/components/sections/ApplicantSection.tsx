import type { SellerApplicationUser } from "@/features/seller-applications/api/sellerAdminApi";
import { DetailRow } from "@/features/seller-applications/components/detail/DetailRow";
import { Section } from "@/features/seller-applications/components/detail/Section";

export function ApplicantSection({ user }: { user?: SellerApplicationUser }) {
    return (
        <Section title="Applicant">
            <DetailRow label="Username">{user?.username ?? "—"}</DetailRow>
            <DetailRow label="Full name">{user?.fullName ?? "—"}</DetailRow>
            <DetailRow label="Email">{user?.email ?? "—"}</DetailRow>
            <DetailRow label="Phone">{user?.phone ?? "—"}</DetailRow>
        </Section>
    );
}
