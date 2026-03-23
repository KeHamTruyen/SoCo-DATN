import { DetailRow } from "@/features/seller-applications/components/detail/DetailRow";
import { Section } from "@/features/seller-applications/components/detail/Section";
import { shopInfoEntries } from "@/features/seller-applications/utils/shopInfoEntries";

export function ShopProfileSection({
    shopInformation,
}: {
    shopInformation?: Record<string, unknown> | null;
}) {
    const entries = shopInfoEntries(shopInformation ?? undefined);
    if (entries.length === 0) return null;

    return (
        <Section title="Shop (profile)">
            {entries.map(([label, val]) => (
                <DetailRow key={label} label={label}>
                    {val || "—"}
                </DetailRow>
            ))}
        </Section>
    );
}
