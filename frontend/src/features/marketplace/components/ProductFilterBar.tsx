import { Search } from "lucide-react";
import type { ProductQueryParams } from "../types/marketplace.types";

interface ProductFilterBarProps {
    params: ProductQueryParams;
    onChange: (next: ProductQueryParams) => void;
}

export function ProductFilterBar({ params, onChange }: ProductFilterBarProps) {
    return (
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 md:grid-cols-4">
            <div className="relative md:col-span-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                    value={params.q ?? ""}
                    onChange={(e) => onChange({ ...params, q: e.target.value, page: 1 })}
                    placeholder="Search products..."
                    className="h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800"
                />
            </div>
            <select
                value={params.category ?? ""}
                onChange={(e) => onChange({ ...params, category: e.target.value || undefined, page: 1 })}
                className="h-10 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800"
            >
                <option value="">All categories</option>
                <option value="fashion">Fashion</option>
                <option value="electronics">Electronics</option>
                <option value="home">Home</option>
            </select>
            <select
                value={params.sort ?? "newest"}
                onChange={(e) =>
                    onChange({
                        ...params,
                        sort: e.target.value as ProductQueryParams["sort"],
                        page: 1,
                    })
                }
                className="h-10 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800"
            >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to high</option>
                <option value="price_desc">Price: High to low</option>
            </select>
        </div>
    );
}
