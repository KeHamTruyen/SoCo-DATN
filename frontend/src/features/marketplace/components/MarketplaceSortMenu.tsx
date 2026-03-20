import { Check, ChevronDown } from "lucide-react";
import {
    useCallback,
    useEffect,
    useId,
    useRef,
    useState,
} from "react";
import { cn } from "../../../shared/lib/cn";
import type { ProductQueryParams } from "../types/marketplace.types";

export type MarketplaceSortValue = NonNullable<ProductQueryParams["sort"]>;

const SORT_OPTIONS: { value: MarketplaceSortValue; label: string }[] = [
    { value: "popular", label: "Popular" },
    { value: "newest", label: "Newest" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
];

interface MarketplaceSortMenuProps {
    value: MarketplaceSortValue;
    onChange: (value: MarketplaceSortValue) => void;
    className?: string;
}

export function MarketplaceSortMenu({ value, onChange, className }: MarketplaceSortMenuProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const listId = useId();
    const activeLabel = SORT_OPTIONS.find((o) => o.value === value)?.label ?? "Newest";

    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) close();
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        document.addEventListener("mousedown", onDoc);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDoc);
            document.removeEventListener("keydown", onKey);
        };
    }, [open, close]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "flex flex-wrap items-center gap-2 text-sm sm:flex-nowrap",
                className,
            )}
        >
            <span className="shrink-0 text-neutral-600 dark:text-neutral-400">Sort by:</span>
            <div className="relative min-w-0 flex-1 sm:min-w-50 sm:flex-initial">
                <button
                    type="button"
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    aria-controls={listId}
                    onClick={() => setOpen((v) => !v)}
                    className={cn(
                        "flex h-10 w-full min-w-50 items-center justify-between gap-2 rounded-xl border px-3.5 text-left text-sm font-semibold shadow-sm transition-colors",
                        "border-neutral-200 bg-white text-neutral-900",
                        "hover:border-primary/40 hover:bg-neutral-50",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                        "dark:border-neutral-700 dark:bg-neutral-800/90 dark:text-neutral-100",
                        "dark:hover:border-primary/50 dark:hover:bg-neutral-800",
                        "dark:focus-visible:ring-offset-neutral-950",
                        open && "border-primary/50 ring-2 ring-primary/20 dark:border-primary/40",
                    )}
                >
                    <span className="truncate">{activeLabel}</span>
                    <ChevronDown
                        className={cn(
                            "h-4 w-4 shrink-0 text-neutral-500 transition-transform dark:text-neutral-400",
                            open && "rotate-180",
                        )}
                        aria-hidden
                    />
                </button>

                {open ? (
                    <ul
                        id={listId}
                        role="listbox"
                        aria-label="Sort products by"
                        className={cn(
                            "absolute left-0 right-0 top-full z-50 mt-1 max-h-[min(50vh,320px)] overflow-y-auto overflow-x-hidden rounded-xl border py-1 shadow-lg",
                            "border-neutral-200 bg-white",
                            "dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-neutral-950/50",
                        )}
                    >
                    {SORT_OPTIONS.map((opt) => {
                        const selected = opt.value === value;
                        return (
                            <li key={opt.value} role="presentation">
                                <button
                                    type="button"
                                    id={`${listId}-${opt.value}`}
                                    role="option"
                                    aria-selected={selected}
                                    onClick={() => {
                                        onChange(opt.value);
                                        close();
                                    }}
                                    className={cn(
                                        "flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm transition-colors",
                                        selected
                                            ? "bg-primary/10 font-semibold text-primary dark:bg-primary/15 dark:text-primary-400"
                                            : "font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800",
                                    )}
                                >
                                    <span className="flex-1">{opt.label}</span>
                                    {selected ? (
                                        <Check className="h-4 w-4 shrink-0 text-primary dark:text-primary-400" />
                                    ) : (
                                        <span className="h-4 w-4 shrink-0" aria-hidden />
                                    )}
                                </button>
                            </li>
                        );
                    })}
                    </ul>
                ) : null}
            </div>
        </div>
    );
}
