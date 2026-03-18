import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { marketplaceApi } from "../features/marketplace/api/marketplaceApi";
import { ProductFilterBar } from "../features/marketplace/components/ProductFilterBar";
import { SearchResults } from "../features/marketplace/components/SearchResults";
import type { ProductQueryParams } from "../features/marketplace/types/marketplace.types";
import { Button, UnifiedHeader } from "../shared/ui";

export default function Marketplace() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [items, setItems] = useState<
        Awaited<ReturnType<typeof marketplaceApi.listProducts>>["items"]
    >([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const params = useMemo<ProductQueryParams>(() => {
        const rawPage = Number(searchParams.get("page") ?? "1");
        return {
            q: searchParams.get("q") ?? undefined,
            category: searchParams.get("category") ?? undefined,
            sort:
                (searchParams.get("sort") as ProductQueryParams["sort"] | null) ??
                "newest",
            page: Number.isFinite(rawPage) ? Math.max(1, rawPage) : 1,
            pageSize: 12,
        };
    }, [searchParams]);

    useEffect(() => {
        let mounted = true;
        void (async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await marketplaceApi.listProducts(params);
                if (!mounted) return;
                setItems(data.items);
                setTotal(data.total);
            } catch {
                if (!mounted) return;
                setError("Unable to load marketplace products.");
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [params]);

    const updateParams = (next: ProductQueryParams) => {
        const nextSearch = new URLSearchParams();
        if (next.q) nextSearch.set("q", next.q);
        if (next.category) nextSearch.set("category", next.category);
        if (next.sort) nextSearch.set("sort", next.sort);
        nextSearch.set("page", String(next.page ?? 1));
        setSearchParams(nextSearch);
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <UnifiedHeader
                navItems={[
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                ]}
                activePath="/marketplace"
            />
            <main className="mx-auto w-full max-w-[1200px] space-y-4 px-4 py-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        Marketplace
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {total} products found
                    </p>
                </div>

                <ProductFilterBar params={params} onChange={updateParams} />
                <SearchResults items={items} isLoading={isLoading} error={error} />

                <div className="flex items-center justify-center gap-2 py-2">
                    <Button
                        variant="outline"
                        disabled={(params.page ?? 1) <= 1}
                        onClick={() =>
                            updateParams({
                                ...params,
                                page: Math.max(1, (params.page ?? 1) - 1),
                            })
                        }
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        Page {params.page ?? 1}
                    </span>
                    <Button
                        variant="outline"
                        disabled={items.length < (params.pageSize ?? 12)}
                        onClick={() =>
                            updateParams({
                                ...params,
                                page: (params.page ?? 1) + 1,
                            })
                        }
                    >
                        Next
                    </Button>
                </div>
            </main>
        </div>
    );
}

