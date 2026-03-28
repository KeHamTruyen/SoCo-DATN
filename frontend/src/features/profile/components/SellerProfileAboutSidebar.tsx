import { Briefcase, Info, Link2, Share2 } from "lucide-react";
import { Button } from "../../../shared/ui/atoms/button";
import type { PublicUserProfile } from "../types/profile.types";
import { useTranslation } from "react-i18next";

interface SellerProfileAboutSidebarProps {
    profile: PublicUserProfile;
}

export function SellerProfileAboutSidebar({ profile }: SellerProfileAboutSidebarProps) {
    const { t } = useTranslation();
    const shop = profile.shopInformation;

    return (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-foreground">
                <Info className="h-5 w-5 text-primary" />
                {t("profile.about")}
            </h3>
            <div className="space-y-4 text-sm text-muted-foreground">
                {shop?.shopDescription ? (
                    <p className="leading-relaxed text-foreground/90">{shop.shopDescription}</p>
                ) : profile.bio ? (
                    <p className="leading-relaxed text-foreground/90">{profile.bio}</p>
                ) : null}
                {shop?.shopCategory ? (
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 shrink-0" />
                        <span>{shop.shopCategory}</span>
                    </div>
                ) : null}
                {shop?.shopAddress ? <p className="leading-relaxed">{shop.shopAddress}</p> : null}
                {shop?.contactPhone ? (
                    <p className="tabular-nums">{shop.contactPhone}</p>
                ) : null}
                <div className="flex gap-2 pt-2">
                    <Button type="button" variant="outline" size="icon" className="rounded-lg" disabled>
                        <Share2 className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="outline" size="icon" className="rounded-lg" disabled>
                        <Link2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
