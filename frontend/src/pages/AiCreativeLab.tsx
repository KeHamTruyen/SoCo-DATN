import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AiStudioProvider } from "../features/ai/context/AiStudioContext";
import {
    AiStudioSidebar,
    type CreativeLabMainTab,
} from "../features/ai/components/studio/AiStudioSidebar";
import { AiStudioConfigPanel } from "../features/ai/components/studio/AiStudioConfigPanel";
import { AiStudioOutputPanel } from "../features/ai/components/studio/AiStudioOutputPanel";
import { AiStudioScheduleModal } from "../features/ai/components/studio/AiStudioScheduleModal";
import { AiLibraryPanel } from "../features/ai/components/library/AiLibraryPanel";

import "react-day-picker/style.css";

function AiCreativeLabContent() {
    const [searchParams, setSearchParams] = useSearchParams();

    const activeTab: CreativeLabMainTab = useMemo(
        () => (searchParams.get("tab") === "library" ? "library" : "studio"),
        [searchParams],
    );

    const switchToStudioTab = useCallback(() => {
        setSearchParams({}, { replace: true });
    }, [setSearchParams]);

    const onSelectTab = useCallback(
        (tab: CreativeLabMainTab) => {
            if (tab === "library") {
                setSearchParams({ tab: "library" }, { replace: true });
            } else {
                setSearchParams({}, { replace: true });
            }
        },
        [setSearchParams],
    );

    return (
        <AiStudioProvider onSwitchToStudioTab={switchToStudioTab}>
            <div className="flex min-h-0 flex-1 flex-col">
                <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col lg:flex-row">
                    <AiStudioSidebar activeTab={activeTab} onSelectTab={onSelectTab} />

                    {activeTab === "studio" ? (
                        <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
                            <AiStudioConfigPanel />
                            <AiStudioOutputPanel />
                        </div>
                    ) : (
                        <AiLibraryPanel />
                    )}
                </div>

                <AiStudioScheduleModal />
            </div>
        </AiStudioProvider>
    );
}

export default function AiCreativeLab() {
    return <AiCreativeLabContent />;
}
