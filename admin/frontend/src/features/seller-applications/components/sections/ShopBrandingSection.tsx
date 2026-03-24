import type { SellerApplicationAdmin } from "@/features/seller-applications/api/sellerAdminApi";
import { Section } from "@/features/seller-applications/components/detail/Section";

function firstNonEmpty(
    preferred: string | null | undefined,
    fallback: string | null | undefined,
): string | null {
    if (preferred && String(preferred).trim()) return String(preferred).trim();
    if (fallback && String(fallback).trim()) return String(fallback).trim();
    return null;
}

export function ShopBrandingSection({ detail }: { detail: SellerApplicationAdmin }) {
    const user = detail.user;
    const logoUrl = firstNonEmpty(detail.shopLogoUrl, user?.avatarUrl ?? null);
    const coverUrl = firstNonEmpty(detail.shopCoverUrl, user?.coverImage ?? null);

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
