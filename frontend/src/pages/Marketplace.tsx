import { useTranslation } from "react-i18next";
import { MarketplaceCategoryPills } from "../features/marketplace/components/MarketplaceCategoryPills";
import { MarketplaceHero } from "../features/marketplace/components/MarketplaceHero";
import { MarketplaceSidebar } from "../features/marketplace/components/MarketplaceSidebar";
import { MarketplaceSortMenu } from "../features/marketplace/components/MarketplaceSortMenu";
import { SearchResults } from "../features/marketplace/components/SearchResults";
import { useMarketplacePage } from "../features/marketplace/hooks/useMarketplacePage";
import { UnifiedHeader } from "../shared/ui";

export default function Marketplace() {
    const { t } = useTranslation();
    const {
        filterParams,
        draftQ,
        categories,
        minInputValue,
        maxSliderValue,
        activeTag,
        tags,
        useRecommendationFeed,
        items,
        isLoading,
        error,
        isLoadingMore,
        hasMore,
        handleSearchInput,
        patchSearchParams,
        handleApplyPrice,
        handleTagClick,
        handleLoadMore,
    } = useMarketplacePage();

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <UnifiedHeader
                navItems={[
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                ]}
                activePath="/marketplace"
                searchValue={draftQ}
                onSearch={handleSearchInput}
            />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-12 flex flex-col items-center space-y-6">
                    <MarketplaceHero value={draftQ} onChange={handleSearchInput} />
                    <MarketplaceCategoryPills
                        value={filterParams.categoryId}
                        options={categories}
                        onChange={(categoryId) => patchSearchParams({ categoryId })}
                    />
                </div>

                <div className="flex flex-col gap-8 lg:flex-row">
                    <MarketplaceSidebar
                        minPriceValue={minInputValue}
                        maxPriceValue={maxSliderValue}
                        ratingFilter={filterParams.ratingFilter}
                        onApplyPrice={handleApplyPrice}
                        onRatingFilterChange={(ratingFilter) =>
                            patchSearchParams({ ratingFilter })
                        }
                        tags={tags}
                        activeTag={activeTag}
                        onTagClick={handleTagClick}
                    />

                    <div className="min-w-0 flex-1 space-y-6">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <h2
                                id="marketplace-products"
                                className="text-xl font-bold scroll-mt-24"
                            >
                                {useRecommendationFeed
                                    ? t("marketplace.recommendedProducts")
                                    : t("marketplace.allProducts")}
                            </h2>
                            <MarketplaceSortMenu
                                className="sm:ml-auto"
                                value={filterParams.sort ?? "relevance"}
                                onChange={(sort) => patchSearchParams({ sort })}
                            />
                        </div>
                        <SearchResults
                            items={items}
                            isLoading={isLoading}
                            error={error}
                            isLoadingMore={isLoadingMore}
                            hasMore={hasMore}
                            onLoadMore={handleLoadMore}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
