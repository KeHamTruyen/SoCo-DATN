import { UnifiedHeader } from "../shared/ui";
import { AiStudioProvider } from "../features/ai/context/AiStudioContext";
import { AiStudioSidebar } from "../features/ai/components/studio/AiStudioSidebar";
import { AiStudioConfigPanel } from "../features/ai/components/studio/AiStudioConfigPanel";
import { AiStudioOutputPanel } from "../features/ai/components/studio/AiStudioOutputPanel";
import { AiStudioScheduleModal } from "../features/ai/components/studio/AiStudioScheduleModal";

import "react-day-picker/style.css";

export default function AiCreativeLab() {
    return (
        <AiStudioProvider>
            <div className="flex min-h-0 flex-1 flex-col">
                <UnifiedHeader
                    navItems={[
                        { label: "Feed", to: "/feed" },
                        { label: "Marketplace", to: "/marketplace" },
                    ]}
                    activePath="/feed"
                />

                <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col lg:flex-row">
                    <AiStudioSidebar />

                    {/* Main workspace */}
                    <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
                        <AiStudioConfigPanel />
                        <AiStudioOutputPanel />
                    </div>
                </div>

                <AiStudioScheduleModal />
            </div>
        </AiStudioProvider>
    );
}
