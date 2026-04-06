import { useState } from "react";

export type GroupTab = "discussion" | "members" | "products" | "media";

export const GROUP_TABS: { value: GroupTab; label: string }[] = [
    { value: "discussion", label: "Discussion" },
    { value: "members", label: "Members" },
    { value: "products", label: "Group Products" },
    { value: "media", label: "Media" },
];

export function useGroupTabs(defaultTab: GroupTab = "discussion") {
    const [activeTab, setActiveTab] = useState<GroupTab>(defaultTab);

    return {
        activeTab,
        setActiveTab,
    };
}
