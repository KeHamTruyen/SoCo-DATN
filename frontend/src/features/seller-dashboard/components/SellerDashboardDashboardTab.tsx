import { SellerDashboardChartsPanel } from "./SellerDashboardChartsPanel";
import { SellerDashboardStats } from "../../profile/components/SellerDashboardStats";
import type { SellerStats } from "../../profile/types/profile.types";

interface SellerDashboardDashboardTabProps {
    stats: SellerStats;
}

export function SellerDashboardDashboardTab({
    stats,
}: SellerDashboardDashboardTabProps) {
    return (
        <div className="space-y-8">
            <SellerDashboardStats stats={stats} />
            <SellerDashboardChartsPanel stats={stats} />
        </div>
    );
}
