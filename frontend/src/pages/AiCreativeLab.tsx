import { useTranslation } from "react-i18next";
import { UnifiedHeader } from "../shared/ui";
import { AiStudioProvider } from "../features/ai/context/AiStudioContext";
import { AiStudioSidebar } from "../features/ai/components/studio/AiStudioSidebar";
import { AiStudioConfigPanel } from "../features/ai/components/studio/AiStudioConfigPanel";
import { AiStudioOutputPanel } from "../features/ai/components/studio/AiStudioOutputPanel";
import { AiStudioScheduleModal } from "../features/ai/components/studio/AiStudioScheduleModal";

import "react-day-picker/style.css";

function AiCreativeLabContent() {
    const { t } = useTranslation();
    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <UnifiedHeader
                navItems={[
                    { label: t("messaging.navFeed"), to: "/feed" },
                    { label: t("messaging.navMarketplace"), to: "/marketplace" },
                ]}
                activePath="/feed"
            />

            <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col lg:flex-row">
                <AiStudioSidebar />

                <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
                    <AiStudioConfigPanel />
                    <AiStudioOutputPanel />
                </div>
            </div>

            <AiStudioScheduleModal />
        </div>
    );
}

export default function AiCreativeLab() {
    return (
        <AiStudioProvider>
            <AiCreativeLabContent />
        </AiStudioProvider>
    );
}
