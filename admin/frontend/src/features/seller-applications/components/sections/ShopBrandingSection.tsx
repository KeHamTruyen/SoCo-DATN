import type { SellerApplicationUser } from "@/features/seller-applications/api/sellerAdminApi";
import { Section } from "@/features/seller-applications/components/detail/Section";

function pickBrandingUrl(
    primary: string | null | undefined,
    shop: Record<string, unknown> | null | undefined,
    key: "shopLogoUrl" | "shopCoverUrl",
): string | null {
    if (primary && String(primary).trim()) return primary;
    const v = shop?.[key];
    return typeof v === "string" && v.trim() ? v : null;
}

export function ShopBrandingSection({ user }: { user?: SellerApplicationUser }) {
    const shop = user?.shopInformation;
    const logoUrl = pickBrandingUrl(user?.avatarUrl ?? null, shop, "shopLogoUrl");
    const coverUrl = pickBrandingUrl(user?.coverImage ?? null, shop, "shopCoverUrl");

    if (!logoUrl && !coverUrl) {
        return (
            <Section title="Shop branding">
                <p className="text-sm text-muted-foreground">
                    No shop logo or cover image submitted.
                </p>
            </Section>
        );
    }

    return (
        <Section title="Shop branding">
            <div className="space-y-4">
                <div>
                    <p className="mb-1 text-xs text-muted-foreground">
                        Shop logo
                    </p>
                    {logoUrl ? (
                        <a
                            href={logoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block"
                        >
                            <img
                                src={logoUrl}
                                alt="Shop logo"
                                className="h-16 w-16 rounded-lg border border-border object-cover"
                            />
                        </a>
                    ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                    )}
                </div>
                <div>
                    <p className="mb-1 text-xs text-muted-foreground">
                        Cover photo
                    </p>
                    {coverUrl ? (
                        <a
                            href={coverUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block"
                        >
                            <img
                                src={coverUrl}
                                alt="Shop cover"
                                className="max-h-40 w-full max-w-xl rounded-lg border border-border object-cover"
                            />
                        </a>
                    ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                    )}
                </div>
            </div>
        </Section>
    );
}
