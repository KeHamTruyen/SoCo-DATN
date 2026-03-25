import { useCallback, useRef, type KeyboardEvent } from "react";
import { cn } from "../../../shared/lib/cn";
import {
    SELLER_CENTER_TABS,
    type SellerCenterTab,
} from "../sellerDashboardTabs";

interface SellerDashboardTabBarProps {
    tab: SellerCenterTab;
    onTabChange: (next: SellerCenterTab) => void;
}

export function SellerDashboardTabBar({
    tab,
    onTabChange,
}: SellerDashboardTabBarProps) {
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const focusTabAt = useCallback((index: number) => {
        const el = tabRefs.current[index];
        if (el) el.focus();
    }, []);

    const handleTabKeyDown = useCallback(
        (index: number, e: KeyboardEvent<HTMLButtonElement>) => {
            const last = SELLER_CENTER_TABS.length - 1;
            if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                const next = index === last ? 0 : index + 1;
                onTabChange(SELLER_CENTER_TABS[next].value);
                queueMicrotask(() => focusTabAt(next));
            } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                const prev = index === 0 ? last : index - 1;
                onTabChange(SELLER_CENTER_TABS[prev].value);
                queueMicrotask(() => focusTabAt(prev));
            } else if (e.key === "Home") {
                e.preventDefault();
                onTabChange(SELLER_CENTER_TABS[0].value);
                queueMicrotask(() => focusTabAt(0));
            } else if (e.key === "End") {
                e.preventDefault();
                onTabChange(SELLER_CENTER_TABS[last].value);
                queueMicrotask(() => focusTabAt(last));
            }
        },
        [focusTabAt, onTabChange],
    );

    return (
        <div
            role="tablist"
            aria-label="Khu vực người bán"
            className="no-scrollbar flex gap-6 overflow-x-auto border-b border-neutral-200 dark:border-neutral-800"
        >
            {SELLER_CENTER_TABS.map((t, index) => {
                const selected = tab === t.value;
                return (
                    <button
                        key={t.value}
                        ref={(el) => {
                            tabRefs.current[index] = el;
                        }}
                        id={`seller-tab-${t.value}`}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        aria-controls="seller-dashboard-tabpanel"
                        tabIndex={selected ? 0 : -1}
                        onClick={() => onTabChange(t.value)}
                        onKeyDown={(e) => handleTabKeyDown(index, e)}
                        className={cn(
                            "whitespace-nowrap border-b-2 pb-4 text-sm transition-colors",
                            selected
                                ? "border-primary font-bold text-primary"
                                : "border-transparent font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300",
                        )}
                    >
                        {t.label}
                    </button>
                );
            })}
        </div>
    );
}
